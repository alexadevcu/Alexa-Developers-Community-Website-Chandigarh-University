-- ============================================================================
-- SUPABASE SCHEMA UPDATE SCRIPT
-- Alexa Developers Community - Chandigarh University (ADC CU)
-- ============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================================

-- 1. Add instagram_url and email to team_members table
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Add show_external_website and event details to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS show_external_website BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS why_participate TEXT,
ADD COLUMN IF NOT EXISTS eligibility TEXT,
ADD COLUMN IF NOT EXISTS rules_guidelines TEXT,
ADD COLUMN IF NOT EXISTS partnerships TEXT,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS venue TEXT;

-- Optional: Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
