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

-- 3. Create Sponsors Table for dynamic Homepage Marquee management
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- Allow public read access to sponsors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sponsors' AND policyname = 'Public Read Access'
  ) THEN
    CREATE POLICY "Public Read Access" ON sponsors FOR SELECT USING (true);
  END IF;
END $$;

-- Allow authenticated admin full access to sponsors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sponsors' AND policyname = 'Admin All Access'
  ) THEN
    CREATE POLICY "Admin All Access" ON sponsors FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 4. Create Storage Bucket for Sponsors (if not existing)
INSERT INTO storage.buckets (id, name, public)
VALUES ('sponsors', 'sponsors', true)
ON CONFLICT (id) DO NOTHING;

-- Storage bucket access policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access for Sponsor Logos'
  ) THEN
    CREATE POLICY "Public Access for Sponsor Logos" ON storage.objects FOR SELECT USING (bucket_id = 'sponsors');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Admin Upload for Sponsor Logos'
  ) THEN
    CREATE POLICY "Admin Upload for Sponsor Logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'sponsors');
  END IF;
END $$;

-- 5. Seed Initial / Current Sponsors (if table is empty)
INSERT INTO sponsors (name, logo_url, website_url, order_index)
SELECT 'Zomato', 'https://raw.githubusercontent.com/alexadevcu/Alexa-Developers-Community-Website-Chandigarh-University/main/src/assets/Sponsors/Zomato.png', 'https://www.zomato.com', 1
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name = 'Zomato');

INSERT INTO sponsors (name, logo_url, website_url, order_index)
SELECT 'GeeksforGeeks', 'https://raw.githubusercontent.com/alexadevcu/Alexa-Developers-Community-Website-Chandigarh-University/main/src/assets/Sponsors/GfG%20Horizontal%20Combination%20Mark%20(Light%20Mode)%402x.png', 'https://www.geeksforgeeks.org', 2
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name = 'GeeksforGeeks');

INSERT INTO sponsors (name, logo_url, website_url, order_index)
SELECT 'Event Eye', 'https://raw.githubusercontent.com/alexadevcu/Alexa-Developers-Community-Website-Chandigarh-University/main/src/assets/Sponsors/event%20eye.jpg', NULL, 3
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name = 'Event Eye');

INSERT INTO sponsors (name, logo_url, website_url, order_index)
SELECT 'Growbinar', 'https://raw.githubusercontent.com/alexadevcu/Alexa-Developers-Community-Website-Chandigarh-University/main/src/assets/Sponsors/growbinar.jpg', NULL, 4
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name = 'Growbinar');

INSERT INTO sponsors (name, logo_url, website_url, order_index)
SELECT 'Tamboobaba', 'https://raw.githubusercontent.com/alexadevcu/Alexa-Developers-Community-Website-Chandigarh-University/main/src/assets/Sponsors/Copy%20of%20TAMBOOBABA-LOGOS.png', NULL, 5
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name = 'Tamboobaba');

INSERT INTO sponsors (name, logo_url, website_url, order_index)
SELECT 'Partner Sponsor', 'https://raw.githubusercontent.com/alexadevcu/Alexa-Developers-Community-Website-Chandigarh-University/main/src/assets/Sponsors/Asset%2010%20horizontal%20logo.png', NULL, 6
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name = 'Partner Sponsor');

INSERT INTO sponsors (name, logo_url, website_url, order_index)
SELECT 'Community Partner', 'https://raw.githubusercontent.com/alexadevcu/Alexa-Developers-Community-Website-Chandigarh-University/main/src/assets/Sponsors/2.png', NULL, 7
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name = 'Community Partner');

INSERT INTO sponsors (name, logo_url, website_url, order_index)
SELECT 'Event Sponsor', 'https://raw.githubusercontent.com/alexadevcu/Alexa-Developers-Community-Website-Chandigarh-University/main/src/assets/Sponsors/WhatsApp%20Image%202025-09-02%20at%2019.47.04_1d5320e8.jpg', NULL, 8
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name = 'Event Sponsor');

-- Optional: Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
