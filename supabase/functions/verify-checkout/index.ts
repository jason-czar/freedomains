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
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

    // Get session ID from request
    const { session_id } = await req.json();
    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "Session ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Verifying checkout session: ${session_id}`);

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Payment has not been completed yet" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract metadata from the session
    const metadata = session.metadata || {};
    const { domain_name, domain_suffix, user_id, checkout_type } = metadata;

    if (!domain_name || !domain_suffix || !user_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Missing required metadata in checkout session" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if domain already exists in database
    const { data: existingDomain, error: domainError } = await supabase
      .from("domains")
      .select("id, subdomain")
      .eq("subdomain", domain_name)
      .eq("user_id", user_id)
      .single();

    if (domainError && domainError.code !== "PGRST116") {
      console.error("Error checking for existing domain:", domainError);
    }

    // If domain already exists, return success
    if (existingDomain) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Domain has already been registered",
          domain: existingDomain
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If domain doesn't exist and payment is complete, manually trigger domain registration
    if (checkout_type === "domain") {
      console.log(`Domain not found in database. Manually registering ${domain_name}.${domain_suffix} for user ${user_id}`);
      
      // Call the registerDomain function from stripe-webhook
      await registerDomain(user_id, domain_name, domain_suffix, false);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Domain registration has been initiated. DNS records should be created shortly." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Checkout verified successfully" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`Error verifying checkout: ${error.message}`);
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
  console.log(`[Verify] Registering domain ${subdomain}.${domainSuffix} for user ${userId}`);
  
  try {
    // Step 1: Create DNS records
    console.log(`[Verify] Creating DNS records...`);
    const dnsResponse = await createDNSRecords(subdomain, domainSuffix, includeEmail);
    
    if (!dnsResponse.success) {
      throw new Error("Failed to create DNS records: " + (dnsResponse.error || "Unknown error"));
    }

    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    // Step 2: Create domain in database
    console.log(`[Verify] Creating domain record in database...`);
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
      console.error(`[Verify] Database error:`, dbError);
      // Rollback DNS records if database insert fails
      console.log(`[Verify] Rolling back DNS records...`);
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
      console.log(`[Verify] Starting DNS verification for domain ID: ${domainData.id}`);
      await verifyDomainSetup(subdomain, domainSuffix, userId, domainData.id);
    }

    console.log(`[Verify] Domain registration completed successfully`);
    return true;
  } catch (error) {
    console.error("[Verify] Error registering domain:", error.message, error.stack);
    throw error;
  }
}

// Function to create DNS records
async function createDNSRecords(
  subdomain: string,
  domainSuffix: string,
  includeEmail: boolean
) {
  console.log(`[Verify] Creating DNS records for ${subdomain}.${domainSuffix}`);
  
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
      console.error("[Verify] Edge function error creating DNS records:", mainError);
      throw new Error(`Edge function error: ${mainError.message}`);
    }

    if (!mainRecords.success) {
      console.error("[Verify] Cloudflare error creating DNS records:", 
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
    console.error("[Verify] Error creating DNS records:", error.message);
    return {
      success: false,
      error: error.message,
      message: "Failed to create DNS records"
    };
  }
}

// Function to create email DNS records
async function createEmailDNSRecords(subdomain: string, domainSuffix: string) {
  console.log("[Verify] Adding email DNS records");
  
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
    console.error("[Verify] Warning: Email DNS setup had issues:", emailError);
  } else if (!emailRecords.success) {
    console.warn("[Verify] Cloudflare warning for email records:", 
                emailRecords.errors || emailRecords.error || "Unknown issue");
  } else {
    console.log("[Verify] Email DNS records created successfully");
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
    console.log(`[Verify] Starting domain verification for ${subdomain}.${domainSuffix}`);
    
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
      console.error(`[Verify] Error updating domain verification status:`, updateError);
    }

    console.log(`[Verify] Domain verification completed for ${subdomain}.${domainSuffix}`);
  } catch (error) {
    console.error(`[Verify] Error verifying domain:`, error);
  }
}
