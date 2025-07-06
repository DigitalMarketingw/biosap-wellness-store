
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
  console.log('Razorpay Edge Function - Request received:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.error('Invalid method:', req.method);
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for bypassing RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', {
      supabaseUrlExists: !!supabaseUrl,
      serviceKeyExists: !!supabaseServiceKey,
      supabaseUrl: supabaseUrl?.substring(0, 20) + '...'
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error',
          details: 'Missing Supabase configuration'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body with error handling
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      requestBody = JSON.parse(bodyText);
      console.log('Parsed request body:', requestBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request format',
          details: 'Unable to parse JSON body'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate request body structure
    if (!requestBody || typeof requestBody !== 'object') {
      console.error('Invalid request body structure:', requestBody);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request format',
          details: 'Request body must be a valid JSON object'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect action based on request body content
    const isCreateOrder = requestBody.orderId && requestBody.amount && 
                         !requestBody.razorpay_order_id && !requestBody.razorpay_payment_id;
    const isVerifyPayment = requestBody.razorpay_order_id && requestBody.razorpay_payment_id && 
                           requestBody.razorpay_signature;

    console.log('Request analysis:', {
      isCreateOrder,
      isVerifyPayment,
      hasOrderId: !!requestBody.orderId,
      hasAmount: !!requestBody.amount,
      hasRazorpayOrderId: !!requestBody.razorpay_order_id,
      hasRazorpayPaymentId: !!requestBody.razorpay_payment_id
    });

    if (isCreateOrder) {
      console.log('Processing create order request');
      return await handleCreateOrder(requestBody, supabaseClient);
    } else if (isVerifyPayment) {
      console.log('Processing verify payment request');
      return await handleVerifyPayment(requestBody, supabaseClient);
    } else {
      console.error('Unable to determine request type:', requestBody);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request format',
          details: 'Cannot determine action from request body'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Razorpay payment function error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleCreateOrder(requestData: CreateOrderRequest, supabaseClient: any) {
  const { orderId, amount } = requestData;

  console.log('=== CREATE ORDER HANDLER STARTED ===');
  console.log('Input data:', { orderId, amount, amountType: typeof amount });

  try {
    // Step 1: Validate input data
    if (!orderId || !amount || typeof amount !== 'number' || amount <= 0) {
      console.error('Invalid input data:', { orderId, amount });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid input data',
          details: 'orderId and valid amount are required'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Check Razorpay environment variables
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    console.log('Razorpay credentials check:', { 
      keyIdExists: !!razorpayKeyId, 
      keySecretExists: !!razorpayKeySecret,
      keyIdPreview: razorpayKeyId?.substring(0, 8) + '...',
      keySecretPreview: razorpayKeySecret?.substring(0, 8) + '...'
    });

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Missing Razorpay credentials');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment service configuration error',
          details: 'Razorpay credentials not configured'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Fetch order from database with enhanced error handling
    console.log('Fetching order from database:', orderId);
    
    let order;
    try {
      const { data: orderData, error: orderError } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      console.log('Database query result:', {
        orderData: orderData ? { id: orderData.id, user_id: orderData.user_id, total_amount: orderData.total_amount } : null,
        orderError: orderError
      });

      if (orderError) {
        console.error('Database error fetching order:', orderError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Database error', 
            details: orderError.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!orderData) {
        console.error('Order not found in database:', orderId);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Order not found',
            details: `No order found with ID: ${orderId}`
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      order = orderData;
      console.log('Order found successfully:', { 
        id: order.id, 
        userId: order.user_id, 
        amount: order.total_amount,
        status: order.status,
        paymentStatus: order.payment_status
      });

    } catch (dbError) {
      console.error('Database connection or query error:', dbError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Database connection error',
          details: dbError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: Create Razorpay order
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

    let razorpayOrder;
    try {
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
            details: `Status: ${razorpayResponse.status}, Error: ${errorText}`
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      razorpayOrder = await razorpayResponse.json();
      console.log('Razorpay order created successfully:', razorpayOrder);

    } catch (razorpayError) {
      console.error('Razorpay API request error:', razorpayError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to connect to Razorpay',
          details: razorpayError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 5: Create payment transaction record
    const merchantTransactionId = `razorpay_${orderId}_${Date.now()}`;
    
    console.log('Creating payment transaction record:', {
      orderId,
      merchantTransactionId,
      razorpayOrderId: razorpayOrder.id,
      amount
    });

    try {
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

    } catch (transactionDbError) {
      console.error('Database error creating transaction:', transactionDbError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Database error creating transaction',
          details: transactionDbError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 6: Return success response
    const responseData = {
      success: true,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: razorpayKeyId,
      merchant_transaction_id: merchantTransactionId,
    };

    console.log('=== CREATE ORDER SUCCESS ===');
    console.log('Returning response:', responseData);

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== CREATE ORDER ERROR ===');
    console.error('Unexpected error in handleCreateOrder:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
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

async function handleVerifyPayment(requestData: VerifyPaymentRequest, supabaseClient: any) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = requestData;

  console.log('=== VERIFY PAYMENT HANDLER STARTED ===');
  console.log('Input data:', { razorpay_order_id, razorpay_payment_id, orderId });

  try {
    // Step 1: Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      console.error('Missing required payment verification data');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing payment verification data' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Get Razorpay secret
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    
    if (!razorpayKeySecret || !razorpayKeyId) {
      console.error('Missing Razorpay credentials for verification');
      return new Response(
        JSON.stringify({ success: false, error: 'Payment service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Verify signature using Web Crypto API
    console.log('Verifying payment signature...');
    try {
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
        expectedLength: expectedSignature.length,
        receivedLength: razorpay_signature.length,
        match: expectedSignature === razorpay_signature
      });

      if (expectedSignature !== razorpay_signature) {
        console.error('Invalid payment signature');
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid payment signature' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Payment signature verified successfully');

    } catch (signatureError) {
      console.error('Error verifying signature:', signatureError);
      return new Response(
        JSON.stringify({ success: false, error: 'Signature verification failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: Fetch payment details from Razorpay
    console.log('Fetching payment details from Razorpay...');
    let paymentData;
    try {
      const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
        },
      });

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error('Failed to fetch payment details:', {
          status: paymentResponse.status,
          error: errorText
        });
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to verify payment with Razorpay' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      paymentData = await paymentResponse.json();
      console.log('Razorpay payment details fetched:', {
        id: paymentData.id,
        status: paymentData.status,
        amount: paymentData.amount
      });

    } catch (paymentFetchError) {
      console.error('Error fetching payment details:', paymentFetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch payment details' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 5: Update payment transaction
    console.log('Updating payment transaction...');
    try {
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

      console.log('Payment transaction updated successfully');

    } catch (updateDbError) {
      console.error('Database error updating transaction:', updateDbError);
      return new Response(
        JSON.stringify({ success: false, error: 'Database error updating payment status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 6: Update order status if payment successful
    if (paymentData.status === 'captured') {
      console.log('Updating order status to confirmed...');
      try {
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
          console.error('Failed to update order status:', orderUpdateError);
          // Don't fail the whole request for this, just log it
        } else {
          console.log('Order status updated successfully');
        }

      } catch (orderUpdateDbError) {
        console.error('Database error updating order:', orderUpdateDbError);
        // Don't fail the whole request for this, just log it
      }
    }

    // Step 7: Return success response
    const responseData = {
      success: true,
      status: paymentData.status,
      payment_id: razorpay_payment_id,
    };

    console.log('=== VERIFY PAYMENT SUCCESS ===');
    console.log('Returning response:', responseData);

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== VERIFY PAYMENT ERROR ===');
    console.error('Unexpected error in handleVerifyPayment:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(
      JSON.stringify({ success: false, error: 'Payment verification failed', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
