
-- Phase 1: Remove Supplier Functionality
-- Drop foreign key constraint from products table
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_supplier_id_fkey;

-- Remove supplier_id column from products table
ALTER TABLE public.products DROP COLUMN IF EXISTS supplier_id;

-- Drop suppliers table and its policies
DROP TABLE IF EXISTS public.suppliers CASCADE;

-- Phase 2: Implement Subcategories System
-- Create subcategories table
CREATE TABLE public.subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add subcategory_id to products table
ALTER TABLE public.products ADD COLUMN subcategory_id UUID REFERENCES public.subcategories(id);

-- Enable RLS on subcategories
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subcategories
CREATE POLICY "Public can view active subcategories" 
  ON public.subcategories 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage subcategories" 
  ON public.subcategories 
  FOR ALL 
  USING (is_admin_user());

-- Create updated_at trigger for subcategories
CREATE TRIGGER trigger_subcategories_updated_at
  BEFORE UPDATE ON public.subcategories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_subcategories_category_id ON public.subcategories(category_id);
CREATE INDEX idx_subcategories_slug ON public.subcategories(slug);
CREATE INDEX idx_subcategories_active ON public.subcategories(is_active);
CREATE INDEX idx_products_subcategory_id ON public.products(subcategory_id);

-- Insert initial subcategories (assuming we have some categories)
-- Note: You'll need to replace the category_id values with actual UUIDs from your categories table
INSERT INTO public.subcategories (name, slug, description, sort_order) VALUES
  ('Women''s Wellness', 'womens-wellness', 'Products specifically designed for women''s health and wellness needs', 1),
  ('Digestive Health', 'digestive-health', 'Products to support healthy digestion and gut health', 2),
  ('Natural Detox', 'natural-detox', 'Natural detoxification and cleansing products', 3),
  ('Digestive Wellness', 'digestive-wellness', 'Comprehensive digestive wellness solutions', 4),
  ('Daily Vitality', 'daily-vitality', 'Products for everyday energy and vitality', 5),
  ('Herbal Supplements', 'herbal-supplements', 'Traditional herbal supplements and remedies', 6),
  ('Immunity Support', 'immunity-support', 'Products to boost and support immune system', 7),
  ('Stress Relief', 'stress-relief', 'Natural stress management and relaxation products', 8);
