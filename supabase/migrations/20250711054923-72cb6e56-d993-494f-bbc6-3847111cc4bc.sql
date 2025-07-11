-- Fix RLS policies for order management by admin users

-- Allow admin users to view and manage all orders
CREATE POLICY "Admins can manage all orders" 
ON public.orders 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Allow admin users to view all order items
CREATE POLICY "Admins can view all order items" 
ON public.order_items 
FOR SELECT 
USING (is_admin_user());

-- Allow admin users to update order items if needed
CREATE POLICY "Admins can update order items" 
ON public.order_items 
FOR UPDATE 
USING (is_admin_user());

-- Add index for better performance on orders table
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);

-- Add missing tracking and delivery tracking
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_url TEXT,
ADD COLUMN IF NOT EXISTS carrier TEXT;

-- Update the orders table to ensure proper timestamps
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'set_orders_updated_at'
  ) THEN
    CREATE TRIGGER set_orders_updated_at
      BEFORE UPDATE ON public.orders
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
  END IF;
END $$;