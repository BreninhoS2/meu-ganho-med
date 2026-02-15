import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Product ID to plan mapping
const PRODUCT_TO_PLAN: Record<string, string> = {
  "prod_TwVT7PQgjyfEtc": "start",
  "prod_TwVVy3Qj9rkrk5": "pro",
  "prod_TwVnkUxZzIrU4Q": "premium",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user has admin role (all-access)
    const { data: rolesData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    
    const isAdmin = rolesData?.some(r => r.role === 'admin') ?? false;
    logStep("Admin check", { isAdmin, roles: rolesData?.map(r => r.role) });

    // If admin, grant premium access without checking Stripe
    if (isAdmin) {
      logStep("Admin user detected, granting premium access");
      return new Response(JSON.stringify({
        subscribed: true,
        plan: "premium",
        subscription_end: null,
        is_admin: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found, checking local subscriptions table");

      // Fallback: check subscriptions table for manually activated plans
      const { data: localSub } = await supabaseClient
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (localSub) {
        logStep("Found active local subscription", { plan: localSub.plan, end: localSub.current_period_end });
        return new Response(JSON.stringify({
          subscribed: true,
          plan: localSub.plan,
          subscription_end: localSub.current_period_end,
          is_admin: false,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      logStep("No local subscription found either, returning unsubscribed state");
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: null,
        subscription_end: null,
        is_admin: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check both active and trialing subscriptions
    let subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    if (subscriptions.data.length === 0) {
      subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "trialing",
        limit: 1,
      });
      logStep("Checked trialing subscriptions", { found: subscriptions.data.length });
    }
    
    const hasActiveSub = subscriptions.data.length > 0;
    let plan: string | null = null;
    let subscriptionEnd: string | null = null;
    let stripeSubscriptionId: string | null = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      stripeSubscriptionId = subscription.id;
      
      const productId = subscription.items.data[0].price.product as string;
      plan = PRODUCT_TO_PLAN[productId] || "start";
      
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        endDate: subscriptionEnd,
        productId,
        plan
      });

      // Upsert subscription in database
      const { error: upsertError } = await supabaseClient
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          plan: plan,
          status: "active",
          current_period_end: subscriptionEnd,
          stripe_customer_id: customerId,
          stripe_subscription_id: stripeSubscriptionId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id"
        });

      if (upsertError) {
        logStep("Error upserting subscription", { error: upsertError.message });
      } else {
        logStep("Subscription upserted in database");
      }
    } else {
      logStep("No active subscription found");
      
      // Update database to reflect no active subscription
      const { error: updateError } = await supabaseClient
        .from("subscriptions")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      
      if (updateError && updateError.code !== "PGRST116") {
        logStep("Error updating subscription status", { error: updateError.message });
      }
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan: plan,
      subscription_end: subscriptionEnd,
      is_admin: false,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});