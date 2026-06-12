import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { patient_name, phone, reason, department, appointment_date, appointment_time, language } = body;

    if (!patient_name || !phone || !reason || !department || !appointment_date || !appointment_time || !language) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("appointments")
      .insert({ patient_name, phone, reason, department, appointment_date, appointment_time, language })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ appointment: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
