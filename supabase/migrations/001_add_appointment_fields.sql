-- Migration: Add new fields to appointments table
-- Run this in Supabase SQL Editor or via CLI

-- Add status field with default value
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add source field with default value
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Manual';

-- Add summary field for AI-generated summaries
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS summary TEXT;

-- Add notes field for additional notes
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add call_duration field for voice agent calls
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS call_duration TEXT;

-- Add updated_at timestamp
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Create index on appointment_date for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_appointments_created ON appointments(created_at DESC);

-- Create index on department for filtering
CREATE INDEX IF NOT EXISTS idx_appointments_department ON appointments(department);

-- Update existing records to have default status
UPDATE appointments SET status = 'pending' WHERE status IS NULL;

-- Update existing records to have default source
UPDATE appointments SET source = 'Manual' WHERE source IS NULL;

-- Set updated_at for existing records
UPDATE appointments SET updated_at = created_at WHERE updated_at IS NULL;