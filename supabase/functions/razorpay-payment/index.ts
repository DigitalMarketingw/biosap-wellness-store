
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

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'create-order') {
      return await handleCreateOrder(req, supabaseClient);
    } else if (action === 'verify-payment') {
      return await handleVerifyPayment(req, supabaseClient);
    } else {
      return new Response('Invalid action', { status: 400, headers: corsHeaders });
    }
  } catch (error) {
    console.error('Razorpay payment error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleCreateOrder(req: Request, supabaseClient: any) {
  const { orderId, amount }: CreateOrderRequest = await req.json();

  console.log('Creating Razorpay order for:', { orderId, amount });

  // Verify order exists and belongs to authenticated user
  const { data: order, error: orderError } = await supabaseClient
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    console.error('Order not found:', orderError);
    return new Response(
      JSON.stringify({ error: 'Order not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Create Razorpay order
  const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
  const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

  if (!razorpayKeyId || !razorpayKeySecret) {
    console.error('Razorpay credentials not found');
    return new Response(
      JSON.stringify({ error: 'Payment service configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${orderId}`,
      notes: {
        orderId: orderId,
        userId: order.user_id,
      },
    }),
  });

  if (!razorpayResponse.ok) {
    const errorData = await razorpayResponse.text();
    console.error('Razorpay order creation failed:', errorData);
    return new Response(
      JSON.stringify({ error: 'Failed to create payment order' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const razorpayOrder = await razorpayResponse.json();
  console.log('Razorpay order created:', razorpayOrder);

  // Create payment transaction record
  const merchantTransactionId = `razorpay_${orderId}_${Date.now()}`;
  
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
      JSON.stringify({ error: 'Failed to create payment transaction' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: razorpayKeyId,
      merchant_transaction_id: merchantTransactionId,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleVerifyPayment(req: Request, supabaseClient: any) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }: VerifyPaymentRequest = await req.json();

  console.log('Verifying Razorpay payment:', { razorpay_order_id, razorpay_payment_id, orderId });

  // Verify signature
  const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
  if (!razorpayKeySecret) {
    return new Response(
      JSON.stringify({ error: 'Payment service configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const crypto = await import('node:crypto');
  const expectedSignature = crypto
    .createHmac('sha256', razorpayKeySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    console.error('Invalid payment signature');
    return new Response(
      JSON.stringify({ error: 'Invalid payment signature' }),
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
      JSON.stringify({ error: 'Failed to update payment status' }),
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
}
