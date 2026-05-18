import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { buildRestockEmail } from "./emailTemplate.js";

// Load .env for local runs; GitHub Actions / Railway inject env vars directly
try {
  process.loadEnvFile(fileURLToPath(new URL("../.env", import.meta.url)));
} catch {}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.error("Missing GMAIL_USER / GMAIL_APP_PASSWORD");
  process.exit(1);
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, ""),
  },
});

export const now = () => new Date().toISOString();

export async function verifyTransport() {
  try {
    await transporter.verify();
    console.log(`[${now()}] SMTP OK — ${process.env.GMAIL_USER}`);
    return true;
  } catch (err) {
    console.error(`[${now()}] SMTP FAILED: ${err.message}`);
    return false;
  }
}

async function sendWithRetry(mailOptions, attempts = 3, delayMs = 5000) {
  for (let i = 1; i <= attempts; i++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[${now()}] Email SENT id=${info.messageId}`);
      return info;
    } catch (err) {
      console.error(`[${now()}] Email attempt ${i}/${attempts} FAILED: ${err.message}`);
      if (i < attempts) await new Promise((r) => setTimeout(r, delayMs));
      else throw err;
    }
  }
}

export async function sendTestEmail() {
  await sendWithRetry({
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject: "Stock Watcher — test email",
    text: `Test sent at ${now()}. SMTP is working.`,
  });
}

function jsEndpoint(productUrl) {
  const u = new URL(productUrl);
  u.search = "";
  u.pathname = u.pathname.replace(/\/+$/, "") + ".js";
  return u.toString();
}

async function checkProduct(product, emailTo) {
  const { id, url, handle, watch_sizes, notify_mode } = product;
  const ts = now();
  const want = (watch_sizes ?? []).map((s) => s.toUpperCase());

  if (!want.length) return;

  // Fetch previous state before updating — needed to detect false→true transitions
  const { data: prevRows } = await supabase
    .from("product_state")
    .select("size, available")
    .eq("product_id", id);
  const prevState = Object.fromEntries((prevRows ?? []).map((r) => [r.size, r.available]));

  let data;
  try {
    const res = await fetch(jsEndpoint(url), {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error(`[${ts}] [${handle}] Fetch failed: ${err.message}`);
    return;
  }

  const availBySize = {};
  for (const v of data.variants) {
    const tokens = [v.option1, v.option2, v.option3]
      .filter(Boolean)
      .join(" ")
      .toUpperCase()
      .split(/[^A-Z0-9]+/)
      .filter(Boolean);
    for (const s of want) {
      if (tokens.includes(s)) {
        availBySize[s] = (availBySize[s] || false) || v.available;
      }
    }
  }

  const nowAvailable = [];
  const stateRows = [];
  for (const s of want) {
    if (!(s in availBySize)) continue;
    if (availBySize[s]) nowAvailable.push(s);
    stateRows.push({ product_id: id, size: s, available: availBySize[s], last_checked: ts });
  }

  if (stateRows.length > 0) {
    const { error } = await supabase
      .from("product_state")
      .upsert(stateRows, { onConflict: "product_id,size" });
    if (error) console.error(`[${ts}] [${handle}] State upsert error: ${error.message}`);
  }

  const summary = want
    .map((s) => (s in availBySize ? `${s}=${availBySize[s] ? "YES" : "no"}` : `${s}=n/a`))
    .join("  ");
  console.log(`[${ts}] [${handle}] ${summary} [notify:${notify_mode ?? "once"}]`);

  // 'once': alert only when size transitions false→true (new restock event)
  // 'always': alert on every check while available
  const sizesToAlert = notify_mode === "always"
    ? nowAvailable
    : nowAvailable.filter((s) => prevState[s] !== true);

  if (sizesToAlert.length && emailTo) {
    try {
      const img = data.featured_image ?? data.images?.[0] ?? null;
      const imageUrl = img ? (img.startsWith("//") ? "https:" + img : img) : null;

      const { subject, html, text } = buildRestockEmail({
        productName: data.title,
        availableSizes: sizesToAlert,
        productUrl: url,
        imageUrl,
      });

      await sendWithRetry({
        from: `StockWatch <${process.env.GMAIL_USER}>`,
        to: emailTo,
        subject,
        html,
        text,
      });
    } catch (err) {
      console.error(`[${ts}] [${handle}] ALERT EMAIL FAILED: ${err.message}`);
    }
  }
}

export const INTERVAL_MINUTES = 10;

export async function check() {
  const ts = now();
  const nowMs = Date.now();

  const { data: allSettings, error: sErr } = await supabase
    .from("user_settings")
    .select("user_id, email_to, last_run_at");
  if (sErr) { console.error(`[${ts}] Settings fetch error: ${sErr.message}`); return; }

  const dueSettings = (allSettings ?? []).filter((s) => {
    if (!s.last_run_at) return true;
    const elapsedMin = (nowMs - new Date(s.last_run_at).getTime()) / 60000;
    return elapsedMin >= INTERVAL_MINUTES;
  });

  if (!dueSettings.length) {
    console.log(`[${ts}] No users due for check.`);
    return;
  }

  const dueUserIds = dueSettings.map((s) => s.user_id);
  const emailByUser = Object.fromEntries(dueSettings.map((s) => [s.user_id, s.email_to]));

  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("id, url, handle, watch_sizes, user_id, notify_mode")
    .eq("is_paused", false)
    .in("user_id", dueUserIds);
  if (pErr) { console.error(`[${ts}] Products fetch error: ${pErr.message}`); return; }

  if (!products?.length) {
    console.log(`[${ts}] No products to check for ${dueUserIds.length} due user(s).`);
  } else {
    console.log(`[${ts}] Checking ${products.length} product(s) for ${dueUserIds.length} user(s)...`);
    for (const product of products) {
      await checkProduct(product, emailByUser[product.user_id] || null);
    }
    console.log(`[${ts}] Done.`);
  }

  // Update last_run_at for all due users
  const runAt = new Date(nowMs).toISOString();
  await Promise.all(
    dueUserIds.map((userId) =>
      supabase
        .from("user_settings")
        .update({ last_run_at: runAt })
        .eq("user_id", userId)
        .then(({ error }) => {
          if (error) console.error(`[${ts}] last_run_at update failed for ${userId}: ${error.message}`);
        })
    )
  );

  console.log(`[${ts}] Checked ${dueUserIds.length} user(s) @${INTERVAL_MINUTES}min interval.`);
}
