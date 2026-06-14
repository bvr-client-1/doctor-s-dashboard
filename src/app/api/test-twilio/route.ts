import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

export async function GET() {
  console.log("[TestTwilio] GET /api/test-twilio");

  if (!accountSid || !authToken || !fromNumber) {
    console.error("[TestTwilio] Missing env vars:", { accountSid: !!accountSid, authToken: !!authToken, fromNumber: !!fromNumber });
    return NextResponse.json({ success: false, error: "Missing TWILIO env vars" }, { status: 500 });
  }

  const sidPreview = accountSid.slice(0, 8);
  console.log(`[TestTwilio] SID: ${sidPreview}..., From: ${fromNumber}, To: +917989628066`);

  try {
    console.log("[TestTwilio] Creating client...");
    const client = twilio(accountSid, authToken);
    console.log("[TestTwilio] Client created. Sending SMS...");

    const startTime = Date.now();
    const message = await client.messages.create({
      body: "Twilio test message",
      from: fromNumber,
      to: "+917989628066",
    });
    const elapsed = Date.now() - startTime;

    console.log(`[TestTwilio] SMS sent in ${elapsed}ms`);
    console.log(`[TestTwilio] SID: ${message.sid}`);
    console.log(`[TestTwilio] Status: ${message.status}`);

    return NextResponse.json({
      success: true,
      sid: message.sid,
      status: message.status,
      elapsed_ms: elapsed,
    });
  } catch (error) {
    console.error("[TestTwilio] SMS failed:");
    console.error("[TestTwilio] Full error:", JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      console.error("[TestTwilio] Error name:", error.name);
      console.error("[TestTwilio] Error message:", error.message);
      console.error("[TestTwilio] Error stack:", error.stack);
    }
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}