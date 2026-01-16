-- Create impulse prevention logs table
CREATE TABLE public.impulse_prevention_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  potential_future_value NUMERIC NOT NULL,
  hours_of_work NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.impulse_prevention_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own impulse logs"
ON public.impulse_prevention_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own impulse logs"
ON public.impulse_prevention_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own impulse logs"
ON public.impulse_prevention_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Add hourly_wage to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hourly_wage NUMERIC DEFAULT 25;