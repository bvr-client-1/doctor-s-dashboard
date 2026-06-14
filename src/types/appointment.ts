export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type AppointmentSource = "AI Voice Agent" | "Manual" | "Web";

export interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  reason: string | null;
  department: string;
  appointment_date: string | null;
  appointment_time: string | null;
  language: string;
  status: AppointmentStatus;
  source: AppointmentSource;
  call_duration: string | null;
  notes: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentWithComputed extends Appointment {
  is_today: boolean;
  is_overdue: boolean;
}

export interface AppointmentStats {
  total: number;
  today: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface AnalyticsMetrics {
  total_calls: number;
  successful_bookings: number;
  failed_bookings: number;
  conversion_rate: number;
  by_department: Record<string, number>;
  by_day: Record<string, number>;
  by_language: Record<string, number>;
  by_status: Record<AppointmentStatus, number>;
}