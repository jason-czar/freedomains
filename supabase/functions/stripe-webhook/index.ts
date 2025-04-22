import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.7.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Log every request to ensure the function is being called
  console.log("⚡️ Stripe webhook function called", {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    timestamp: new Date().toISOString()
  });
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }
  
  // Explicitly allow requests without authorization for Stripe webhooks
  console.log("Processing webhook without authorization check");

  try {
    // Get the Stripe secret key from environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not found");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Get the signature from the headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Webhook signature missing" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Verify the webhook signature
    const sig = req.headers.get("stripe-signature");
    console.log("Stripe signature received:", sig ? "✅ Present" : "❌ Missing");
    
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    console.log("Webhook secret:", webhookSecret ? "✅ Present" : "❌ Missing");
    
    const body = await req.text();
    console.log("Request body length:", body.length);
    console.log("Request body preview:", body.substring(0, 100) + "...");
    
    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Received Stripe webhook event: ${event.type}`);

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log(`Processing checkout session: ${session.id}`);
      
      // Extract metadata from the session
      const metadata = session.metadata || {};
      const { domain_name, domain_suffix, include_email, user_id, checkout_type } = metadata;
      
      if (!domain_name || !domain_suffix || !user_id) {
        console.error("Missing required metadata in checkout session");
        return new Response(
          JSON.stringify({ error: "Missing required metadata" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      console.log(`Domain registration for ${domain_name}.${domain_suffix}, user: ${user_id}`);
      
      // Register the domain by calling the domain-dns function
      if (checkout_type === "domain") {
        await registerDomain(user_id, domain_name, domain_suffix, include_email === "true");
      }
      
      // Update the user's stripe_customer_id if it's not already set
      if (session.customer) {
        await updateUserStripeCustomerId(user_id, session.customer);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Function to register a domain
async function registerDomain(
  userId: string,
  subdomain: string,
  domainSuffix: string,
  includeEmail: boolean
) {
  console.log(`[Webhook] Registering domain ${subdomain}.${domainSuffix} for user ${userId}`);
  
  try {
    // Step 1: Create DNS records
    console.log(`[Webhook] Creating DNS records...`);
    const dnsResponse = await createDNSRecords(subdomain, domainSuffix, includeEmail);
    
    if (!dnsResponse.success) {
      throw new Error("Failed to create DNS records: " + (dnsResponse.error || "Unknown error"));
    }

    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    // Step 2: Create domain in database
    console.log(`[Webhook] Creating domain record in database...`);
    const { data: domainData, error: dbError } = await supabase.from("domains").insert({
      user_id: userId,
      subdomain: subdomain.trim(),
      is_active: true,
      expires_at: expirationDate.toISOString(),
      settings: {
        domain_suffix: domainSuffix,
        delegation_type: "standard",
        dns_status: "pending",
        dns_records: dnsResponse.records,
        vercel_status: "pending",
        dns_verification_started: new Date().toISOString(),
        email_enabled: includeEmail,
        free_first_year: true,
        renewal_price: 19.99,
        verification_result: dnsResponse.verification || null
      }
    }).select("id").single();

    if (dbError) {
      console.error(`[Webhook] Database error:`, dbError);
      // Rollback DNS records if database insert fails
      console.log(`[Webhook] Rolling back DNS records...`);
      await supabase.functions.invoke("domain-dns", {
        body: {
          action: "delete",
          subdomain: subdomain.trim(),
          domain: domainSuffix
        }
      });
      throw dbError;
    }

    // Step 3: Start DNS verification process
    if (domainData) {
      console.log(`[Webhook] Starting DNS verification for domain ID: ${domainData.id}`);
      await verifyDomainSetup(subdomain, domainSuffix, userId, domainData.id);
    }

    console.log(`[Webhook] Domain registration completed successfully`);
    return true;
  } catch (error) {
    console.error("[Webhook] Error registering domain:", error.message, error.stack);
    throw error;
  }
}

// Function to create DNS records
async function createDNSRecords(
  subdomain: string,
  domainSuffix: string,
  includeEmail: boolean
) {
  console.log(`[Webhook] Creating DNS records for ${subdomain}.${domainSuffix}`);
  
  try {
    // Define the records we want to create - Use FULLY QUALIFIED domain names
    const mainRecordsToCreate = [{
      type: "A",
      name: `${subdomain.trim()}.${domainSuffix}`,
      content: "76.76.21.21",
      ttl: 1,
      proxied: true
    }, {
      type: "CNAME",
      name: `_vercel.${subdomain.trim()}.${domainSuffix}`,
      content: "cname.vercel-dns.com",
      ttl: 1,
      proxied: false
    }, {
      type: "CNAME",
      name: `www.${subdomain.trim()}.${domainSuffix}`,
      content: "cname.vercel-dns.com",
      ttl: 1,
      proxied: false
    }];
    
    // Call the domain-dns function to create the records
    const { data: mainRecords, error: mainError } = await supabase.functions.invoke("domain-dns", {
      body: {
        action: "create",
        subdomain: subdomain.trim(),
        domain: domainSuffix,
        records: mainRecordsToCreate,
        useFullyQualifiedNames: true
      }
    });

    if (mainError) {
      console.error("[Webhook] Edge function error creating DNS records:", mainError);
      throw new Error(`Edge function error: ${mainError.message}`);
    }

    if (!mainRecords.success) {
      console.error("[Webhook] Cloudflare error creating DNS records:", 
                  mainRecords.errors || mainRecords.error || "Unknown error");
      throw new Error("Failed to create DNS records in Cloudflare: " + 
                    (mainRecords.errors || mainRecords.error || "Unknown error"));
    }

    // Add email records if enabled
    if (includeEmail) {
      await createEmailDNSRecords(subdomain, domainSuffix);
    }

    return {
      success: true,
      records: mainRecords,
      verification: { success: true, message: "DNS records created successfully" }
    };
  } catch (error) {
    console.error("[Webhook] Error creating DNS records:", error.message);
    return {
      success: false,
      error: error.message,
      message: "Failed to create DNS records"
    };
  }
}

// Function to create email DNS records
async function createEmailDNSRecords(subdomain: string, domainSuffix: string) {
  console.log("[Webhook] Adding email DNS records");
  
  // Define the email records to create
  const emailRecordsToCreate = [
    {
      type: "MX",
      name: `${subdomain.trim()}.${domainSuffix}`,
      content: "mx.zoho.com",
      priority: 10,
      ttl: 600,
      proxied: false
    },
    {
      type: "MX",
      name: `${subdomain.trim()}.${domainSuffix}`,
      content: "mx2.zoho.com",
      priority: 20,
      ttl: 600,
      proxied: false
    },
    {
      type: "MX",
      name: `${subdomain.trim()}.${domainSuffix}`,
      content: "mx3.zoho.com",
      priority: 50,
      ttl: 600,
      proxied: false
    },
    {
      type: "TXT",
      name: `${subdomain.trim()}.${domainSuffix}`,
      content: "v=spf1 include:zoho.com ~all",
      ttl: 60,
      proxied: false
    }
  ];
  
  const { data: emailRecords, error: emailError } = await supabase.functions.invoke("domain-dns", {
    body: {
      action: "create",
      subdomain: subdomain.trim(),
      domain: domainSuffix,
      records: emailRecordsToCreate,
      useFullyQualifiedNames: true
    }
  });

  if (emailError) {
    console.error("[Webhook] Warning: Email DNS setup had issues:", emailError);
  } else if (!emailRecords.success) {
    console.warn("[Webhook] Cloudflare warning for email records:", 
                emailRecords.errors || emailRecords.error || "Unknown issue");
  } else {
    console.log("[Webhook] Email DNS records created successfully");
  }
}

// Function to verify domain setup
async function verifyDomainSetup(
  subdomain: string,
  domainSuffix: string,
  userId: string,
  domainId: string
) {
  try {
    console.log(`[Webhook] Starting domain verification for ${subdomain}.${domainSuffix}`);
    
    // Verify DNS records
    const { data: verificationData, error: verificationError } = await supabase.functions.invoke("domain-dns", {
      body: {
        action: "verify",
        subdomain: subdomain.trim(),
        domain: domainSuffix
      }
    });

    // Update domain status based on verification result
    const { error: updateError } = await supabase
      .from("domains")
      .update({
        settings: {
          dns_status: verificationData?.success ? "verified" : "pending",
          dns_verification_result: verificationData || null,
          dns_verification_completed: new Date().toISOString()
        }
      })
      .eq("id", domainId);

    if (updateError) {
      console.error(`[Webhook] Error updating domain verification status:`, updateError);
    }

    console.log(`[Webhook] Domain verification completed for ${subdomain}.${domainSuffix}`);
  } catch (error) {
    console.error(`[Webhook] Error verifying domain:`, error);
  }
}

// Function to update user's Stripe customer ID
async function updateUserStripeCustomerId(userId: string, customerId: string) {
  console.log(`[Webhook] Updating Stripe customer ID for user ${userId}: ${customerId}`);
  
  const { error } = await supabase
    .from("users")
    .update({ stripe_customer_id: customerId })
    .eq("id", userId);

  if (error) {
    console.error(`[Webhook] Error updating user's Stripe customer ID:`, error);
  } else {
    console.log(`[Webhook] Successfully updated Stripe customer ID for user ${userId}`);
  }
}
