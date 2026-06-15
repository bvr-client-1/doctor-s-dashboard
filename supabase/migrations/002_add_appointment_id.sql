-- Migration: Add appointment_id column for human-friendly references
-- Run this in Supabase SQL Editor or via CLI

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS appointment_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_appointment_id
ON appointments(appointment_id)
WHERE appointment_id IS NOT NULL;
