import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

export async function GET() {
  console.log("[TestTwilioAccount] GET /api/test-twilio-account");

  if (!accountSid || !authToken) {
    console.error("[TestTwilioAccount] Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN");
    return NextResponse.json({ success: false, error: "Missing env vars" }, { status: 500 });
  }

  try {
    console.log(`[TestTwilioAccount] Creating client (SID: ${accountSid.slice(0, 10)}...)...`);
    const client = twilio(accountSid, authToken);
    console.log("[TestTwilioAccount] Client created. Fetching last 5 messages...");

    const messages = await client.messages.list({ limit: 5 });

    console.log(`[TestTwilioAccount] Found ${messages.length} messages`);

    const results = messages.map((msg) => {
      const entry = {
        sid: msg.sid,
        status: msg.status,
        error_code: msg.errorCode,
        error_message: msg.errorMessage,
        to: msg.to,
        from: msg.from,
      };
      console.log(`[TestTwilioAccount]   ${msg.sid} | ${msg.status} | to: ${msg.to} | error_code: ${msg.errorCode ?? "none"}`);
      return entry;
    });

    return NextResponse.json({ success: true, count: results.length, messages: results });
  } catch (error) {
    console.error("[TestTwilioAccount] Error:", JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      console.error("[TestTwilioAccount] Error name:", error.name);
      console.error("[TestTwilioAccount] Error message:", error.message);
    }
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}