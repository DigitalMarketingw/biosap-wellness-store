import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Coupon {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
}

export const useCoupon = () => {
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const applyCoupon = async (code: string) => {
    setIsLoading(true);
    try {
      const { data: promotion, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .single();

      if (error || !promotion) {
        throw new Error('Invalid or expired coupon code');
      }

      // Check usage limit
      if (promotion.usage_limit && promotion.usage_count >= promotion.usage_limit) {
        throw new Error('Coupon usage limit exceeded');
      }

      const coupon: Coupon = {
        id: promotion.id,
        code: promotion.code,
        name: promotion.name,
        type: promotion.type as 'percentage' | 'fixed',
        value: promotion.value,
        min_order_amount: promotion.min_order_amount,
        max_discount_amount: promotion.max_discount_amount
      };

      setAppliedCoupon(coupon);
      
      toast({
        title: "Coupon Applied!",
        description: `${coupon.name} has been applied to your order`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply coupon",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast({
      title: "Coupon Removed",
      description: "Coupon has been removed from your order",
    });
  };

  const calculateDiscount = (subtotal: number): number => {
    if (!appliedCoupon) return 0;

    // Check minimum order amount
    if (appliedCoupon.min_order_amount && subtotal < appliedCoupon.min_order_amount) {
      return 0;
    }

    let discount = 0;
    if (appliedCoupon.type === 'percentage') {
      discount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discount = appliedCoupon.value;
    }

    // Apply maximum discount limit
    if (appliedCoupon.max_discount_amount && discount > appliedCoupon.max_discount_amount) {
      discount = appliedCoupon.max_discount_amount;
    }

    return Math.min(discount, subtotal);
  };

  return {
    appliedCoupon,
    isLoading,
    applyCoupon,
    removeCoupon,
    calculateDiscount
  };
};