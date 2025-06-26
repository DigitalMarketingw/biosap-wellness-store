
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCallback } from './callback-handler.ts';
import { initiatePhonePePayment, verifyPhonePePayment } from './payment-service.ts';
import { fetchOrderWithRetry, createPaymentTransaction, updatePaymentTransaction, updateOrderStatus, getOrderIdFromTransaction } from './database.ts';
import { generateMerchantTransactionId, formatPhoneNumber, cleanMerchantUserId, getFrontendUrl } from './utils.ts';
import { PhonePePaymentRequest } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Handle callback from PhonePe PG
    if (pathname.includes('/callback')) {
      return await handleCallback(req, supabaseClient);
    }

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { action, orderId, transactionId } = await req.json();
    console.log('PhonePe PG Request:', { action, orderId, transactionId, userId: user.id });

    if (action === 'initiate') {
      return await initiatePayment(supabaseClient, orderId, user.id, req);
    } else if (action === 'verify') {
      return await verifyPayment(supabaseClient, transactionId);
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('PhonePe PG payment error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function initiatePayment(supabaseClient: any, orderId: string, userId: string, req: Request) {
  console.log('PhonePe PG - Initiating payment for order:', orderId, 'user:', userId);
  
  // Get order with enhanced retry logic
  const order = await fetchOrderWithRetry(supabaseClient, orderId, userId);

  if (!order) {
    return new Response(
      JSON.stringify({ error: 'Order not found after retries' }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Generate merchant transaction ID
  const merchantTransactionId = generateMerchantTransactionId();
  
  // Create payment transaction record first
  const transactionResult = await createPaymentTransaction(
    supabaseClient, 
    orderId, 
    merchantTransactionId, 
    order.total_amount
  );

  if (!transactionResult.success) {
    return new Response(
      JSON.stringify({ error: 'Failed to create transaction', details: transactionResult.error }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Prepare PhonePe PG payment request
  const merchantId = Deno.env.get('PHONEPE_MERCHANT_ID')!;
  const frontendUrl = getFrontendUrl(req);
  
  const paymentRequest: PhonePePaymentRequest = {
    merchantId: merchantId,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: cleanMerchantUserId(userId),
    amount: Math.round(order.total_amount * 100), // Amount in paise
    redirectUrl: `${frontendUrl}/payment-success?merchantTransactionId=${merchantTransactionId}`,
    redirectMode: 'POST',
    callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/phonepe-payment/callback`,
    mobileNumber: formatPhoneNumber(order.shipping_address?.phone || ''),
    paymentInstrument: {
      type: 'PAY_PAGE'
    },
    deviceContext: {
      deviceOS: 'WEB'
    },
    expiresIn: 1800 // 30 minutes expiry
  };

  const result = await initiatePhonePePayment(paymentRequest);

  if (result.success && result.data?.instrumentResponse?.redirectInfo?.url) {
    // Update transaction with PhonePe transaction ID if available
    if (result.data.merchantTransactionId) {
      await updatePaymentTransaction(supabaseClient, merchantTransactionId, {
        phonepe_transaction_id: result.data.merchantTransactionId,
        phonepe_response: result
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: result.data.instrumentResponse.redirectInfo.url,
        merchantTransactionId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } else {
    console.error('PhonePe PG - Payment initiation failed:', result);
    
    // Update transaction status to failed
    await updatePaymentTransaction(supabaseClient, merchantTransactionId, {
      status: 'failed',
      phonepe_response: result
    });

    return new Response(
      JSON.stringify({ 
        error: 'Failed to initiate payment with PhonePe PG', 
        details: result,
        merchantTransactionId 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

async function verifyPayment(supabaseClient: any, merchantTransactionId: string) {
  const result = await verifyPhonePePayment(merchantTransactionId);

  // Update payment transaction
  await updatePaymentTransaction(supabaseClient, merchantTransactionId, {
    phonepe_transaction_id: result.data?.transactionId,
    status: result.success && result.data?.state === 'COMPLETED' ? 'completed' : 'failed',
    phonepe_response: result
  });

  // Update order if payment successful
  if (result.success && result.data?.state === 'COMPLETED') {
    const orderId = await getOrderIdFromTransaction(supabaseClient, merchantTransactionId);
    if (orderId) {
      await updateOrderStatus(supabaseClient, orderId, result.data.transactionId);
    }
  }

  return new Response(
    JSON.stringify(result),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
