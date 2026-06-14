import { z } from "zod";

export const phoneSchema = z.string().refine(
  (phone) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10;
  },
  { message: "Phone number must have at least 10 digits" }
);

export const webhookAppointmentSchema = z.object({
  patient_name: z.string().min(1, "Patient name is required").trim(),
  phone: phoneSchema,
  department: z.string().min(1, "Department is required").trim(),
  reason: z.string().trim().optional().default(""),
  appointment_date: z.string().trim().optional().default(""),
  appointment_time: z.string().trim().optional().default(""),
  language: z.string().trim().optional().default(""),
  call_duration: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

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

export const appointmentCreateSchema = webhookAppointmentSchema.extend({
  status: statusSchema.default("pending"),
  source: z.string().default("AI Voice Agent"),
});

export const appointmentUpdateSchema = z.object({
  patient_name: z.string().min(1).trim().optional(),
  phone: phoneSchema.optional(),
  department: z.string().optional(),
  reason: z.string().trim().optional(),
  appointment_date: z.string().trim().optional().nullable(),
  appointment_time: z.string().trim().optional().nullable(),
  language: z.string().optional(),
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