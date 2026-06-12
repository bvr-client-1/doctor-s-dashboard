import { supabase } from "@/lib/supabase";
import { DashboardClient } from "./DashboardClient";

export type Appointment = {
  id: string;
  patient_name: string;
  phone: string;
  reason: string;
  department: string;
  appointment_date: string;
  appointment_time: string;
  language: string;
  status: string;
  created_at: string;
};

export type DashboardStats = {
  total: number;
  pending: number;
  todayCalls: number;
  departments: number;
};

async function getAppointments(): Promise<Appointment[]> {
  const { data } = await supabase
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []).map((a) => ({ ...a, status: a.status ?? "Pending" }));
}

function computeStats(appointments: Appointment[]): DashboardStats {
  const today = new Date().toISOString().slice(0, 10);
  return {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "Pending").length,
    todayCalls: appointments.filter((a) => a.appointment_date === today).length,
    departments: new Set(appointments.map((a) => a.department)).size,
  };
}

const DEMO_APPOINTMENTS: Appointment[] = [
  { id: "demo-1", patient_name: "Pruthvi Raj", phone: "9876543210", reason: "Fever & Cough", department: "General Medicine", appointment_date: "2026-06-13", appointment_time: "10:00 AM", language: "Telugu", status: "Confirmed", created_at: "2026-06-13T05:30:00Z" },
  { id: "demo-2", patient_name: "Rahul Sharma", phone: "9988776655", reason: "Eye Checkup", department: "Ophthalmology", appointment_date: "2026-06-14", appointment_time: "02:30 PM", language: "Hindi", status: "Pending", created_at: "2026-06-13T06:00:00Z" },
  { id: "demo-3", patient_name: "Anjali Reddy", phone: "9123456780", reason: "Pregnancy Checkup", department: "Gynecology", appointment_date: "2026-06-14", appointment_time: "11:00 AM", language: "Telugu", status: "Confirmed", created_at: "2026-06-13T06:30:00Z" },
  { id: "demo-4", patient_name: "Kiran Kumar", phone: "9008007001", reason: "Skin Rash", department: "Dermatology", appointment_date: "2026-06-13", appointment_time: "04:00 PM", language: "Kannada", status: "Cancelled", created_at: "2026-06-12T10:00:00Z" },
  { id: "demo-5", patient_name: "Ayesha Khan", phone: "8899776655", reason: "Consultation", department: "Pediatrics", appointment_date: "2026-06-15", appointment_time: "09:00 AM", language: "Urdu", status: "Pending", created_at: "2026-06-13T07:00:00Z" },
];

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const appointments = await getAppointments();
  const isDemo = appointments.length === 0;
  const displayAppointments = isDemo ? DEMO_APPOINTMENTS : appointments;
  const stats = isDemo
    ? { total: DEMO_APPOINTMENTS.length, pending: DEMO_APPOINTMENTS.filter((a) => a.status === "Pending").length, todayCalls: DEMO_APPOINTMENTS.filter((a) => a.appointment_date === new Date().toISOString().slice(0, 10)).length, departments: new Set(DEMO_APPOINTMENTS.map((a) => a.department)).size }
    : computeStats(appointments);

  return <DashboardClient appointments={displayAppointments} stats={stats} isDemo={isDemo} />;
}
