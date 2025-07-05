
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

  const initiatePayment = async (orderId: string, customerInfo?: any) => {
    console.log('Razorpay - Initiating payment for order:', orderId);
    setIsProcessing(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Get order details from our database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*, order_items(*, product:products(*))')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        throw new Error('Order not found');
      }

      console.log('Razorpay - Order details:', order);

      // Create Razorpay order
      const { data, error } = await supabase.functions.invoke('razorpay-payment', {
        body: {
          orderId: orderId,
          amount: order.total_amount,
        },
        method: 'POST',
      });

      if (error) {
        console.error('Razorpay - Order creation error:', error);
        throw new Error('Failed to create payment order');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      console.log('Razorpay - Order created successfully:', data);

      // Prepare customer info - safely handle JSON type
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

      // Razorpay checkout options
      const options: RazorpayPaymentOptions = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpay_order_id,
        name: 'BIOSAP',
        description: 'Order Payment',
        handler: async (response: any) => {
          console.log('Razorpay - Payment response:', response);
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
            console.log('Razorpay - Payment cancelled by user');
            setIsProcessing(false);
            window.location.href = `/payment-failed?merchantTransactionId=${data.merchant_transaction_id}&reason=cancelled`;
          },
        },
      };

      // Open Razorpay checkout
      const rzp1 = new window.Razorpay(options);
      rzp1.open();

      return { success: true };
    } catch (error) {
      console.error('Razorpay - Payment initiation error:', error);
      setIsProcessing(false);
      throw error;
    }
  };

  const handlePaymentSuccess = async (response: any, orderId: string) => {
    try {
      console.log('Razorpay - Verifying payment:', response);

      const { data, error } = await supabase.functions.invoke('razorpay-payment', {
        body: {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          orderId: orderId,
        },
        method: 'POST',
      });

      if (error || !data.success) {
        console.error('Razorpay - Payment verification failed:', error);
        window.location.href = `/payment-failed?merchantTransactionId=${response.razorpay_payment_id}&reason=verification_failed`;
        return;
      }

      console.log('Razorpay - Payment verified successfully');
      // Redirect to enhanced thank you page instead of payment success
      window.location.href = `/thank-you?orderId=${orderId}&merchantTransactionId=${response.razorpay_payment_id}`;
    } catch (error) {
      console.error('Razorpay - Payment verification error:', error);
      window.location.href = `/payment-failed?merchantTransactionId=${response.razorpay_payment_id}&reason=error`;
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (merchantTransactionId: string) => {
    try {
      console.log('Razorpay - Verifying payment with transaction ID:', merchantTransactionId);

      const { data: transaction, error } = await supabase
        .from('payment_transactions')
        .select('*, orders(*)')
        .eq('razorpay_payment_id', merchantTransactionId)
        .single();

      if (error || !transaction) {
        console.error('Razorpay - Transaction not found:', error);
        return { success: false, error: 'Transaction not found' };
      }

      return {
        success: transaction.status === 'completed',
        data: {
          state: transaction.status === 'completed' ? 'COMPLETED' : 'FAILED',
          transactionId: transaction.razorpay_payment_id,
          amount: transaction.amount * 100, // Convert back to paise for display
        },
      };
    } catch (error) {
      console.error('Razorpay - Payment verification error:', error);
      return { success: false, error: 'Verification failed' };
    }
  };

  return {
    initiatePayment,
    verifyPayment,
    isProcessing,
  };
};
