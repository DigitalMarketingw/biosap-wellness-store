
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreateOrderRequest {
  orderId: string;
  amount: number;
}

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody = await req.json();
    console.log('Razorpay Edge Function - Request body:', requestBody);

    // Detect action based on request body content
    const isCreateOrder = requestBody.orderId && requestBody.amount && 
                         !requestBody.razorpay_order_id && !requestBody.razorpay_payment_id;
    const isVerifyPayment = requestBody.razorpay_order_id && requestBody.razorpay_payment_id && 
                           requestBody.razorpay_signature;

    if (isCreateOrder) {
      console.log('Detected create order request');
      return await handleCreateOrder(requestBody, supabaseClient);
    } else if (isVerifyPayment) {
      console.log('Detected verify payment request');
      return await handleVerifyPayment(requestBody, supabaseClient);
    } else {
      console.error('Invalid request - cannot determine action:', requestBody);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Razorpay payment error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleCreateOrder(requestData: CreateOrderRequest, supabaseClient: any) {
  const { orderId, amount } = requestData;

  console.log('Creating Razorpay order for:', { orderId, amount });

  try {
    // Check environment variables first
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    console.log('Environment variables check:', { 
      keyIdExists: !!razorpayKeyId, 
      keySecretExists: !!razorpayKeySecret,
      keyIdLength: razorpayKeyId?.length || 0,
      keySecretLength: razorpayKeySecret?.length || 0
    });

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not found in environment');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment service configuration error',
          details: `Missing credentials: keyId=${!razorpayKeyId}, keySecret=${!razorpayKeySecret}`
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify order exists
    console.log('Fetching order from database:', orderId);
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Order fetch error:', orderError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Order not found', 
          details: orderError.message,
          orderId: orderId
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!order) {
      console.error('Order not found in database:', orderId);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Order not found',
          orderId: orderId
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order found:', { id: order.id, userId: order.user_id, amount: order.total_amount });

    // Create Razorpay order
    const razorpayOrderData = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${orderId}`,
      notes: {
        orderId: orderId,
        userId: order.user_id,
      },
    };

    console.log('Creating Razorpay order with data:', razorpayOrderData);

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(razorpayOrderData),
    });

    console.log('Razorpay API response status:', razorpayResponse.status);

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay order creation failed:', {
        status: razorpayResponse.status,
        statusText: razorpayResponse.statusText,
        body: errorText
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create payment order with Razorpay', 
          details: `Status: ${razorpayResponse.status}, Body: ${errorText}`
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const razorpayOrder = await razorpayResponse.json();
    console.log('Razorpay order created successfully:', razorpayOrder);

    // Create payment transaction record
    const merchantTransactionId = `razorpay_${orderId}_${Date.now()}`;
    
    console.log('Creating payment transaction record:', {
      orderId,
      merchantTransactionId,
      razorpayOrderId: razorpayOrder.id
    });

    const { error: transactionError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        order_id: orderId,
        merchant_transaction_id: merchantTransactionId,
        amount: amount,
        payment_method: 'razorpay',
        status: 'pending',
        razorpay_order_id: razorpayOrder.id,
      });

    if (transactionError) {
      console.error('Failed to create payment transaction:', transactionError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create payment transaction', 
          details: transactionError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Payment transaction created successfully');

    const responseData = {
      success: true,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: razorpayKeyId,
      merchant_transaction_id: merchantTransactionId,
    };

    console.log('Returning success response:', responseData);

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleCreateOrder:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Order creation failed', 
        details: error.message,
        stack: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleVerifyPayment(requestData: VerifyPaymentRequest, supabaseClient: any) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = requestData;

  console.log('Verifying Razorpay payment:', { razorpay_order_id, razorpay_payment_id, orderId });

  try {
    // Verify signature using Web Crypto API
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!razorpayKeySecret) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payment service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create HMAC signature using Web Crypto API
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(razorpayKeySecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const data = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`);
    const signature = await crypto.subtle.sign('HMAC', key, data);
    
    // Convert signature to hex string
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedSignature !== razorpay_signature) {
      console.error('Invalid payment signature');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid payment signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch payment details from Razorpay
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      headers: {
        'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
      },
    });

    const paymentData = await paymentResponse.json();
    console.log('Razorpay payment details:', paymentData);

    // Update payment transaction
    const { error: updateError } = await supabaseClient
      .from('payment_transactions')
      .update({
        status: paymentData.status === 'captured' ? 'completed' : 'failed',
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        razorpay_response: paymentData,
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', razorpay_order_id);

    if (updateError) {
      console.error('Failed to update payment transaction:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update payment status', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update order status
    if (paymentData.status === 'captured') {
      const { error: orderUpdateError } = await supabaseClient
        .from('orders')
        .update({
          payment_status: 'completed',
          payment_completed_at: new Date().toISOString(),
          transaction_reference: razorpay_payment_id,
          status: 'confirmed',
        })
        .eq('id', orderId);

      if (orderUpdateError) {
        console.error('Failed to update order:', orderUpdateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: paymentData.status,
        payment_id: razorpay_payment_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleVerifyPayment:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Payment verification failed', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
