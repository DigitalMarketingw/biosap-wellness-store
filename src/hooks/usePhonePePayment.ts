
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

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/phonepe-payment`, {
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

      if (result.success && result.paymentUrl) {
        // Redirect to PhonePe payment page
        window.location.href = result.paymentUrl;
        return { success: true, merchantTransactionId: result.merchantTransactionId };
      } else {
        throw new Error(result.error || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to initiate payment",
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

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/phonepe-payment`, {
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
      return result;
    } catch (error) {
      console.error('Payment verification error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Verification failed' };
    }
  };

  return {
    initiatePayment,
    verifyPayment,
    isProcessing
  };
};
