
import { supabase } from "@/integrations/supabase/client";
import { createDNSRecords } from "@/utils/dns";
import { toast } from "sonner";
import { verifyDomainSetup } from "./verification";

export const registerDomain = async (
  userId: string,
  subdomain: string,
  domainSuffix: string,
  includeEmail: boolean
) => {
  try {
    // Step 1: Create DNS records
    const dnsResponse = await createDNSRecords(subdomain, domainSuffix, includeEmail);
    
    if (!dnsResponse.success) {
      throw new Error("Failed to create DNS records: " + (dnsResponse.error || "Unknown error"));
    }

    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    // Step 2: Create domain in database with initial pending status
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
      // Rollback DNS records if database insert fails
      await supabase.functions.invoke("domain-dns", {
        body: {
          action: "delete",
          subdomain: subdomain.trim(),
          domain: domainSuffix
        }
      });
      throw dbError;
    }

    // Step 3: Start DNS verification process with improved tracking
    if (domainData) {
      await verifyDomainSetup(subdomain, domainSuffix, userId, domainData.id);
    }

    return true;
  } catch (error: any) {
    console.error("Error registering domain:", error.message);
    throw error;
  }
};
