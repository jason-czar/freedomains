
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.7.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, domain_name, domain_suffix, checkout_type } = await req.json();
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16'
    });

    console.log(`Creating checkout session for user ${user_id}, domain: ${domain_name}.${domain_suffix}, type: ${checkout_type}`);
    
    let customerId;

    // Check if the user already has a Stripe customer ID
    const customerCheck = await stripe.customers.list({
      metadata: {
        supabase_id: user_id,
      },
      limit: 1,
    });

    if (customerCheck.data.length > 0) {
      customerId = customerCheck.data[0].id;
    } else {
      // Create a new customer if one doesn't exist
      const customer = await stripe.customers.create({
        metadata: {
          supabase_id: user_id,
        },
      });

      customerId = customer.id;
    }

    // Get the origin for correct redirection
    const origin = req.headers.get("origin") || "";
    console.log(`Request origin: ${origin}`);
    
    // Create the Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: checkout_type === 'email' ? 'Email Service Activation' : 'Domain Registration',
              description: checkout_type === 'email' 
                ? `Email service for ${domain_name}.${domain_suffix}`
                : `Domain registration for ${domain_name}.${domain_suffix}`
            },
            unit_amount: checkout_type === 'email' ? 499 : 1999,
            recurring: checkout_type === 'email' ? {
              interval: 'month'
            } : undefined
          },
          quantity: 1,
        },
      ],
      mode: checkout_type === 'email' ? 'subscription' : 'payment',
      success_url: `${origin}/dashboard`,
      cancel_url: `${origin}/register-domain?canceled=true`,
    });

    console.log(`Created checkout session: ${session.id}`);
    console.log(`Success URL: ${origin}/dashboard`);
    
    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`Error creating checkout session: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
