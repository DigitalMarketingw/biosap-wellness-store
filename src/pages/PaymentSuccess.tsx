
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package } from 'lucide-react';
import { usePhonePePayment } from '@/hooks/usePhonePePayment';
import { useCart } from '@/contexts/CartContext';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPayment } = usePhonePePayment();
  const { clearCart } = useCart();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const merchantTransactionId = searchParams.get('merchantTransactionId');

  useEffect(() => {
    const verifyAndUpdatePayment = async () => {
      if (!merchantTransactionId) {
        console.log('PaymentSuccess - No merchant transaction ID found, redirecting to failed page');
        navigate('/payment-failed');
        return;
      }

      try {
        console.log('PaymentSuccess - Verifying payment for transaction:', merchantTransactionId);
        const result = await verifyPayment(merchantTransactionId);
        
        console.log('PaymentSuccess - Verification result:', result);
        
        if (result.success && result.data?.state === 'COMPLETED') {
          setPaymentVerified(true);
          setOrderDetails(result.data);
          await clearCart();
          console.log('PaymentSuccess - Payment verified successfully, cart cleared');
        } else {
          console.log('PaymentSuccess - Payment verification failed or not completed:', result);
          navigate('/payment-failed?merchantTransactionId=' + merchantTransactionId);
        }
      } catch (error) {
        console.error('PaymentSuccess - Payment verification failed:', error);
        navigate('/payment-failed?merchantTransactionId=' + merchantTransactionId);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAndUpdatePayment();
  }, [merchantTransactionId, verifyPayment, navigate, clearCart]);

  if (isVerifying) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Verifying Payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your payment with PhonePe</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card className="border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your payment has been processed successfully through PhonePe and your order has been confirmed.
            </p>
            
            {orderDetails && (
              <div className="bg-gray-50 p-4 rounded-lg text-left">
                <h3 className="font-semibold text-gray-800 mb-2">Payment Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono text-xs">{orderDetails.transactionId}</span>
                  </div>
                  {orderDetails.amount && (
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span>₹{(orderDetails.amount / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>PhonePe</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-600 font-semibold">{orderDetails.state}</span>
                  </div>
                  {merchantTransactionId && (
                    <div className="flex justify-between">
                      <span>Merchant TXN ID:</span>
                      <span className="font-mono text-xs">{merchantTransactionId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <Package className="w-5 h-5" />
              <span className="text-sm">Your order is being processed</span>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/profile')} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                View Order History
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
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

export default PaymentSuccess;
