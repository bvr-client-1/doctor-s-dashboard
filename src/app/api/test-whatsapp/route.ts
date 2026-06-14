import { NextResponse } from "next/server";
import { testWhatsAppSend } from "@/lib/whatsapp";

export async function GET() {
  console.log("[TestWhatsApp] GET /api/test-whatsapp");

  const result = await testWhatsAppSend();

  if (result.success) {
    return NextResponse.json({
      success: true,
      message_id: result.message_id,
      status: result.status,
    });
  }

  return NextResponse.json({ success: false, error: result.error }, { status: 500 });
}