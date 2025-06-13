
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw } from 'lucide-react';

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card className="border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Payment Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Sorry, there was an issue processing your payment. Your order has not been placed.
            </p>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">What happened?</h3>
              <ul className="text-sm text-red-700 text-left space-y-1">
                <li>• Payment was cancelled or declined</li>
                <li>• Network connectivity issues</li>
                <li>• Bank server temporarily unavailable</li>
                <li>• Insufficient funds or card limit exceeded</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/checkout')} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={() => navigate('/cart')} 
                variant="outline" 
                className="w-full"
              >
                Back to Cart
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="ghost" 
                className="w-full"
              >
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentFailed;
