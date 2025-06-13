
-- Create payment_transactions table to track PhonePe payments
CREATE TABLE public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  phonepe_transaction_id TEXT,
  merchant_transaction_id TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'phonepe',
  phonepe_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add payment tracking fields to orders table
ALTER TABLE public.orders 
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN transaction_reference TEXT,
ADD COLUMN payment_completed_at TIMESTAMP WITH TIME ZONE;

-- Add RLS policies for payment_transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment transactions
CREATE POLICY "Users can view their own payment transactions" 
  ON public.payment_transactions 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = payment_transactions.order_id 
    AND orders.user_id = auth.uid()
  ));

-- Users can insert their own payment transactions
CREATE POLICY "Users can create their own payment transactions" 
  ON public.payment_transactions 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = payment_transactions.order_id 
    AND orders.user_id = auth.uid()
  ));

-- Add trigger for updated_at
CREATE TRIGGER trigger_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_merchant_id ON public.payment_transactions(merchant_transaction_id);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
