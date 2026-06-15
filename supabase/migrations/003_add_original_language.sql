-- Migration: Add original_language column to appointments table
-- Run this in Supabase SQL Editor or via CLI

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS original_language TEXT;
