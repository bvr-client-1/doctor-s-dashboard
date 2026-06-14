import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

function getClient() {
  if (!accountSid || !authToken) {
    throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set");
  }
  return twilio(accountSid, authToken);
}

export interface SendSMSOptions {
  to: string;
  patient_name: string;
  department: string;
  appointment_date: string | null;
  appointment_time: string | null;
}

export async function sendAppointmentSMS(options: SendSMSOptions): Promise<boolean> {
  if (!fromNumber) {
    console.error("[Twilio] TWILIO_PHONE_NUMBER not configured, skipping SMS");
    return false;
  }

  const { to, patient_name, department, appointment_date, appointment_time } = options;

  const body = [
    "CarePoint Medical Center",
    "",
    `Hello ${patient_name},`,
    "Your appointment request has been received.",
    "",
    `Department: ${department}`,
    `Date: ${appointment_date || "Not specified"}`,
    `Time: ${appointment_time || "Not specified"}`,
    "",
    "Our team will contact you shortly.",
    "",
    "Thank you.",
  ].join("\n");

  const sidPreview = accountSid ? accountSid.slice(0, 8) : "N/A";

  try {
    console.log(`[Twilio] Creating client... (SID: ${sidPreview}..., From: ${fromNumber}, To: ${to})`);
    const client = getClient();
    console.log(`[Twilio] Client created. Calling messages.create() with 10s timeout...`);
    const startTime = Date.now();
    const message = await Promise.race([
      client.messages.create({
        body,
        from: fromNumber,
        to,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Twilio timeout: messages.create() exceeded 10s")), 10000)
      ),
    ]);
    const elapsed = Date.now() - startTime;
    console.log(`[Twilio] messages.create() completed in ${elapsed}ms. SID: ${message.sid}`);
    console.log(`[Twilio] SMS sent successfully to ${to}`);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Twilio] SMS failed to ${to}:`);
      console.error(`[Twilio] Error name: ${error.name}`);
      console.error(`[Twilio] Error message: ${error.message}`);
      console.error(`[Twilio] Error stack:\n${error.stack}`);
      if ("code" in error) {
        console.error(`[Twilio] Error code: ${(error as Record<string, unknown>).code}`);
      }
      if ("status" in error) {
        console.error(`[Twilio] HTTP status: ${(error as Record<string, unknown>).status}`);
      }
    } else {
      console.error(`[Twilio] SMS failed to ${to}: Unknown error`, error);
    }
    return false;
  }
}