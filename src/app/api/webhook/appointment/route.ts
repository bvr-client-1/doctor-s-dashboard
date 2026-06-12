import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type WebhookPayload = {
  patient_name: string;
  phone: string;
  reason: string;
  department: string;
  appointment_date: string;
  appointment_time: string;
  language: string;
  call_duration?: string;
  notes?: string;
};

const REQUIRED_FIELDS: (keyof WebhookPayload)[] = [
  "patient_name",
  "phone",
  "reason",
  "department",
  "appointment_date",
  "appointment_time",
  "language",
];

const DEPARTMENTS = [
  "General Medicine",
  "Ophthalmology",
  "Gynecology",
  "Dermatology",
  "Pediatrics",
  "Cardiology",
  "Orthopedics",
  "ENT",
];

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  console.log(`[Webhook:${requestId}] POST /api/webhook/appointment`);

  let body: WebhookPayload;

  try {
    body = await request.json();
  } catch {
    console.warn(`[Webhook:${requestId}] Invalid JSON body`);
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  console.log(`[Webhook:${requestId}] Payload received:`, JSON.stringify(body));

  const missing = REQUIRED_FIELDS.filter((field) => !body[field] || body[field].trim() === "");
  if (missing.length > 0) {
    console.warn(`[Webhook:${requestId}] Missing required fields:`, missing.join(", "));
    return NextResponse.json(
      {
        success: false,
        error: `Missing required fields: ${missing.join(", ")}`,
      },
      { status: 400 },
    );
  }

  if (!DEPARTMENTS.includes(body.department)) {
    console.warn(`[Webhook:${requestId}] Invalid department: "${body.department}"`);
    return NextResponse.json(
      {
        success: false,
        error: `Invalid department. Must be one of: ${DEPARTMENTS.join(", ")}`,
      },
      { status: 400 },
    );
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(body.appointment_date)) {
    console.warn(`[Webhook:${requestId}] Invalid date format: "${body.appointment_date}"`);
    return NextResponse.json(
      { success: false, error: "Invalid appointment_date. Expected format: YYYY-MM-DD" },
      { status: 400 },
    );
  }

  const timeRegex = /^\d{1,2}:\d{2}\s*(AM|PM)$/i;
  if (!timeRegex.test(body.appointment_time)) {
    console.warn(`[Webhook:${requestId}] Invalid time format: "${body.appointment_time}"`);
    return NextResponse.json(
      { success: false, error: "Invalid appointment_time. Expected format: hh:mm AM/PM" },
      { status: 400 },
    );
  }

  const phoneDigits = body.phone.replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    console.warn(`[Webhook:${requestId}] Invalid phone number: "${body.phone}"`);
    return NextResponse.json(
      { success: false, error: "Invalid phone number. Must have at least 10 digits." },
      { status: 400 },
    );
  }

  const insertPayload: Record<string, unknown> = {
    patient_name: body.patient_name.trim(),
    phone: body.phone.trim(),
    reason: body.reason.trim(),
    department: body.department,
    appointment_date: body.appointment_date,
    appointment_time: body.appointment_time,
    language: body.language.trim(),
    status: "Pending",
    source: "AI Voice Agent",
  };

  if (body.call_duration) {
    insertPayload.call_duration = body.call_duration.trim();
  }
  if (body.notes) {
    insertPayload.notes = body.notes.trim();
  }

  console.log(`[Webhook:${requestId}] Inserting appointment into Supabase...`);

  const { data, error } = await supabase
    .from("appointments")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) {
    console.error(`[Webhook:${requestId}] Supabase insert error:`, error.message, error.details, error.hint);
    return NextResponse.json(
      { success: false, error: `Database insert failed: ${error.message}` },
      { status: 500 },
    );
  }

  console.log(`[Webhook:${requestId}] Appointment created: ${data.id}`);
  return NextResponse.json(
    { success: true, appointment_id: data.id },
    { status: 201 },
  );
}
