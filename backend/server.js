import express from "express";
import { check, getMinIntervalMinutes, verifyTransport, now } from "./lib/checker.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const TRIGGER_SECRET = process.env.TRIGGER_SECRET;
const MIN_INTERVAL_MS = 60_000; // hard floor: 1 minute

let scheduleTimer = null;
let lastCheckAt = null;
let nextCheckAt = null;
let currentIntervalMin = null;

async function scheduleNext() {
  const intervalMin = await getMinIntervalMinutes();
  const intervalMs = Math.max(MIN_INTERVAL_MS, intervalMin * 60_000);
  currentIntervalMin = intervalMin;
  nextCheckAt = new Date(Date.now() + intervalMs).toISOString();
  console.log(`[${now()}] Next check in ${intervalMin} min`);
  scheduleTimer = setTimeout(async () => {
    lastCheckAt = now();
    await check().catch((err) => console.error(`[${now()}] Check error: ${err.message}`));
    scheduleNext();
  }, intervalMs);
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    time: now(),
    scheduler: {
      intervalMinutes: currentIntervalMin,
      lastCheckAt,
      nextCheckAt,
    },
  });
});

app.post("/trigger", async (req, res) => {
  if (TRIGGER_SECRET && req.headers["x-trigger-secret"] !== TRIGGER_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  check().catch((err) => console.error(`[${now()}] Trigger error: ${err.message}`));
  res.json({ ok: true, message: "Check started" });
});

const smtpOk = await verifyTransport();
if (!smtpOk) {
  console.error(`[${now()}] WARNING: SMTP not working — emails will fail`);
}

app.listen(PORT, async () => {
  console.log(`[${now()}] Server running on :${PORT}`);
  lastCheckAt = now();
  await check().catch((err) => console.error(`[${now()}] Startup check error: ${err.message}`));
  scheduleNext();
});
