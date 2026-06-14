import { NextResponse } from "next/server";
import { listWhatsAppMessages } from "@/lib/whatsapp";

export async function GET() {
  console.log("[TestWhatsAppAccount] GET /api/test-whatsapp-account");

  const result = await listWhatsAppMessages();

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: result.messages.length, messages: result.messages });
}