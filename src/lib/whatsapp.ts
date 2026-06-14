const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

export interface SendWhatsAppOptions {
  to: string;
  patient_name: string;
  department: string;
  appointment_date: string | null;
  appointment_time: string | null;
}

export async function sendAppointmentWhatsApp(options: SendWhatsAppOptions): Promise<boolean> {
  if (!accessToken || !phoneNumberId) {
    console.error("[WhatsApp] WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not configured, skipping");
    return false;
  }

  const { to, patient_name, department, appointment_date, appointment_time } = options;

  const phoneDigits = to.replace(/\D/g, "");
  const toNumber = phoneDigits.startsWith("91") && phoneDigits.length === 12
    ? phoneDigits
    : phoneDigits.startsWith("91") && phoneDigits.length === 11
      ? `0${phoneDigits}`
      : phoneDigits.length === 10
        ? `91${phoneDigits}`
        : phoneDigits;

  const body = [
    `Hello ${patient_name},`,
    "",
    "Your appointment request has been received.",
    "",
    `Department: ${department}`,
    `Date: ${appointment_date || "Not specified"}`,
    `Time: ${appointment_time || "Not specified"}`,
    "",
    "Our team will contact you shortly.",
    "",
    "Thank you.",
    "CarePoint Medical Center",
  ].join("\n");

  const url = `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`;

  console.log(`[WhatsApp] Sending message to ${toNumber}...`);
  console.log(`[WhatsApp] URL: ${url}`);
  console.log(`[WhatsApp] Body preview: ${body.slice(0, 80)}...`);

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toNumber,
        type: "text",
        text: { body },
      }),
    });

    const elapsed = Date.now() - startTime;
    const responseData = await response.json();

    console.log(`[WhatsApp] Response status: ${response.status} in ${elapsed}ms`);
    console.log(`[WhatsApp] Response:`, JSON.stringify(responseData));

    if (!response.ok) {
      console.error(`[WhatsApp] API error: ${response.status}`, JSON.stringify(responseData));
      return false;
    }

    const messageId = responseData.messages?.[0]?.id;
    console.log(`[WhatsApp] Message sent successfully. ID: ${messageId}`);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[WhatsApp] Failed to send to ${toNumber}:`);
      console.error(`[WhatsApp] Error name: ${error.name}`);
      console.error(`[WhatsApp] Error message: ${error.message}`);
      console.error(`[WhatsApp] Error stack:\n${error.stack}`);
    } else {
      console.error(`[WhatsApp] Failed to send to ${toNumber}:`, error);
    }
    return false;
  }
}

export async function testWhatsAppConfig(): Promise<{
  access_token_preview: string | null;
  phone_number_id: string | null;
  client_initialized: boolean;
}> {
  const config = {
    access_token_preview: accessToken ? `${accessToken.slice(0, 10)}...` : null,
    phone_number_id: phoneNumberId || null,
    client_initialized: false,
  };

  if (!accessToken || !phoneNumberId) {
    return config;
  }

  config.client_initialized = true;
  return config;
}

export async function testWhatsAppSend(): Promise<{
  success: boolean;
  message_id?: string;
  status?: string;
  error?: string;
}> {
  if (!accessToken || !phoneNumberId) {
    return { success: false, error: "Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID" };
  }

  const url = `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`;
  const testBody = "WhatsApp test message from CarePoint Medical Center";

  console.log("[WhatsAppTest] Sending test message...");
  console.log(`[WhatsAppTest] URL: ${url}`);
  console.log(`[WhatsAppTest] To: 917989628066`);

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: "917989628066",
        type: "text",
        text: { body: testBody },
      }),
    });

    const elapsed = Date.now() - startTime;
    const responseData = await response.json();

    console.log(`[WhatsAppTest] Response status: ${response.status} in ${elapsed}ms`);
    console.log(`[WhatsAppTest] Response:`, JSON.stringify(responseData));

    if (!response.ok) {
      console.error(`[WhatsAppTest] API error: ${response.status}`, JSON.stringify(responseData));
      return { success: false, error: JSON.stringify(responseData) };
    }

    const messageId = responseData.messages?.[0]?.id;
    const status = responseData.messages?.[0]?.status;
    console.log(`[WhatsAppTest] Message sent. ID: ${messageId}, Status: ${status}`);

    return { success: true, message_id: messageId, status };
  } catch (error) {
    if (error instanceof Error) {
      console.error("[WhatsAppTest] Error name:", error.name);
      console.error("[WhatsAppTest] Error message:", error.message);
      console.error("[WhatsAppTest] Error stack:", error.stack);
    }
    return { success: false, error: String(error) };
  }
}

export async function listWhatsAppMessages(): Promise<{
  success: boolean;
  messages: Array<{
    id: string;
    status: string;
    timestamp: string;
    to: string;
    type: string;
  }>;
  error?: string;
}> {
  if (!accessToken || !phoneNumberId) {
    return { success: false, messages: [], error: "Missing env vars" };
  }

  const url = `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`;
  console.log(`[WhatsAppAccount] Listing messages from: ${url}`);

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const elapsed = Date.now() - startTime;
    const responseData = await response.json();

    console.log(`[WhatsAppAccount] Response status: ${response.status} in ${elapsed}ms`);

    if (!response.ok) {
      console.error("[WhatsAppAccount] API error:", JSON.stringify(responseData));
      return { success: false, messages: [], error: JSON.stringify(responseData) };
    }

    console.log("[WhatsAppAccount] Full response:", JSON.stringify(responseData, null, 2));

    const messages = (responseData.data || []).map((msg: Record<string, unknown>) => ({
      id: String(msg.id || ""),
      status: String(msg.status || "unknown"),
      timestamp: String(msg.timestamp || ""),
      to: String(msg.to || ""),
      type: String(msg.type || ""),
    }));

    console.log(`[WhatsAppAccount] Found ${messages.length} messages`);
    messages.forEach((msg: { id: string; status: string; to: string; type: string }) => {
      console.log(`[WhatsAppAccount]   ${msg.id} | ${msg.status} | to: ${msg.to} | type: ${msg.type}`);
    });

    return { success: true, messages };
  } catch (error) {
    if (error instanceof Error) {
      console.error("[WhatsAppAccount] Error name:", error.name);
      console.error("[WhatsAppAccount] Error message:", error.message);
    }
    return { success: false, messages: [], error: String(error) };
  }
}