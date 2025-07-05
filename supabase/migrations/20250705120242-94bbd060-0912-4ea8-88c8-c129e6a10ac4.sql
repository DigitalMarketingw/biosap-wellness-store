
-- Update payment_transactions table for Razorpay integration
ALTER TABLE public.payment_transactions 
DROP COLUMN phonepe_transaction_id,
DROP COLUMN phonepe_response;

-- Add Razorpay specific columns
ALTER TABLE public.payment_transactions 
ADD COLUMN razorpay_order_id TEXT,
ADD COLUMN razorpay_payment_id TEXT,
ADD COLUMN razorpay_signature TEXT,
ADD COLUMN razorpay_response JSONB;

-- Update default payment method
ALTER TABLE public.payment_transactions 
ALTER COLUMN payment_method SET DEFAULT 'razorpay';

-- Update orders table payment_method default
ALTER TABLE public.orders 
ALTER COLUMN payment_method SET DEFAULT 'razorpay';

-- Create index for faster Razorpay order lookups
CREATE INDEX idx_payment_transactions_razorpay_order_id ON public.payment_transactions(razorpay_order_id);
