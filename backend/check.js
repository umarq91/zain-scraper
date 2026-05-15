import { check, verifyTransport, sendTestEmail, now } from "./lib/checker.js";

const TEST_MODE = process.argv.includes("--test");

const smtpOk = await verifyTransport();

if (TEST_MODE) {
  console.log(`[${now()}] Sending test email...`);
  try {
    await sendTestEmail();
    console.log(`[${now()}] Test email delivered.`);
  } catch (err) {
    console.error(`[${now()}] TEST EMAIL FAILED: ${err.message}`);
    process.exitCode = 1;
  }
  process.exit(process.exitCode || 0);
}

if (!smtpOk) {
  console.error(`[${now()}] SMTP failed — aborting.`);
  process.exit(1);
}

await check();
process.exit(process.exitCode || 0);
