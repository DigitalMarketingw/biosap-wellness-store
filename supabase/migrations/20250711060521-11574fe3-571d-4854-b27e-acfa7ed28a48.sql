-- Add missing foreign key relationship between orders and profiles
-- This will allow us to properly join orders with user profile data

-- First, let's add a foreign key constraint to link orders.user_id to profiles.id
ALTER TABLE public.orders 
ADD CONSTRAINT fk_orders_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also ensure we have proper indexing for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id_profiles ON public.orders (user_id);