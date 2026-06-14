import type { Appointment } from "@/types/appointment";

const DEPARTMENT_DISPLAY: Record<string, string> = {
  "General Medicine": "General Medicine",
  Ophthalmology: "Ophthalmology",
  Gynecology: "Gynecology",
  Dermatology: "Dermatology",
  Pediatrics: "Pediatrics",
  Cardiology: "Cardiology",
  Orthopedics: "Orthopedics",
  ENT: "ENT",
};

function formatDateForSummary(dateStr: string | null): string {
  if (!dateStr) return "an unspecified date";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return dateStr;
  }
}

function formatTimeForSummary(timeStr: string | null): string {
  if (!timeStr) return "an unspecified time";
  return timeStr;
}

function getReasonPhrase(reason: string | null): string {
  if (!reason || reason.trim() === "") {
    return "a consultation";
  }
  return reason.trim();
}

export function generateAppointmentSummary(appointment: Appointment): string {
  const patientName = appointment.patient_name;
  const department = DEPARTMENT_DISPLAY[appointment.department] || appointment.department;
  const reason = getReasonPhrase(appointment.reason);
  const date = formatDateForSummary(appointment.appointment_date);
  const time = formatTimeForSummary(appointment.appointment_time);
  const language = appointment.language || "English";

  let summary = `${patientName} requests ${reason} with ${department}. `;

  if (appointment.appointment_date && appointment.appointment_time) {
    summary += `Preferred appointment: ${date} at ${time}. `;
  } else if (appointment.appointment_date) {
    summary += `Preferred date: ${date}. `;
  } else if (appointment.appointment_time) {
    summary += `Preferred time: ${time}. `;
  }

  summary += `Language preference: ${language}. `;

  if (appointment.notes && appointment.notes.trim()) {
    summary += `Notes: ${appointment.notes.trim()}. `;
  }

  if (appointment.call_duration) {
    summary += `Call duration: ${appointment.call_duration}. `;
  }

  summary += `Status: ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}.`;
  summary += ` Source: ${appointment.source}.`;

  const words = summary.split(/\s+/);
  if (words.length > 100) {
    return words.slice(0, 100).join(" ") + "...";
  }

  return summary;
}

export function generateSummaryFromFields(fields: Partial<Appointment>): string {
  const mockAppointment: Appointment = {
    id: "",
    patient_name: fields.patient_name || "Patient",
    phone: fields.phone || "",
    reason: fields.reason || null,
    department: fields.department || "General Medicine",
    appointment_date: fields.appointment_date || null,
    appointment_time: fields.appointment_time || null,
    language: fields.language || "English",
    status: fields.status || "pending",
    source: fields.source || "AI Voice Agent",
    call_duration: fields.call_duration || null,
    notes: fields.notes || null,
    summary: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return generateAppointmentSummary(mockAppointment);
}