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

  try {
    const client = getClient();
    await client.messages.create({
      body,
      from: fromNumber,
      to,
    });
    console.log(`[Twilio] SMS sent successfully to ${to}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Twilio] SMS failed to ${to}:`, message);
    return false;
  }
}