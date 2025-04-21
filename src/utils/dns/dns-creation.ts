
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DNSVerificationResult } from "./types";

export const createDNSRecords = async (
  subdomain: string,
  domainSuffix: string,
  includeEmail: boolean
): Promise<DNSVerificationResult> => {
  console.log(`[DNS Creation] Starting DNS record creation for ${subdomain}.${domainSuffix}, includeEmail: ${includeEmail}`);
  
  try {
    // Step 1: First check if the domain already exists in Cloudflare
    console.log("[DNS Creation] Checking if domain already exists...");
    const { data: checkData, error: checkError } = await supabase.functions.invoke("domain-dns", {
      body: {
        action: "check",
        subdomain: subdomain.trim(),
        domain: domainSuffix
      }
    });

    if (checkError) {
      console.error("[DNS Creation] Error checking domain existence:", checkError);
      throw new Error(`Error checking domain existence: ${checkError.message}`);
    }

    console.log("[DNS Creation] Domain check result:", checkData);
    
    if (!checkData.isAvailable) {
      console.warn("[DNS Creation] Domain already exists in Cloudflare DNS");
      return {
        success: false,
        error: "Domain already exists in Cloudflare DNS. Please try a different name.",
        message: "This subdomain is already registered. Please try a different name."
      };
    }
    
    // Step 2: Create main DNS records
    console.log("[DNS Creation] Creating main DNS records (A record and CNAMEs)...");
    
    // Define the records we want to create
    const mainRecordsToCreate = [{
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
    }];
    
    console.log("[DNS Creation] Records to create:", JSON.stringify(mainRecordsToCreate));
    
    const { data: mainRecords, error: mainError } = await supabase.functions.invoke("domain-dns", {
      body: {
        action: "create",
        subdomain: subdomain.trim(),
        domain: domainSuffix,
        records: mainRecordsToCreate
      }
    });

    if (mainError) {
      console.error("[DNS Creation] Edge function error creating main DNS records:", mainError);
      throw new Error(`Edge function error: ${mainError.message}`);
    }

    console.log("[DNS Creation] Edge function response:", mainRecords);

    if (!mainRecords.success) {
      console.error("[DNS Creation] Cloudflare error creating main DNS records:", 
                   mainRecords.errors || mainRecords.error || "Unknown error");
      throw new Error("Failed to create DNS records in Cloudflare: " + 
                     (mainRecords.errors || mainRecords.error || "Unknown error"));
    }

    console.log("[DNS Creation] Main DNS records created successfully:", mainRecords);

    // Step 3: Add email records if enabled
    if (includeEmail) {
      await createEmailDNSRecords(subdomain, domainSuffix);
    }

    // Step 4: Verify records were created properly
    return await verifyDNSSetup(subdomain, domainSuffix, mainRecords);

  } catch (error) {
    console.error("[DNS Creation] Fatal error in createDNSRecords:", error);
    toast.error("Failed to create DNS records: " + (error.message || "Unknown error"));
    throw error;
  }
};

async function createEmailDNSRecords(subdomain: string, domainSuffix: string) {
  console.log("[DNS Creation] Adding email DNS records");
  
  // Define the email records we want to create
  const emailRecordsToCreate = [
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
  ];
  
  console.log("[DNS Creation] Email records to create:", JSON.stringify(emailRecordsToCreate));
  
  const { data: emailRecords, error: emailError } = await supabase.functions.invoke("domain-dns", {
    body: {
      action: "create",
      subdomain: subdomain.trim(),
      domain: domainSuffix,
      records: emailRecordsToCreate
    }
  });

  if (emailError) {
    console.error("[DNS Creation] Warning: Email DNS setup had issues:", emailError);
    // Don't throw here, as main records are already set
  } else if (!emailRecords.success) {
    console.warn("[DNS Creation] Cloudflare warning for email records:", 
                emailRecords.errors || emailRecords.error || "Unknown issue");
  } else {
    console.log("[DNS Creation] Email DNS records created successfully");
  }
}

async function verifyDNSSetup(subdomain: string, domainSuffix: string, mainRecords: any): Promise<DNSVerificationResult> {
  try {
    console.log("[DNS Creation] Starting DNS verification...");
    const { data: verificationData, error: verificationError } = await supabase.functions.invoke("domain-dns", {
      body: {
        action: "verify",
        subdomain: subdomain.trim(),
        domain: domainSuffix
      }
    });

    if (verificationError) {
      console.warn("[DNS Creation] Error during DNS verification:", verificationError);
      return {
        ...mainRecords,
        verification: {
          success: false,
          message: "DNS records created but verification check failed: " + verificationError.message
        }
      };
    }

    console.log("[DNS Creation] Verification response:", verificationData);

    if (!verificationData.success) {
      console.warn("[DNS Creation] DNS verification failed:", verificationData.error || "Unknown reason");
      return {
        ...mainRecords,
        verification: {
          success: false,
          message: "DNS records created but not yet verified. This may take a few minutes to propagate."
        }
      };
    }

    console.log("[DNS Creation] DNS verification successful:", verificationData);
    return {
      ...mainRecords,
      verification: {
        success: true,
        records: verificationData.records
      }
    };
  } catch (verifyError) {
    console.warn("[DNS Creation] Exception during DNS verification:", verifyError);
    return {
      ...mainRecords,
      verification: {
        success: false,
        message: "DNS records created but verification check failed."
      }
    };
  }
}
