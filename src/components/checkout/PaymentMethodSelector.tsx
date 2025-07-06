
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Smartphone, Building2, Wallet } from 'lucide-react';

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
          <label className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="text-green-600"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Cash on Delivery</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Pay when your order arrives at your doorstep</p>
            </div>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
            <input
              type="radio"
              name="payment"
              value="online"
              checked={paymentMethod === 'online'}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="text-green-600"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                  R
                </div>
                <span className="font-medium">Pay Online with Razorpay</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Secure payment with multiple options</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-gray-500">UPI</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-500">Cards</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-gray-500">Net Banking</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Wallet className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs text-gray-500">Wallets</span>
                </div>
              </div>
            </div>
          </label>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
