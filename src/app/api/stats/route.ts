import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  const { count: total } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true });

  const { count: todayCount } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("appointment_date", today);

  const { count: pending } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: confirmed } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("status", "confirmed");

  const { count: completed } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");

  const { count: cancelled } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("status", "cancelled");

  const { data: deptData } = await supabase
    .from("appointments")
    .select("department");

  const byDepartment: Record<string, number> = {};
  (deptData ?? []).forEach((row) => {
    byDepartment[row.department] = (byDepartment[row.department] || 0) + 1;
  });

  const { data: langData } = await supabase
    .from("appointments")
    .select("language");

  const byLanguage: Record<string, number> = {};
  (langData ?? []).forEach((row) => {
    byLanguage[row.language] = (byLanguage[row.language] || 0) + 1;
  });

  return NextResponse.json({
    total: total ?? 0,
    today: todayCount ?? 0,
    pending: pending ?? 0,
    confirmed: confirmed ?? 0,
    completed: completed ?? 0,
    cancelled: cancelled ?? 0,
    by_department: byDepartment,
    by_language: byLanguage,
  });
}