-- Add risk profile fields to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS risk_profile TEXT,
ADD COLUMN IF NOT EXISTS risk_score INTEGER,
ADD COLUMN IF NOT EXISTS quiz_completed_at TIMESTAMP WITH TIME ZONE;