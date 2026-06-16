-- Migration: Add raw_payload JSONB column to appointments table
-- Run this in Supabase SQL Editor or via CLI

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS raw_payload JSONB;
