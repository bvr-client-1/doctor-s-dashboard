import { z } from "zod";

export const phoneSchema = z.string().refine(
  (phone) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10;
  },
  { message: "Phone number must have at least 10 digits" }
);

export const appointmentDateSchema = z.string().refine(
  (date) => {
    if (!date) return true;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) return false;
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  },
  { message: "Invalid date format. Expected YYYY-MM-DD" }
);

export const appointmentTimeSchema = z.string().refine(
  (time) => {
    if (!time) return true;
    const regex = /^\d{1,2}:\d{2}\s*(AM|PM)$/i;
    return regex.test(time);
  },
  { message: "Invalid time format. Expected hh:mm AM/PM" }
);

export const departmentSchema = z.enum([
  "General Medicine",
  "Ophthalmology",
  "Gynecology",
  "Dermatology",
  "Pediatrics",
  "Cardiology",
  "Orthopedics",
  "ENT",
]);

export const statusSchema = z.enum([
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

export const languageSchema = z.enum([
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Bengali",
  "Gujarati",
  "Marathi",
  "Punjabi",
  "Urdu",
  "Other",
]);

export const webhookAppointmentSchema = z.object({
  patient_name: z.string().min(1, "Patient name is required").trim(),
  phone: phoneSchema,
  department: departmentSchema,
  reason: z.string().trim().optional().default(""),
  appointment_date: appointmentDateSchema.optional().nullable(),
  appointment_time: appointmentTimeSchema.optional().nullable(),
  language: languageSchema.optional().default("English"),
  call_duration: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

export const appointmentCreateSchema = webhookAppointmentSchema.extend({
  status: statusSchema.default("pending"),
  source: z.string().default("AI Voice Agent"),
});

export const appointmentUpdateSchema = z.object({
  patient_name: z.string().min(1).trim().optional(),
  phone: phoneSchema.optional(),
  department: departmentSchema.optional(),
  reason: z.string().trim().optional(),
  appointment_date: appointmentDateSchema.optional().nullable(),
  appointment_time: appointmentTimeSchema.optional().nullable(),
  language: languageSchema.optional(),
  status: statusSchema.optional(),
  notes: z.string().trim().optional().nullable(),
});

export const appointmentFilterSchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  status: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type WebhookAppointmentInput = z.infer<typeof webhookAppointmentSchema>;
export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;
export type AppointmentUpdateInput = z.infer<typeof appointmentUpdateSchema>;
export type AppointmentFilterInput = z.infer<typeof appointmentFilterSchema>;

export function validateWebhookAppointment(data: unknown) {
  return webhookAppointmentSchema.safeParse(data);
}

export function validateAppointmentCreate(data: unknown) {
  return appointmentCreateSchema.safeParse(data);
}

export function validateAppointmentUpdate(data: unknown) {
  return appointmentUpdateSchema.safeParse(data);
}

export function validateAppointmentFilter(data: unknown) {
  return appointmentFilterSchema.safeParse(data);
}