-- Add missing INSERT policies for profiles and subscribers tables
-- Fix overly permissive policies

-- Profiles: Add proper INSERT policy
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Subscribers: Add proper INSERT policy  
CREATE POLICY "Users can insert their own subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Transactions: Add UPDATE and DELETE policies (restrict to owner)
CREATE POLICY "Users can update their own transactions" 
ON public.transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
ON public.transactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Balance predictions: Add UPDATE/DELETE policies (owner only)
CREATE POLICY "Users can update their own predictions" 
ON public.balance_predictions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own predictions" 
ON public.balance_predictions 
FOR DELETE 
USING (auth.uid() = user_id);

-- User progress: Add DELETE policy
CREATE POLICY "Users can delete their own progress" 
ON public.user_progress 
FOR DELETE 
USING (auth.uid() = user_id);