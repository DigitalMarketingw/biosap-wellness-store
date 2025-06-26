
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePhonePePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const initiatePayment = async (orderId: string) => {
    setIsProcessing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      console.log('PhonePe Payment Hook - Initiating payment for order:', orderId);

      const response = await fetch(`https://heawuwxajoduoqumycxd.supabase.co/functions/v1/phonepe-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'initiate',
          orderId
        }),
      });

      const result = await response.json();
      console.log('PhonePe Payment Hook - Response:', result);

      if (result.success && result.paymentUrl) {
        // Redirect to PhonePe PG payment page
        console.log('PhonePe Payment Hook - Redirecting to:', result.paymentUrl);
        window.location.href = result.paymentUrl;
        return { success: true, merchantTransactionId: result.merchantTransactionId };
      } else {
        console.error('PhonePe Payment Hook - Error:', result);
        
        // Show more specific error messages
        let errorMessage = 'Failed to initiate payment';
        if (result.error) {
          errorMessage = result.error;
        } else if (result.details) {
          errorMessage = `Payment setup failed: ${JSON.stringify(result.details)}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('PhonePe Payment Hook - Error:', error);
      
      let errorMessage = "Failed to initiate payment";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (merchantTransactionId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      console.log('PhonePe Payment Hook - Verifying payment:', merchantTransactionId);

      const response = await fetch(`https://heawuwxajoduoqumycxd.supabase.co/functions/v1/phonepe-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'verify',
          transactionId: merchantTransactionId
        }),
      });

      const result = await response.json();
      console.log('PhonePe Payment Hook - Verification result:', result);
      return result;
    } catch (error) {
      console.error('PhonePe Payment Hook - Verification error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Verification failed' };
    }
  };

  return {
    initiatePayment,
    verifyPayment,
    isProcessing
  };
};
