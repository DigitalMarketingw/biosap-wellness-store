-- Add order cancellation and deletion tracking columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deletion_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_reference TEXT;

-- Create refund status enum
CREATE TYPE public.refund_status AS ENUM ('pending', 'processing', 'completed', 'failed');
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_status public.refund_status DEFAULT 'pending';

-- Update order status to include cancelled and deleted
DO $$ BEGIN
    CREATE TYPE public.order_status_new AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'deleted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_cancelled_at ON public.orders (cancelled_at);
CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON public.orders (deleted_at);
CREATE INDEX IF NOT EXISTS idx_orders_cancelled_by ON public.orders (cancelled_by);
CREATE INDEX IF NOT EXISTS idx_orders_deleted_by ON public.orders (deleted_by);

-- Update RLS policies to handle cancelled and deleted orders
CREATE POLICY "Admins can view cancelled and deleted orders" ON public.orders
FOR SELECT
USING (is_admin_user() AND (cancelled_at IS NOT NULL OR deleted_at IS NOT NULL));

CREATE POLICY "Users cannot view their deleted orders" ON public.orders
FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);