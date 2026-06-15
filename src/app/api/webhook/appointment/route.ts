import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { webhookAppointmentSchema } from "@/lib/validations";
import {
  normalizeAppointmentDate,
  normalizeAppointmentTime,
} from "@/lib/appointment-normalization";
import { normalizeWithAI } from "@/lib/ai-normalize";
import { sendAppointmentWhatsApp } from "@/lib/whatsapp";

async function getNextAppointmentId() {
  const { data, error } = await supabase
    .from("appointments")
    .select("appointment_id")
    .not("appointment_id", "is", null)
    .order("appointment_id", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Failed to generate appointment_id: ${error.message}`);
  }

  const latestValue = data?.[0]?.appointment_id;
  const latestNumber = typeof latestValue === "string"
    ? Number.parseInt(latestValue.replace(/^CP-/, ""), 10)
    : 1000;

  return `CP-${Number.isNaN(latestNumber) ? 1001 : latestNumber + 1}`;
}

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
    console.error(`[Webhook:${requestId}] Validation failed:`, JSON.stringify(fieldErrors));
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

  console.log(`[Webhook:${requestId}] Validation passed`);

  const data = validation.data;

  const normalizedDateResult = normalizeAppointmentDate(data.appointment_date);
  if (!normalizedDateResult.success) {
    console.error(`[Webhook:${requestId}] Date normalization failed: ${normalizedDateResult.error}`);
    return NextResponse.json(
      {
        success: false,
        error: normalizedDateResult.error,
        field: "appointment_date",
        request_id: requestId,
      },
      { status: 400 }
    );
  }

  const normalizedTimeResult = normalizeAppointmentTime(data.appointment_time);
  if (!normalizedTimeResult.success) {
    console.error(`[Webhook:${requestId}] Time normalization failed: ${normalizedTimeResult.error}`);
    return NextResponse.json(
      {
        success: false,
        error: normalizedTimeResult.error,
        field: "appointment_time",
        request_id: requestId,
      },
      { status: 400 }
    );
  }

  const phoneDigits = data.phone.replace(/\D/g, "");
  let normalizedPhone = data.phone;
  if (phoneDigits.length === 10) {
    normalizedPhone = `+91${phoneDigits}`;
  } else if (phoneDigits.length === 11 && phoneDigits.startsWith("0")) {
    normalizedPhone = `+91${phoneDigits.slice(1)}`;
  } else if (phoneDigits.length === 12 && phoneDigits.startsWith("91")) {
    normalizedPhone = `+${phoneDigits}`;
  }

  let appointmentId: string;
  try {
    appointmentId = await getNextAppointmentId();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate appointment_id";
    console.error(`[Webhook:${requestId}] ${message}`);
    return NextResponse.json(
      {
        success: false,
        error: message,
        request_id: requestId,
      },
      { status: 500 }
    );
  }

  console.log(`[Webhook:${requestId}] Normalized appointment_date: ${normalizedDateResult.value}`);
  console.log(`[Webhook:${requestId}] Normalized appointment_time: ${normalizedTimeResult.value}`);
  console.log(`[Webhook:${requestId}] Generated appointment_id: ${appointmentId}`);

  console.log(`[Webhook:${requestId}] Starting AI normalization...`);
  const aiStartTime = Date.now();
  const aiResult = await normalizeWithAI({
    patient_name: data.patient_name.trim(),
    phone: normalizedPhone,
    department: data.department,
    reason: data.reason || null,
    appointment_date: normalizedDateResult.value,
    appointment_time: normalizedTimeResult.value,
    language: data.language || null,
    notes: data.notes || null,
  });
  const aiElapsed = Date.now() - aiStartTime;
  console.log(`[Webhook:${requestId}] AI normalization completed in ${aiElapsed}ms`);
  console.log(`[Webhook:${requestId}] Before AI: name="${data.patient_name.trim()}", dept="${data.department}", reason="${data.reason || ""}", lang="${data.language || ""}"`);
  console.log(`[Webhook:${requestId}] After AI:  name="${aiResult.patient_name}", dept="${aiResult.department}", reason="${aiResult.reason || ""}", lang="${aiResult.original_language || ""}"`);

  const insertPayload: Record<string, unknown> = {
    appointment_id: appointmentId,
    patient_name: aiResult.patient_name,
    phone: normalizedPhone,
    department: aiResult.department,
    reason: aiResult.reason,
    appointment_date: normalizedDateResult.value,
    appointment_time: normalizedTimeResult.value,
    language: aiResult.original_language,
    original_language: aiResult.original_language,
    notes: aiResult.notes,
  };

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

  console.log(`[Webhook:${requestId}] Appointment inserted: ${result.id}`);

  sendAppointmentWhatsApp({
    to: normalizedPhone,
    patient_name: aiResult.patient_name,
    department: aiResult.department,
    appointment_date: normalizedDateResult.value,
    appointment_time: normalizedTimeResult.value,
  }).catch((err) => {
    console.error(`[Webhook:${requestId}] WhatsApp fire-and-forget error:`, err);
  });

  return NextResponse.json(
    {
      success: true,
      appointment_id: appointmentId,
      record_id: result.id,
      request_id: requestId,
    },
    { status: 200 }
  );
}