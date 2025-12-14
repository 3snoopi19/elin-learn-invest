-- Fix profiles table RLS: Drop restrictive policies and create proper permissive ones
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create permissive policies for profiles (authenticated users only, own data)
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

-- Fix subscribers table RLS: Drop problematic policies and create proper ones
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view own subscription data" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update own subscription data" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can select subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can insert subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can update subscriptions" ON public.subscribers;

-- Create permissive policies for subscribers (authenticated users only, own data)
CREATE POLICY "Users can view own subscription" 
ON public.subscribers 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own subscription" 
ON public.subscribers 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());