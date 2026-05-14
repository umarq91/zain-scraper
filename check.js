import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

// Auto-load .env for local runs. GitHub Actions injects real env vars instead
// and has no .env file — loadEnvFile throws there, which we ignore.
try {
  process.loadEnvFile(fileURLToPath(new URL("./.env", import.meta.url)));
} catch {
  /* no .env file — env vars come from the environment directly */
}

const CONFIG_PATH = new URL("./config.json", import.meta.url);
const STATE_PATH = new URL("./state.json", import.meta.url);

const TEST_MODE = process.argv.includes("--test");
const ONCE_MODE = process.argv.includes("--once");

const now = () => new Date().toISOString();

if (!existsSync(CONFIG_PATH)) {
  console.error("Missing config.json — copy config.example.json to config.json and fill it in.");
  process.exit(1);
}
const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));

// Accept either a "products" array or a single legacy "productUrl".
const productUrls =
  Array.isArray(config.products) && config.products.length
    ? config.products
    : config.productUrl
    ? [config.productUrl]
    : [];

if (!productUrls.length) {
  console.error('config.json needs a "products" array with at least one product URL.');
  process.exit(1);
}

const want = (config.watchSizes || []).map((s) => s.toUpperCase());
if (!want.length) {
  console.error('config.json needs a "watchSizes" array, e.g. ["M","L"].');
  process.exit(1);
}

// Email creds come from env vars (GitHub Actions secrets / local .env) first,
// then config.json as a fallback. Never commit real creds in config.json.
const email = {
  user: process.env.GMAIL_USER || config.email?.user,
  appPassword: process.env.GMAIL_APP_PASSWORD || config.email?.appPassword,
  to: process.env.GMAIL_TO || config.email?.to,
};
if (!email.user || !email.appPassword || !email.to) {
  console.error(
    "Missing email creds. Set GMAIL_USER / GMAIL_APP_PASSWORD / GMAIL_TO as " +
      "env vars (or in a local .env file)."
  );
  process.exit(1);
}

// Shopify exposes a per-variant availability JSON at <product-url>.js
function jsEndpoint(productUrl) {
  const u = new URL(productUrl);
  u.search = "";
  u.pathname = u.pathname.replace(/\/+$/, "") + ".js";
  return u.toString();
}

// Stable key per product for the state file.
function productHandle(productUrl) {
  const u = new URL(productUrl);
  const m = u.pathname.match(/\/products\/([^/]+)/);
  return m ? m[1] : u.pathname;
}

function loadState() {
  if (!existsSync(STATE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(STATE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveState(state) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email.user,
    pass: email.appPassword.replace(/\s+/g, ""),
  },
});

// Check SMTP login/connection up front so bad creds fail loudly at startup
// instead of silently when a size finally comes back in stock.
async function verifyTransport() {
  try {
    await transporter.verify();
    console.log(`[${now()}] SMTP OK — logged in as ${email.user}`);
    return true;
  } catch (err) {
    console.error(`[${now()}] SMTP VERIFY FAILED: ${err.message}`);
    console.error(
      "  -> Check email.user / email.appPassword in config.json. " +
        "Gmail needs a 16-char App Password, not your normal password."
    );
    return false;
  }
}

// Send with retries. Logs every failed attempt; throws only if all attempts fail.
async function sendWithRetry(mailOptions, attempts = 3, delayMs = 5000) {
  for (let i = 1; i <= attempts; i++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(
        `[${now()}] Email SENT (attempt ${i}/${attempts}) ` +
          `id=${info.messageId} accepted=${JSON.stringify(info.accepted)} ` +
          `response=${info.response}`
      );
      return info;
    } catch (err) {
      console.error(`[${now()}] Email attempt ${i}/${attempts} FAILED: ${err.message}`);
      if (err.code) console.error(`  code=${err.code} command=${err.command || "-"}`);
      if (i < attempts) {
        console.error(`  retrying in ${delayMs / 1000}s...`);
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        throw err;
      }
    }
  }
}

