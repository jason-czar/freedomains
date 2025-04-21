
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const createDNSRecords = async (subdomain: string, domainSuffix: string, includeEmail: boolean) => {
  console.log(`Creating DNS records for ${subdomain}.${domainSuffix}, includeEmail: ${includeEmail}`);
  
  try {
    // Step 1: Create main DNS records
    console.log("Calling domain-dns edge function to create main DNS records");
    const { data: mainRecords, error: mainError } = await supabase.functions.invoke("domain-dns", {
      body: {
        action: "create",
        subdomain: subdomain.trim(),
        domain: domainSuffix,
        records: [{
          type: "A",
          name: subdomain.trim(),
          content: "76.76.21.21",
          ttl: 1,
          proxied: true
        }, {
          type: "CNAME",
          name: `_vercel.${subdomain.trim()}`,
          content: "cname.vercel-dns.com",
          ttl: 1,
          proxied: false
        }, {
          type: "CNAME",
          name: `www.${subdomain.trim()}`,
          content: "cname.vercel-dns.com",
          ttl: 1,
          proxied: false
        }]
      }
    });

    if (mainError) {
      console.error("Edge function error creating main DNS records:", mainError);
      throw new Error(`Edge function error: ${mainError.message}`);
    }

    if (!mainRecords.success) {
      console.error("Cloudflare error creating main DNS records:", mainRecords.errors || mainRecords.error || "Unknown error");
      throw new Error("Failed to create DNS records in Cloudflare: " + (mainRecords.errors || mainRecords.error || "Unknown error"));
    }

    console.log("Main DNS records created successfully:", mainRecords);

    // Step 2: Add email records if enabled
    if (includeEmail) {
      console.log("Adding email DNS records");
      const { data: emailRecords, error: emailError } = await supabase.functions.invoke("domain-dns", {
        body: {
          action: "create",
          subdomain: subdomain.trim(),
          domain: domainSuffix,
          records: [
            {
              type: "MX",
              name: subdomain.trim(),
              content: "mx.zoho.com",
              priority: 10,
              ttl: 600,
              proxied: false
            },
            {
              type: "MX",
              name: subdomain.trim(),
              content: "mx2.zoho.com",
              priority: 20,
              ttl: 600,
              proxied: false
            },
            {
              type: "MX",
              name: subdomain.trim(),
              content: "mx3.zoho.com",
              priority: 50,
              ttl: 600,
              proxied: false
            },
            {
              type: "TXT",
              name: subdomain.trim(),
              content: "v=spf1 include:zoho.com ~all",
              ttl: 60,
              proxied: false
            }
          ]
        }
      });

      if (emailError) {
        console.error("Warning: Email DNS setup had issues:", emailError);
        // Don't throw here, as main records are already set
      } else if (!emailRecords.success) {
        console.warn("Cloudflare warning for email records:", emailRecords.errors || emailRecords.error || "Unknown issue");
      } else {
        console.log("Email DNS records created successfully");
      }
    }

    // Step 3: Verify records were created properly
    try {
      console.log("Verifying DNS records");
      const { data: verificationData, error: verificationError } = await supabase.functions.invoke("domain-dns", {
        body: {
          action: "verify",
          subdomain: subdomain.trim(),
          domain: domainSuffix
        }
      });

      if (verificationError) {
        console.warn("Error during DNS verification:", verificationError);
        return {
          ...mainRecords,
          verification: {
            success: false,
            message: "DNS records created but verification check failed: " + verificationError.message
          }
        };
      }

      if (!verificationData.success) {
        console.warn("DNS verification failed:", verificationData.error || "Unknown reason");
        return {
          ...mainRecords,
          verification: {
            success: false,
            message: "DNS records created but not yet verified. This may take a few minutes to propagate."
          }
        };
      }

      console.log("DNS verification successful:", verificationData);
      return {
        ...mainRecords,
        verification: {
          success: true,
          records: verificationData.records
        }
      };
    } catch (verifyError) {
      console.warn("Exception during DNS verification:", verifyError);
      return {
        ...mainRecords,
        verification: {
          success: false,
          message: "DNS records created but verification check failed."
        }
      };
    }
  } catch (error) {
    console.error("Fatal error in createDNSRecords:", error);
    toast.error("Failed to create DNS records: " + (error.message || "Unknown error"));
    throw error;
  }
};

export const checkDNSStatus = async (subdomain: string, domainSuffix: string) => {
  try {
    const { data, error } = await supabase.functions.invoke("domain-dns", {
      body: {
        action: "verify",
        subdomain: subdomain.trim(),
        domain: domainSuffix
      }
    });

    if (error) {
      console.error("Error checking DNS status:", error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (error: any) {
    console.error("Exception checking DNS status:", error);
    return { success: false, error: error.message };
  }
};

export const checkVercelStatus = async (subdomain: string, domainSuffix: string) => {
  try {
    const { data, error } = await supabase.functions.invoke("domain-dns", {
      body: {
        action: "check_vercel",
        subdomain: subdomain.trim(),
        domain: domainSuffix
      }
    });

    if (error) {
      console.error("Error checking Vercel domain status:", error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (error: any) {
    console.error("Exception checking Vercel domain status:", error);
    return { success: false, error: error.message };
  }
};
