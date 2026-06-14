import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

export async function GET() {
  console.log("[TestTwilioConfig] GET /api/test-twilio-config");

  const config = {
    account_sid: accountSid ? `${accountSid.slice(0, 10)}...` : null,
    twilio_phone_number: fromNumber || null,
    client_initialized: false,
  };

  if (!accountSid || !authToken) {
    console.error("[TestTwilioConfig] Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN");
    return NextResponse.json({ ...config, error: "Missing env vars" }, { status: 500 });
  }

  try {
    console.log("[TestTwilioConfig] Creating Twilio client...");
    const client = twilio(accountSid, authToken);
    config.client_initialized = true;
    console.log("[TestTwilioConfig] Client initialized: true");

    console.log(`[TestTwilioConfig] Fetching account details for SID: ${accountSid.slice(0, 10)}...`);
    const account = await client.api.accounts(accountSid).fetch();

    console.log("[TestTwilioConfig] Account fetched:");
    console.log(`[TestTwilioConfig]   Friendly Name: ${account.friendlyName}`);
    console.log(`[TestTwilioConfig]   Status: ${account.status}`);
    console.log(`[TestTwilioConfig]   Date Created: ${account.dateCreated}`);
    console.log(`[TestTwilioConfig]   Date Updated: ${account.dateUpdated}`);

    return NextResponse.json({
      ...config,
      account: {
        friendly_name: account.friendlyName,
        status: account.status,
        date_created: account.dateCreated,
        date_updated: account.dateUpdated,
      },
    });
  } catch (error) {
    console.error("[TestTwilioConfig] Error:", JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      console.error("[TestTwilioConfig] Error name:", error.name);
      console.error("[TestTwilioConfig] Error message:", error.message);
    }
    return NextResponse.json({ ...config, error: String(error) }, { status: 500 });
  }
}