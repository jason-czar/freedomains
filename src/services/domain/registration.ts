
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
    console.log(`[Domain Registration] Starting registration for ${subdomain}.${domainSuffix}`);
    
    // Step 1: Create DNS records
    console.log(`[Domain Registration] Creating DNS records...`);
    const dnsResponse = await createDNSRecords(subdomain, domainSuffix, includeEmail);
    
    console.log(`[Domain Registration] DNS creation response:`, dnsResponse);
    
    if (!dnsResponse.success) {
      throw new Error("Failed to create DNS records: " + (dnsResponse.error || "Unknown error"));
    }

    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    // Step 2: Create domain in database with initial pending status
    console.log(`[Domain Registration] Creating domain record in database...`);
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
      console.error(`[Domain Registration] Database error:`, dbError);
      // Rollback DNS records if database insert fails
      console.log(`[Domain Registration] Rolling back DNS records...`);
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
      console.log(`[Domain Registration] Starting DNS verification for domain ID: ${domainData.id}`);
      await verifyDomainSetup(subdomain, domainSuffix, userId, domainData.id);
    }

    console.log(`[Domain Registration] Registration completed successfully`);
    return true;
  } catch (error: any) {
    console.error("Error registering domain:", error.message, error.stack);
    throw error;
  }
};
