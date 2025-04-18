
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const createDNSRecords = async (subdomain: string, domainSuffix: string, includeEmail: boolean) => {
  // Step 1: Create main DNS records
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
      }]
    }
  });

  if (mainError || !mainRecords.success) {
    console.error("Failed to create main DNS records:", mainError || mainRecords.errors);
    throw new Error("Failed to create DNS records");
  }

  // Step 2: Add email records if enabled
  if (includeEmail) {
    const { error: emailError } = await supabase.functions.invoke("domain-dns", {
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
            ttl: 1,
            proxied: false
          },
          {
            type: "MX",
            name: subdomain.trim(),
            content: "mx2.zoho.com",
            priority: 20,
            ttl: 1,
            proxied: false
          },
          {
            type: "TXT",
            name: subdomain.trim(),
            content: "v=spf1 include:zoho.com ~all",
            ttl: 1,
            proxied: false
          }
        ]
      }
    });

    if (emailError) {
      console.error("Warning: Email DNS setup had issues:", emailError);
      // Don't throw here, as main records are already set
    }
  }

  // Step 3: Verify records were created properly
  try {
    const { data: verificationData, error: verificationError } = await supabase.functions.invoke("domain-dns", {
      body: {
        action: "verify",
        subdomain: subdomain.trim(),
        domain: domainSuffix
      }
    });

    if (verificationError || !verificationData.success) {
      console.warn("DNS records created but verification failed:", verificationError || verificationData.error);
      return {
        ...mainRecords,
        verification: {
          success: false,
          message: "DNS records created but not yet verified. This may take a few minutes to propagate."
        }
      };
    }

    return {
      ...mainRecords,
      verification: {
        success: true,
        records: verificationData.records
      }
    };
  } catch (verifyError) {
    console.warn("Error during DNS verification:", verifyError);
    return {
      ...mainRecords,
      verification: {
        success: false,
        message: "DNS records created but verification check failed."
      }
    };
  }
};

// New function to check DNS propagation status
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

// New function to check Vercel domain verification status
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
