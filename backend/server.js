import express from "express";
import cron from "node-cron";
import { check, verifyTransport, now } from "./lib/checker.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Simple token auth for the trigger endpoint
const TRIGGER_SECRET = process.env.TRIGGER_SECRET;

app.get("/health", (_req, res) => {
  res.json({ ok: true, time: now() });
});

app.post("/trigger", async (req, res) => {
  if (TRIGGER_SECRET && req.headers["x-trigger-secret"] !== TRIGGER_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // Fire and forget — don't wait for check to finish
  check().catch((err) => console.error(`[${now()}] Trigger error: ${err.message}`));
  res.json({ ok: true, message: "Check started" });
});

// Cron: every 5 minutes
cron.schedule("*/5 * * * *", () => {
  console.log(`[${now()}] Cron tick — running check`);
  check().catch((err) => console.error(`[${now()}] Cron error: ${err.message}`));
});

const smtpOk = await verifyTransport();
if (!smtpOk) {
  console.error(`[${now()}] WARNING: SMTP not working — emails will fail`);
}

app.listen(PORT, () => {
  console.log(`[${now()}] Server running on :${PORT}`);
  console.log(`[${now()}] Cron active — checking every 5 minutes`);
});

// Run one check immediately on startup
check().catch((err) => console.error(`[${now()}] Startup check error: ${err.message}`));
