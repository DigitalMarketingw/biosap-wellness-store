-- Allow service role to access orders for payment processing
CREATE POLICY "Service role can access orders for payment processing" 
ON public.orders 
FOR SELECT 
USING (
  -- Allow if it's a service role (no auth.uid()) 
  auth.uid() IS NULL 
  -- Or if it's the user's own order
  OR auth.uid() = user_id
);