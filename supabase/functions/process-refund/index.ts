import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation functions
const validateOrderId = (orderId: any): string => {
  if (!orderId || typeof orderId !== 'string') {
    throw new Error("Invalid order ID");
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(orderId)) {
    throw new Error("Invalid order ID format");
  }
  return orderId;
};

const validateAmount = (amount: any): number => {
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new Error("Invalid refund amount");
  }
  if (amount > 1000000) { // Max refund of ₹10,00,000
    throw new Error("Refund amount too large");
  }
  return amount;
};

const validateReason = (reason: any): string => {
  if (reason && typeof reason === 'string' && reason.length > 500) {
    throw new Error("Reason too long");
  }
  return reason || "Refund requested";
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-REFUND] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const requestBody = await req.json();
    const orderId = validateOrderId(requestBody.orderId);
    const amount = validateAmount(requestBody.amount);
    const reason = validateReason(requestBody.reason);

    logStep("Processing refund", { orderId, amount, reason });

    // Get order and payment transaction details
    const { data: orderData, error: orderError } = await supabaseClient
      .from("orders")
      .select("*, payment_transactions(*)")
      .eq("id", orderId)
      .single();

    if (orderError) throw new Error(`Order not found: ${orderError.message}`);

    const paymentTransaction = orderData.payment_transactions?.[0];
    if (!paymentTransaction || !paymentTransaction.razorpay_payment_id) {
      throw new Error("No valid payment transaction found for refund");
    }

    // Update refund status to processing
    await supabaseClient
      .from("orders")
      .update({
        refund_status: "processing",
        refund_amount: amount,
      })
      .eq("id", orderId);

    // Process Razorpay refund
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const refundUrl = `https://api.razorpay.com/v1/payments/${paymentTransaction.razorpay_payment_id}/refund`;

    const refundRequest = {
      amount: Math.round(amount * 100), // Convert to paise
      notes: {
        reason: reason || "Order refund",
        order_id: orderId,
      },
    };

    logStep("Making Razorpay refund request", { url: refundUrl, amount: refundRequest.amount });

    const refundResponse = await fetch(refundUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(refundRequest),
    });

    const refundData = await refundResponse.json();

    if (!refundResponse.ok) {
      logStep("Razorpay refund failed", refundData);
      
      // Update refund status to failed
      await supabaseClient
        .from("orders")
        .update({
          refund_status: "failed",
        })
        .eq("id", orderId);

      throw new Error(`Refund failed: ${refundData.error?.description || 'Unknown error'}`);
    }

    logStep("Razorpay refund successful", refundData);

    // Update order with successful refund details
    const now = new Date().toISOString();
    await supabaseClient
      .from("orders")
      .update({
        refund_status: "completed",
        refund_processed_at: now,
        refund_reference: refundData.id,
      })
      .eq("id", orderId);

    // Create a new payment transaction record for the refund
    await supabaseClient
      .from("payment_transactions")
      .insert({
        order_id: orderId,
        amount: -amount, // Negative amount for refund
        status: "completed",
        payment_method: "razorpay_refund",
        merchant_transaction_id: `refund_${Date.now()}`,
        razorpay_payment_id: refundData.id,
        razorpay_response: refundData,
      });

    logStep("Refund processed successfully", { orderId, refundId: refundData.id });

    return new Response(JSON.stringify({
      success: true,
      message: "Refund processed successfully",
      refundId: refundData.id,
      amount: amount,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-refund", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});