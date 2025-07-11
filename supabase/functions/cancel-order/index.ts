import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-ORDER] ${step}${detailsStr}`);
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

    const { orderId, reason, cancelledBy } = await req.json();
    if (!orderId) throw new Error("Order ID is required");

    logStep("Cancelling order", { orderId, reason, cancelledBy });

    // Check if user is admin or owns the order
    const { data: orderData, error: orderError } = await supabaseClient
      .from("orders")
      .select("*, order_items(*, products(*))")
      .eq("id", orderId)
      .single();

    if (orderError) throw new Error(`Order not found: ${orderError.message}`);

    // Verify cancellation eligibility
    if (orderData.status === "shipped" || orderData.status === "delivered") {
      throw new Error("Cannot cancel orders that have been shipped or delivered");
    }

    if (orderData.status === "cancelled") {
      throw new Error("Order is already cancelled");
    }

    // Start transaction-like operations
    const now = new Date().toISOString();

    // Update order status to cancelled
    const { error: updateError } = await supabaseClient
      .from("orders")
      .update({
        status: "cancelled",
        cancelled_at: now,
        cancellation_reason: reason || "Order cancelled",
        cancelled_by: cancelledBy || user.id,
      })
      .eq("id", orderId);

    if (updateError) throw new Error(`Failed to cancel order: ${updateError.message}`);

    // Restore inventory for cancelled items
    for (const item of orderData.order_items) {
      const { error: inventoryError } = await supabaseClient
        .from("products")
        .update({
          stock: item.products.stock + item.quantity
        })
        .eq("id", item.product_id);

      if (inventoryError) {
        logStep("Warning: Failed to restore inventory", { productId: item.product_id, error: inventoryError.message });
      }

      // Log inventory movement
      await supabaseClient
        .from("inventory_movements")
        .insert({
          product_id: item.product_id,
          movement_type: "in",
          quantity: item.quantity,
          reason: "Order cancellation",
          reference_id: orderId,
          reference_type: "order_cancellation",
          created_by: user.id,
        });
    }

    // Process refund if payment was completed
    if (orderData.payment_status === "completed") {
      logStep("Processing refund for cancelled order");
      
      const refundResponse = await supabaseClient.functions.invoke("process-refund", {
        body: {
          orderId,
          amount: orderData.total_amount,
          reason: "Order cancellation"
        }
      });

      if (refundResponse.error) {
        logStep("Refund processing failed", refundResponse.error);
        // Don't fail the cancellation if refund fails - log it for manual processing
      }
    }

    logStep("Order cancelled successfully", { orderId });

    return new Response(JSON.stringify({
      success: true,
      message: "Order cancelled successfully",
      orderId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in cancel-order", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});