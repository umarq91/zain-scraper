import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

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
  const { id, url, handle, watch_sizes } = product;
  const ts = now();
  const want = (watch_sizes ?? []).map((s) => s.toUpperCase());

  if (!want.length) return;

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
  console.log(`[${ts}] [${handle}] ${summary}`);

  if (nowAvailable.length && emailTo) {
    try {
      await sendWithRetry({
        from: process.env.GMAIL_USER,
        to: emailTo,
        subject: `IN STOCK: size ${nowAvailable.join(", ")} — ${data.title}`,
        text:
          `Size ${nowAvailable.join(", ")} now available.\n\n` +
          `${data.title}\n${url}\n\nBuy fast before it sells out.`,
      });
    } catch (err) {
      console.error(`[${ts}] [${handle}] ALERT EMAIL FAILED: ${err.message}`);
    }
  }
}

export async function check() {
  const ts = now();

  const { data: allSettings, error: sErr } = await supabase
    .from("user_settings")
    .select("user_id, email_to");
  if (sErr) { console.error(`[${ts}] Settings fetch error: ${sErr.message}`); return; }

  const emailByUser = Object.fromEntries(
    (allSettings ?? []).map((s) => [s.user_id, s.email_to])
  );

  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("id, url, handle, watch_sizes, user_id");
  if (pErr) { console.error(`[${ts}] Products fetch error: ${pErr.message}`); return; }

  if (!products?.length) { console.log(`[${ts}] No products to check.`); return; }

  console.log(`[${ts}] Checking ${products.length} product(s)...`);
  for (const product of products) {
    await checkProduct(product, emailByUser[product.user_id] || null);
  }
  console.log(`[${ts}] Done.`);
}
