import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELETE-ORDER] ${step}${detailsStr}`);
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

    // Check if user is admin
    const { data: adminData } = await supabaseClient
      .from("admin_users")
      .select("admin_role")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!adminData) {
      throw new Error("Only administrators can delete orders");
    }

    const { orderId, reason } = await req.json();
    if (!orderId) throw new Error("Order ID is required");

    logStep("Deleting order", { orderId, reason });

    // Get order details for audit trail
    const { data: orderData, error: orderError } = await supabaseClient
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError) throw new Error(`Order not found: ${orderError.message}`);

    if (orderData.deleted_at) {
      throw new Error("Order is already deleted");
    }

    const now = new Date().toISOString();

    // Perform soft delete - update deleted_at timestamp
    const { error: deleteError } = await supabaseClient
      .from("orders")
      .update({
        status: "deleted",
        deleted_at: now,
        deleted_by: user.id,
        deletion_reason: reason || "Administrative deletion",
      })
      .eq("id", orderId);

    if (deleteError) throw new Error(`Failed to delete order: ${deleteError.message}`);

    // Log admin activity
    await supabaseClient
      .from("admin_activity_logs")
      .insert({
        admin_user_id: user.id,
        action: "delete_order",
        resource_type: "order",
        resource_id: orderId,
        details: {
          order_total: orderData.total_amount,
          order_status: orderData.status,
          deletion_reason: reason || "Administrative deletion",
          original_order_data: orderData
        }
      });

    logStep("Order deleted successfully", { orderId });

    return new Response(JSON.stringify({
      success: true,
      message: "Order deleted successfully",
      orderId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in delete-order", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});