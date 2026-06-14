import { NextResponse } from "next/server";
import { testWhatsAppConfig } from "@/lib/whatsapp";

export async function GET() {
  console.log("[TestWhatsAppConfig] GET /api/test-whatsapp-config");

  const config = await testWhatsAppConfig();

  if (!config.client_initialized) {
    return NextResponse.json({ ...config, error: "Missing env vars" }, { status: 500 });
  }

  return NextResponse.json(config);
}