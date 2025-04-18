
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { service, domainName } = await req.json();
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    // Get user from supabase auth
    const userResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: Deno.env.get("SUPABASE_ANON_KEY") || "",
      },
    });
    
    const userData = await userResponse.json();
    if (!userData.email) throw new Error("User not authenticated or email not available");

    // Check for existing customer or create new one
    const customers = await stripe.customers.list({ email: userData.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          user_id: userData.id,
        },
      });
      customerId = newCustomer.id;
    }

    let priceData;
    if (service === "email") {
      priceData = {
        currency: "usd",
        product_data: {
          name: "Email Service for " + domainName,
          description: "Professional email hosting with 5 mailboxes",
        },
        unit_amount: 499, // $4.99/month
        recurring: {
          interval: "month",
        },
      };
    } else if (service === "domain") {
      priceData = {
        currency: "usd",
        product_data: {
          name: "Domain Renewal for " + domainName,
          description: "Annual domain registration renewal",
        },
        unit_amount: 1999, // $19.99/year
        recurring: {
          interval: "year",
        },
      };
    } else {
      throw new Error("Invalid service specified");
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/billing?success=true`,
      cancel_url: `${req.headers.get("origin")}/billing?canceled=true`,
      metadata: {
        service,
        domain: domainName,
        user_id: userData.id,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