async function sendStockEmail(title, sizes, productUrl) {
  const list = sizes.join(", ");
  await sendWithRetry({
    from: email.user,
    to: email.to,
    subject: `IN STOCK: size ${list} — ${title}`,
    text: `Size ${list} now available.\n\n${title}\n${productUrl}\n\nBuy fast before it sells out.`,
  });
}

async function sendTestEmail() {
  console.log(`[${now()}] Sending test email to ${email.to} ...`);
  try {
    await sendWithRetry({
      from: email.user,
      to: email.to,
      subject: "Zaib Stock Watcher — test email",
      text:
        `Test email sent ${now()}.\n\n` +
        `If you got this, alerts will work.\n` +
        `Watching sizes: ${want.join(", ")}\n` +
        `Across ${productUrls.length} product(s):\n` +
        productUrls.map((u) => `  - ${u}`).join("\n"),
    });
    console.log(`[${now()}] Test email delivered. You're good.`);
  } catch (err) {
    console.error(`[${now()}] TEST EMAIL FAILED after all retries: ${err.message}`);
    process.exitCode = 1;
  }
}

// Check one product. Mutates `state` in place; returns nothing.
async function checkProduct(productUrl, state) {
  const ts = now();
  const handle = productHandle(productUrl);

  let data;
  try {
    const res = await fetch(jsEndpoint(productUrl), {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error(`[${ts}] [${handle}] Fetch failed: ${err.message}`);
    return;
  }

  // A size can span several variants (e.g. "M (W/Sleeves)" and
  // "M (Without Sleeves)"), and option values aren't always a bare size.
  // Tokenize each variant's options and treat a size as available if ANY
  // variant carrying that size token is in stock.
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

  const prev = state[handle] || {};
  const cur = {};
  const nowAvailable = [];
  for (const s of want) {
    if (!(s in availBySize)) continue; // size not offered on this product
    const isAvail = availBySize[s];
    if (isAvail && prev[s] !== true) nowAvailable.push(s);
    cur[s] = isAvail; // record current so we only alert on the flip
  }
  state[handle] = cur;

  const summary = want
    .map((s) => (s in availBySize ? `${s}=${availBySize[s] ? "YES" : "no"}` : `${s}=n/a`))
    .join("  ");
  console.log(`[${ts}] [${handle}] ${summary}`);

  if (nowAvailable.length) {
    try {
      await sendStockEmail(data.title, nowAvailable, productUrl);
    } catch (err) {
      // All retries exhausted — log loudly but keep the loop alive. Roll back
      // state for the failed sizes so the next poll re-attempts the email.
      console.error(
        `[${ts}] [${handle}] ALERT EMAIL FAILED for size ${nowAvailable.join(", ")} ` +
          `after all retries: ${err.message}`
      );
      for (const s of nowAvailable) cur[s] = false;
    }
  }
}

async function check() {
  const state = loadState();
  for (const productUrl of productUrls) {
    await checkProduct(productUrl, state);
  }
  saveState(state);
}

// --- startup ---
const smtpOk = await verifyTransport();

if (TEST_MODE) {
  await sendTestEmail();
  process.exit(process.exitCode || 0);
}

if (!smtpOk) {
  console.error(
    `[${now()}] Continuing anyway — emails will fail until creds are fixed.`
  );
}

// GitHub Actions (cron) runs one check and exits. The schedule controls cadence.
if (ONCE_MODE) {
  await check();
  process.exit(process.exitCode || 0);
}

const intervalMs = (config.intervalMinutes || 5) * 60 * 1000;
console.log(
  `Watching ${want.join(", ")} across ${productUrls.length} product(s) ` +
    `every ${config.intervalMinutes || 5} min. Ctrl+C to stop.`
);
await check();
setInterval(check, intervalMs);
