
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    const { domain } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const userResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: Deno.env.get("SUPABASE_ANON_KEY") || "",
      },
    });
    
    const userData = await userResponse.json();
    if (!userData.email) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: userData.id, email: userData.email });

    const customers = await stripe.customers.list({ email: userData.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found");
      return new Response(
        JSON.stringify({ 
          hasEmailService: false,
          domainRenewalDate: null 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      expand: ["data.items.data.price.product"],
    });

    let emailSubscription = null;
    let domainSubscription = null;

    for (const sub of subscriptions.data) {
      const product = sub.items.data[0].price.product as Stripe.Product;
      if (product.name.includes("Email Service") && product.name.includes(domain)) {
        emailSubscription = sub;
      } else if (product.name.includes("Domain Renewal") && product.name.includes(domain)) {
        domainSubscription = sub;
      }
    }

    logStep("Found subscriptions", { 
      hasEmail: !!emailSubscription, 
      hasDomain: !!domainSubscription 
    });

    return new Response(
      JSON.stringify({
        hasEmailService: !!emailSubscription,
        domainRenewalDate: domainSubscription 
          ? new Date(domainSubscription.current_period_end * 1000).toISOString()
          : null
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    logStep("Error occurred", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
