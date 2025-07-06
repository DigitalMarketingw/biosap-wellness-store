
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RazorpayOrderRequest {
  orderId: string;
  amount: number;
}

interface RazorpayVerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}

serve(async (req) => {
  console.log('🚀 Razorpay Edge Function Started');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Step 1: Environment validation with detailed logging
    console.log('🔍 Checking environment variables...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasRazorpayKeyId: !!razorpayKeyId,
      hasRazorpayKeySecret: !!razorpayKeySecret,
      supabaseUrlLength: supabaseUrl?.length || 0,
      razorpayKeyIdLength: razorpayKeyId?.length || 0,
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error - Supabase credentials missing',
          details: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('❌ Missing Razorpay credentials');
      console.error('RAZORPAY_KEY_ID present:', !!razorpayKeyId);
      console.error('RAZORPAY_KEY_SECRET present:', !!razorpayKeySecret);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment service not configured',
          details: 'Razorpay credentials missing. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Supabase secrets.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Initialize Supabase client
    console.log('🔧 Initializing Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 3: Parse request body with detailed error handling
    console.log('📝 Parsing request body...');
    let requestBody: RazorpayOrderRequest | RazorpayVerifyRequest;
    
    try {
      const bodyText = await req.text();
      console.log('Raw request body length:', bodyText.length);
      console.log('Raw request body preview:', bodyText.substring(0, 200));
      
      if (!bodyText.trim()) {
        throw new Error('Empty request body');
      }
      
      requestBody = JSON.parse(bodyText);
      console.log('✅ Successfully parsed request body');
      console.log('Request body keys:', Object.keys(requestBody));
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request body',
          details: parseError.message
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: Route to appropriate handler
    console.log('🔀 Routing request...');
    
    if ('orderId' in requestBody && 'amount' in requestBody && !('razorpay_payment_id' in requestBody)) {
      console.log('📋 Routing to order creation');
      return await handleCreateOrder(requestBody as RazorpayOrderRequest, supabase, razorpayKeyId, razorpayKeySecret);
    } 
    
    if ('razorpay_payment_id' in requestBody && 'razorpay_signature' in requestBody) {
      console.log('✅ Routing to payment verification');
      return await handleVerifyPayment(requestBody as RazorpayVerifyRequest, supabase, razorpayKeyId, razorpayKeySecret);
    }
    
    console.error('❌ Invalid request format:', requestBody);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Invalid request format',
        details: 'Request must contain either (orderId, amount) for order creation or (razorpay_payment_id, razorpay_signature) for verification'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Unexpected error in main handler:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleCreateOrder(
  requestData: RazorpayOrderRequest, 
  supabase: any, 
  razorpayKeyId: string, 
  razorpayKeySecret: string
) {
  console.log('🏗️ === Creating Razorpay Order ===');
  const { orderId, amount } = requestData;

  try {
    // Step 1: Validate input
    console.log('🔍 Validating input data...');
    console.log('Order ID:', orderId);
    console.log('Amount:', amount);

    if (!orderId || !amount || amount <= 0) {
      console.error('❌ Invalid order data:', { orderId, amount });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid order data',
          details: `orderId: ${orderId}, amount: ${amount}`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Fetch order from database
    console.log('📊 Fetching order from database...');
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('❌ Order fetch error:', orderError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Order not found',
          details: orderError.message
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Order found:', { id: order.id, amount: order.total_amount });

    // Step 3: Create Razorpay order
    console.log('💳 Creating Razorpay order...');
    const amountInPaise = Math.round(Number(amount) * 100);
    const razorpayOrderData = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_${orderId.substring(0, 8)}`,
    };

    console.log('Razorpay order data:', razorpayOrderData);

    const authHeader = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    console.log('Auth header created, making API call...');

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(razorpayOrderData),
    });

    console.log('Razorpay API response status:', razorpayResponse.status);
    console.log('Razorpay API response headers:', Object.fromEntries(razorpayResponse.headers.entries()));

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('❌ Razorpay order creation failed:', {
        status: razorpayResponse.status,
        statusText: razorpayResponse.statusText,
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
    console.log('✅ Razorpay order created:', razorpayOrder);

    // Step 4: Create payment transaction record
    console.log('💾 Creating payment transaction record...');
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
      console.error('❌ Failed to create payment transaction:', transactionError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create payment transaction',
          details: transactionError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Payment transaction created successfully');

    // Step 5: Return success response
    const response = {
      success: true,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: razorpayKeyId,
      merchant_transaction_id: merchantTransactionId,
    };

    console.log('🎉 Returning success response:', response);
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Error in handleCreateOrder:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Order creation failed',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleVerifyPayment(
  requestData: RazorpayVerifyRequest, 
  supabase: any, 
  razorpayKeyId: string, 
  razorpayKeySecret: string
) {
  console.log('🔐 === Verifying Payment ===');
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = requestData;

  try {
    console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id, orderId });

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
      console.error('❌ Invalid payment signature');
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
      console.error('❌ Failed to fetch payment details from Razorpay');
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
      console.error('❌ Failed to update payment transaction:', updateError);
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
        console.error('❌ Failed to update order status:', orderUpdateError);
      } else {
        console.log('✅ Order status updated successfully');
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
    console.error('💥 Error in handleVerifyPayment:', error);
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
