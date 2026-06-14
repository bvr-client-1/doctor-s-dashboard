import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { webhookAppointmentSchema } from "@/lib/validations";
import { generateSummaryFromFields } from "@/lib/ai-summary";

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  console.log(`[Webhook:${requestId}] POST /api/webhook/appointment`);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    console.warn(`[Webhook:${requestId}] Invalid JSON body`);
    return NextResponse.json(
      { success: false, error: "Invalid JSON body", request_id: requestId },
      { status: 400 }
    );
  }

  console.log(`[Webhook:${requestId}] Payload received:`, JSON.stringify(body));

  const validation = webhookAppointmentSchema.safeParse(body);

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const missingFields: string[] = [];
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (messages && messages.length > 0) {
        missingFields.push(field);
      }
    }
    console.warn(`[Webhook:${requestId}] Validation failed:`, missingFields.join(", "));
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        missing_fields: missingFields,
        details: fieldErrors,
        request_id: requestId,
      },
      { status: 400 }
    );
  }

  const data = validation.data;

  const phoneDigits = data.phone.replace(/\D/g, "");
  let normalizedPhone = data.phone;
  if (phoneDigits.length === 10) {
    normalizedPhone = `+91${phoneDigits}`;
  } else if (phoneDigits.length === 11 && phoneDigits.startsWith("0")) {
    normalizedPhone = `+91${phoneDigits.slice(1)}`;
  } else if (phoneDigits.length === 12 && phoneDigits.startsWith("91")) {
    normalizedPhone = `+${phoneDigits}`;
  }

  const insertPayload: Record<string, unknown> = {
    patient_name: data.patient_name.trim(),
    phone: normalizedPhone,
    department: data.department,
    reason: data.reason || null,
    appointment_date: data.appointment_date || null,
    appointment_time: data.appointment_time || null,
    language: data.language,
    status: "pending",
    source: "AI Voice Agent",
    call_duration: data.call_duration || null,
    notes: data.notes || null,
  };

  const summary = generateSummaryFromFields({
    patient_name: data.patient_name,
    phone: normalizedPhone,
    department: data.department,
    reason: data.reason || null,
    appointment_date: data.appointment_date || null,
    appointment_time: data.appointment_time || null,
    language: data.language,
    status: "pending",
    source: "AI Voice Agent",
    call_duration: data.call_duration || null,
    notes: data.notes || null,
  });
  insertPayload.summary = summary;

  console.log(`[Webhook:${requestId}] Inserting into Supabase...`);

  const { data: result, error } = await supabase
    .from("appointments")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) {
    console.error(`[Webhook:${requestId}] Supabase error:`, error.message, error.details);
    return NextResponse.json(
      {
        success: false,
        error: `Database error: ${error.message}`,
        request_id: requestId,
      },
      { status: 500 }
    );
  }

  console.log(`[Webhook:${requestId}] Created: ${result.id}`);
  return NextResponse.json(
    {
      success: true,
      appointment_id: result.id,
      request_id: requestId,
    },
    { status: 201 }
  );
}