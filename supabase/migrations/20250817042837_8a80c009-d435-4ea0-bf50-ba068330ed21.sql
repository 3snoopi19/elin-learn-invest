-- Fix critical security vulnerability in subscribers table
-- Remove overly permissive policy that allows public access to all subscriber data
DROP POLICY IF EXISTS "Edge functions can manage subscriptions" ON public.subscribers;

-- Create specific policies for different operations
-- Policy for users to view only their own subscription data  
CREATE POLICY "Users can view own subscription data" ON public.subscribers
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR email = auth.email());

-- Policy for users to update only their own subscription data
CREATE POLICY "Users can update own subscription data" ON public.subscribers  
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR email = auth.email())
WITH CHECK (user_id = auth.uid() OR email = auth.email());

-- Policy for edge functions to insert new subscriptions (service role bypasses RLS)
CREATE POLICY "Service role can insert subscriptions" ON public.subscribers
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy for edge functions to update any subscription (service role bypasses RLS)  
CREATE POLICY "Service role can update subscriptions" ON public.subscribers
FOR UPDATE  
TO service_role
USING (true)
WITH CHECK (true);

-- Policy for edge functions to select any subscription for processing (service role bypasses RLS)
CREATE POLICY "Service role can select subscriptions" ON public.subscribers
FOR SELECT
TO service_role  
USING (true);