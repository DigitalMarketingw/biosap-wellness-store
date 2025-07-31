import React from 'react';
import { Card } from '@/components/ui/card';
import { Truck, AlertCircle } from 'lucide-react';

interface DeliveryConditionsProps {
  subtotal: number;
  paymentMethod: string;
}

const DeliveryConditions = ({ subtotal, paymentMethod }: DeliveryConditionsProps) => {
  const showDeliveryFee = subtotal < 500 || paymentMethod === 'cod';
  const deliveryFee = 50; // ₹50 delivery fee

  return (
    <Card className="p-4 border-amber-200 bg-amber-50">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-full">
          <Truck className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Delivery Conditions
          </h3>
          <div className="space-y-1 text-sm text-amber-700">
            <p>• Orders under ₹500: Delivery fee of ₹{deliveryFee} applicable</p>
            <p>• Cash on Delivery (COD): Delivery fee of ₹{deliveryFee} applicable</p>
            <p>• Orders above ₹500 with online payment: FREE delivery</p>
          </div>
          
          {showDeliveryFee && (
            <div className="mt-3 p-2 bg-amber-100 rounded border border-amber-200">
              <p className="text-sm font-medium text-amber-800">
                ⚠️ Delivery fee of ₹{deliveryFee} will be added to your order
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DeliveryConditions;