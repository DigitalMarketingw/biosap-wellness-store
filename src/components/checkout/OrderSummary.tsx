
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_urls: string[] | null;
    stock: number | null;
  };
}

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  totalPrice: number;
  paymentMethod: string;
  appliedCoupon?: any;
  isProcessing: boolean;
  isRazorpayProcessing: boolean;
  onSubmit: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  discountAmount,
  deliveryFee,
  totalPrice,
  paymentMethod,
  appliedCoupon,
  isProcessing,
  isRazorpayProcessing,
  onSubmit
}) => {
  return (
    <Card className="border-green-100 sticky top-4">
      <CardHeader>
        <CardTitle className="text-green-800">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span className="text-sm">{item.product.name} × {item.quantity}</span>
            <span className="text-sm">₹{(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        
        <Separator />
        
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        
        {appliedCoupon && discountAmount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Coupon ({appliedCoupon.code})</span>
            <span>-₹{discountAmount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span>Delivery</span>
          <span className={deliveryFee === 0 ? "text-green-600" : "text-orange-600"}>
            {deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`}
          </span>
        </div>
        
        <Separator />
        
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-green-800">₹{totalPrice.toFixed(2)}</span>
        </div>
        
        <Button
          onClick={onSubmit}
          disabled={isProcessing || isRazorpayProcessing}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isProcessing || isRazorpayProcessing 
            ? (paymentMethod === 'online' ? 'Processing Payment...' : 'Processing Order...') 
            : (paymentMethod === 'online' ? 'Pay with Razorpay' : 'Place Order')
          }
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
