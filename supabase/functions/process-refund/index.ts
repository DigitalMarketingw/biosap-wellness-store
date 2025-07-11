import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { orderId, amount, reason } = await req.json();
    if (!orderId) throw new Error("Order ID is required");
    if (!amount) throw new Error("Refund amount is required");

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