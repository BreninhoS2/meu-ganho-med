import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Product ID to plan mapping
const PRODUCT_TO_PLAN: Record<string, string> = {
  "prod_TwVT7PQgjyfEtc": "start",
  "prod_TwVVy3Qj9rkrk5": "pro",
  "prod_TwVnkUxZzIrU4Q": "premium",
};

serve(async (req) => {
  try {
    logStep("Webhook received");
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const event = JSON.parse(body) as Stripe.Event;
    
    logStep("Event type", { type: event.type });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        
        logStep("Checkout completed", { userId, customerId, subscriptionId });

        if (userId && subscriptionId) {
          // Fetch subscription details to get the plan
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const productId = subscription.items.data[0].price.product as string;
          const plan = PRODUCT_TO_PLAN[productId] || "start";
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

          const { error } = await supabaseClient
            .from("subscriptions")
            .upsert({
              user_id: userId,
              plan: plan,
              status: "active",
              current_period_end: currentPeriodEnd,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: "user_id"
            });

          if (error) {
            logStep("Error upserting subscription", { error: error.message });
          } else {
            logStep("Subscription created/updated successfully", { plan });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        const customerId = subscription.customer as string;
        
        logStep("Subscription updated", { userId, customerId, status: subscription.status });

        if (userId) {
          const productId = subscription.items.data[0].price.product as string;
          const plan = PRODUCT_TO_PLAN[productId] || "start";
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

          let status: string;
          switch (subscription.status) {
            case "active":
              status = "active";
              break;
            case "past_due":
              status = "past_due";
              break;
            case "canceled":
            case "unpaid":
              status = "canceled";
              break;
            default:
              status = "incomplete";
          }

          const { error } = await supabaseClient
            .from("subscriptions")
            .upsert({
              user_id: userId,
              plan: plan,
              status: status,
              current_period_end: currentPeriodEnd,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: "user_id"
            });

          if (error) {
            logStep("Error updating subscription", { error: error.message });
          } else {
            logStep("Subscription status updated", { plan, status });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        
        logStep("Subscription deleted", { userId });

        if (userId) {
          const { error } = await supabaseClient
            .from("subscriptions")
            .update({
              status: "canceled",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          if (error) {
            logStep("Error canceling subscription", { error: error.message });
          } else {
            logStep("Subscription marked as canceled");
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
