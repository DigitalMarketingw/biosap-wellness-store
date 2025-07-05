
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentMethodSelectorProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  onPaymentMethodChange
}) => {
  return (
    <Card className="border-green-100">
      <CardHeader>
        <CardTitle className="text-green-800">Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="text-green-600"
            />
            <div className="flex-1">
              <span className="font-medium">Cash on Delivery</span>
              <p className="text-sm text-gray-600">Pay when your order arrives</p>
            </div>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
            <input
              type="radio"
              name="payment"
              value="online"
              checked={paymentMethod === 'online'}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="text-green-600"
            />
            <div className="flex-1">
              <span className="font-medium">Razorpay Payment</span>
              <p className="text-sm text-gray-600">Pay securely with UPI, Cards, Net Banking & more</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                RP
              </div>
            </div>
          </label>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
