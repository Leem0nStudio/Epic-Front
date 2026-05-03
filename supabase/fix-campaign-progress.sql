-- Fix: Add cleared_at column to campaign_progress
ALTER TABLE campaign_progress ADD COLUMN IF NOT EXISTS cleared_at TIMESTAMP WITH TIME ZONE;