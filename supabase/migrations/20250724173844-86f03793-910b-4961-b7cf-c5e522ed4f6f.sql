-- Phase 1: Critical Security Fixes

-- Fix RLS Policy Vulnerabilities
-- Remove insecure user_metadata references and replace with secure functions

-- First, drop problematic policies
DROP POLICY IF EXISTS "Allow admin to read categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin to read products" ON public.products;
DROP POLICY IF EXISTS "Allow admin insert" ON public.products;

-- Create secure admin checking functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER  
SET search_path = public
AS $$
  SELECT COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin', false);
$$;

-- Update existing is_admin function to fix search_path
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- Fix is_admin_user function with proper search_path
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = $1 
    AND is_active = true
  );
$$;

-- Fix get_admin_role function with proper search_path
CREATE OR REPLACE FUNCTION public.get_admin_role(user_id uuid DEFAULT auth.uid())
RETURNS admin_role
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT admin_role FROM public.admin_users 
  WHERE admin_users.user_id = $1 
  AND is_active = true;
$$;

-- Fix handle_new_user function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_id_val UUID;
  role_val TEXT;
  parent_user_id_val UUID;
BEGIN
  -- Extract metadata from the raw_user_meta_data
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    role_val := NEW.raw_user_meta_data->>'role';
  ELSE 
    -- Default role if not specified
    role_val := 'user';
  END IF;
  
  -- For admin users creating their first login, create a company as well
  IF role_val = 'admin' AND NEW.raw_user_meta_data->>'companyName' IS NOT NULL THEN
    INSERT INTO public.companies (name, admin_id)
    VALUES (NEW.raw_user_meta_data->>'companyName', NEW.id)
    RETURNING id INTO company_id_val;
  ELSIF NEW.raw_user_meta_data->>'companyId' IS NOT NULL THEN
    company_id_val := (NEW.raw_user_meta_data->>'companyId')::UUID;
  END IF;

  -- Handle parent_user_id if present
  IF NEW.raw_user_meta_data->>'parentUserId' IS NOT NULL AND 
     NEW.raw_user_meta_data->>'parentUserId' != 'parentUserId' THEN
    parent_user_id_val := (NEW.raw_user_meta_data->>'parentUserId')::UUID;
  ELSE
    parent_user_id_val := NULL;
  END IF;

  -- Now create the profile
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role, 
    company_id,
    parent_user_id
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'firstName', 
    NEW.raw_user_meta_data->>'lastName', 
    role_val, 
    company_id_val,
    parent_user_id_val
  );
  RETURN NEW;
END;
$$;

-- Fix other functions with proper search_path
CREATE OR REPLACE FUNCTION public.same_company(user_id1 uuid, user_id2 uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p1
    JOIN public.profiles p2 ON p1.company_id = p2.company_id
    WHERE p1.id = user_id1 AND p2.id = user_id2
  );
END;
$$;

-- Update timestamp trigger function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate secure admin policies for categories
CREATE POLICY "Admins can manage categories using secure function"
ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Recreate secure admin policies for products  
CREATE POLICY "Admins can manage products using secure function"
ON public.products
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Add input validation function for emails
CREATE OR REPLACE FUNCTION public.is_valid_email(email_input text)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN email_input ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

-- Add rate limiting table for security
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(identifier, action, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only admins can manage rate limits
CREATE POLICY "Admins can manage rate limits"
ON public.rate_limits
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());