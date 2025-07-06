-- Allow service role to access payment transactions for payment processing
CREATE POLICY "Service role can access payment transactions for payment processing" 
ON public.payment_transactions 
FOR ALL 
USING (
  -- Allow if it's a service role (no auth.uid()) 
  auth.uid() IS NULL 
  -- Or if it's the user's own payment transaction
  OR EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = payment_transactions.order_id 
    AND orders.user_id = auth.uid()
  )
)
WITH CHECK (
  -- Allow if it's a service role (no auth.uid()) 
  auth.uid() IS NULL 
  -- Or if it's the user's own payment transaction
  OR EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = payment_transactions.order_id 
    AND orders.user_id = auth.uid()
  )
);