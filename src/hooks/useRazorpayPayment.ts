
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RazorpayPaymentOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
  retry: {
    enabled: true;
    max_count: 1;
  };
  timeout: 300;
  remember_customer: boolean;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayPaymentOptions) => {
      open: () => void;
    };
  }
}

export const useRazorpayPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async (orderId: string) => {
    console.log('=== Initiating Razorpay Payment ===');
    console.log('Order ID:', orderId);
    
    setIsProcessing(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Get order details from database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*, order_items(*, product:products(*))')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        console.error('Order not found:', orderError);
        throw new Error('Order not found');
      }

      console.log('Order details:', order);

      // Create Razorpay order via edge function
      console.log('Calling edge function to create Razorpay order...');
      
      try {
        const { data, error } = await supabase.functions.invoke('razorpay-payment', {
          body: {
            orderId: orderId,
            amount: order.total_amount,
          },
        });

        console.log('Edge function response:', { data, error });

        if (error) {
          console.error('Edge function error details:', error);
          throw new Error(`Failed to create payment order: ${error.message || JSON.stringify(error)}`);
        }

        if (!data?.success) {
          console.error('Order creation failed:', data);
          throw new Error(data?.error || 'Failed to create payment order');
        }

        console.log('Razorpay order created:', data);

        // Prepare customer info
        const shipping = order.shipping_address as any;
        const customerName = shipping && typeof shipping === 'object' 
          ? `${shipping.firstName || ''} ${shipping.lastName || ''}`.trim()
          : '';
        const customerEmail = shipping && typeof shipping === 'object' 
          ? shipping.email || ''
          : '';
        const customerPhone = shipping && typeof shipping === 'object' 
          ? shipping.phone || ''
          : '';

        // Configure Razorpay checkout options
        const options: RazorpayPaymentOptions = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          order_id: data.razorpay_order_id,
          name: 'BIOSAP',
          description: `Order #${orderId.slice(0, 8)}`,
          handler: async (response: any) => {
            console.log('Payment successful:', response);
            await handlePaymentSuccess(response, orderId);
          },
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: {
            color: '#22c55e',
          },
          modal: {
            ondismiss: () => {
              console.log('Payment cancelled by user');
              setIsProcessing(false);
              window.location.href = `/payment-failed?merchantTransactionId=${data.merchant_transaction_id}&reason=cancelled`;
            },
          },
          retry: {
            enabled: true,
            max_count: 1,
          },
          timeout: 300,
          remember_customer: false,
        };

        // Open Razorpay checkout
        console.log('Opening Razorpay checkout with options:', options);
        const rzp = new window.Razorpay(options);
        rzp.open();

        return { success: true };
      } catch (edgeFunctionError) {
        console.error('Edge function call failed:', edgeFunctionError);
        throw new Error(`Payment service error: ${edgeFunctionError.message}`);
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setIsProcessing(false);
      throw error;
    }
  };

  const handlePaymentSuccess = async (response: any, orderId: string) => {
    try {
      console.log('=== Verifying Payment ===');
      console.log('Payment response:', response);

      // Verify payment via edge function
      const { data, error } = await supabase.functions.invoke('razorpay-payment', {
        body: {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          orderId: orderId,
        },
      });

      if (error || !data?.success) {
        console.error('Payment verification failed:', error || data);
        window.location.href = `/payment-failed?merchantTransactionId=${response.razorpay_payment_id}&reason=verification_failed`;
        return;
      }

      console.log('Payment verified successfully');
      // Redirect to thank you page
      window.location.href = `/thank-you?orderId=${orderId}&merchantTransactionId=${response.razorpay_payment_id}`;
    } catch (error) {
      console.error('Payment verification error:', error);
      window.location.href = `/payment-failed?merchantTransactionId=${response.razorpay_payment_id}&reason=error`;
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (merchantTransactionId: string) => {
    try {
      console.log('Verifying payment with transaction ID:', merchantTransactionId);

      const { data: transaction, error } = await supabase
        .from('payment_transactions')
        .select('*, orders(*)')
        .eq('razorpay_payment_id', merchantTransactionId)
        .single();

      if (error || !transaction) {
        console.error('Transaction not found:', error);
        return { success: false, error: 'Transaction not found' };
      }

      return {
        success: transaction.status === 'completed',
        data: {
          state: transaction.status === 'completed' ? 'COMPLETED' : 'FAILED',
          transactionId: transaction.razorpay_payment_id,
          amount: transaction.amount * 100,
        },
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return { success: false, error: 'Verification failed' };
    }
  };

  return {
    initiatePayment,
    verifyPayment,
    isProcessing,
  };
};
