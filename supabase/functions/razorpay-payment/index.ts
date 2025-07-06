
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log('=== Razorpay Edge Function Started ===');
  console.log('Method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Environment validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasRazorpayKeyId: !!razorpayKeyId,
      hasRazorpayKeySecret: !!razorpayKeySecret,
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error - Supabase' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Missing Razorpay credentials');
      return new Response(
        JSON.stringify({ success: false, error: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      requestBody = JSON.parse(bodyText);
      console.log('Parsed request body:', requestBody);
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route to appropriate handler
    if (requestBody.orderId && requestBody.amount && !requestBody.razorpay_payment_id) {
      console.log('Routing to order creation');
      return await handleCreateOrder(requestBody, supabase, razorpayKeyId, razorpayKeySecret);
    } else if (requestBody.razorpay_payment_id && requestBody.razorpay_signature) {
      console.log('Routing to payment verification');
      return await handleVerifyPayment(requestBody, supabase, razorpayKeyId, razorpayKeySecret);
    } else {
      console.error('Invalid request format:', requestBody);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleCreateOrder(requestData: any, supabase: any, razorpayKeyId: string, razorpayKeySecret: string) {
  console.log('=== Creating Razorpay Order ===');
  const { orderId, amount } = requestData;

  try {
    // Validate input
    if (!orderId || !amount || amount <= 0) {
      console.error('Invalid order data:', { orderId, amount });
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid order data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch order from database
    console.log('Fetching order from database:', orderId);
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Order fetch error:', orderError);
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found', details: orderError.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order found:', { id: order.id, amount: order.total_amount });

    // Create Razorpay order
    const amountInPaise = Math.round(Number(amount) * 100);
    const razorpayOrderData = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_${orderId.substring(0, 8)}`,
    };

    console.log('Creating Razorpay order with data:', razorpayOrderData);

    const authHeader = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(razorpayOrderData),
    });

    console.log('Razorpay API response status:', razorpayResponse.status);

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay order creation failed:', {
        status: razorpayResponse.status,
        error: errorText
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create payment order',
          details: `Razorpay API error: ${razorpayResponse.status} - ${errorText}`
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const razorpayOrder = await razorpayResponse.json();
    console.log('Razorpay order created successfully:', razorpayOrder);

    // Create payment transaction record
    const merchantTransactionId = `razorpay_${orderId.substring(0, 8)}_${Date.now()}`;
    
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        order_id: orderId,
        merchant_transaction_id: merchantTransactionId,
        amount: Number(amount),
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

    // Return success response
    const response = {
      success: true,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: razorpayKeyId,
      merchant_transaction_id: merchantTransactionId,
    };

    console.log('Returning success response:', response);
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in handleCreateOrder:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Order creation failed',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleVerifyPayment(requestData: any, supabase: any, razorpayKeyId: string, razorpayKeySecret: string) {
  console.log('=== Verifying Payment ===');
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = requestData;

  try {
    // Verify signature using HMAC SHA256
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
    
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    console.log('Signature verification:', {
      match: expectedSignature === razorpay_signature
    });

    if (expectedSignature !== razorpay_signature) {
      console.error('Invalid payment signature');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid payment signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch payment details from Razorpay
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      headers: {
        'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
      },
    });

    if (!paymentResponse.ok) {
      console.error('Failed to fetch payment details from Razorpay');
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to verify payment with Razorpay' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymentData = await paymentResponse.json();
    console.log('Payment data from Razorpay:', {
      id: paymentData.id,
      status: paymentData.status,
      amount: paymentData.amount
    });

    // Update payment transaction
    const { error: updateError } = await supabase
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
    }

    // Update order status if payment successful
    if (paymentData.status === 'captured') {
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          payment_completed_at: new Date().toISOString(),
          transaction_reference: razorpay_payment_id,
          status: 'confirmed',
        })
        .eq('id', orderId);

      if (orderUpdateError) {
        console.error('Failed to update order status:', orderUpdateError);
      } else {
        console.log('Order status updated successfully');
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
      JSON.stringify({ 
        success: false, 
        error: 'Payment verification failed',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
