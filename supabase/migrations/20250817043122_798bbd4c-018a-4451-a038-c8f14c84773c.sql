-- Add missing RLS policies for ai_response_logs table to protect audit trail
-- Users should not be able to update or delete AI interaction logs

CREATE POLICY "Prevent unauthorized updates to AI logs" ON public.ai_response_logs
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Prevent unauthorized deletion of AI logs" ON public.ai_response_logs  
FOR DELETE
TO authenticated
USING (false);

-- Service role can manage AI logs for system operations
CREATE POLICY "Service role can update AI logs" ON public.ai_response_logs
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can delete AI logs" ON public.ai_response_logs
FOR DELETE  
TO service_role
USING (true);