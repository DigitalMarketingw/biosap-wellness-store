import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tag, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CouponApplyProps {
  appliedCoupon: any;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => void;
  isLoading: boolean;
}

const CouponApply = ({ appliedCoupon, onApplyCoupon, onRemoveCoupon, isLoading }: CouponApplyProps) => {
  const [couponCode, setCouponCode] = useState('');
  const { toast } = useToast();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive"
      });
      return;
    }

    try {
      await onApplyCoupon(couponCode.trim().toUpperCase());
      setCouponCode('');
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="h-4 w-4 text-green-600" />
        <h3 className="font-medium text-green-800">Apply Coupon</h3>
      </div>

      {appliedCoupon ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-green-800">{appliedCoupon.code}</div>
              <div className="text-sm text-green-600">
                {appliedCoupon.type === 'percentage' 
                  ? `${appliedCoupon.value}% off` 
                  : `₹${appliedCoupon.value} off`}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveCoupon}
              className="text-green-700 hover:text-green-800 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleApplyCoupon}
            disabled={isLoading || !couponCode.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Applying...' : 'Apply'}
          </Button>
        </div>
      )}

      <div className="mt-3 text-xs text-green-600">
        💡 Try code WELCOME10 for 10% off your first order
      </div>
    </Card>
  );
};

export default CouponApply;