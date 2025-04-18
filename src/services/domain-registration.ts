
import { supabase } from "@/integrations/supabase/client";
import { createDNSRecords } from "@/utils/dns-records";
import { toast } from "sonner";

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
      throw new Error("Failed to create DNS records: " + dnsResponse.error);
    }

    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    // Step 2: Create domain in database with initial pending status
    const { error: dbError } = await supabase.from("domains").insert({
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
        renewal_price: 19.99
      }
    });

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

    // Step 3: Start DNS verification process
    await verifyDomainSetup(subdomain, domainSuffix, userId);

    return true;
  } catch (error: any) {
    console.error("Error registering domain:", error.message);
    throw error;
  }
};

// New function to verify domain setup
async function verifyDomainSetup(subdomain: string, domainSuffix: string, userId: string) {
  const maxRetries = 5;
  const retryDelay = 10000; // 10 seconds
  let attempt = 0;

  const checkStatus = async () => {
    try {
      // Check DNS propagation
      const { data: dnsCheck } = await supabase.functions.invoke("domain-dns", {
        body: {
          action: "verify",
          subdomain: subdomain,
          domain: domainSuffix
        }
      });

      if (dnsCheck.success) {
        // Update domain status to active
        await supabase
          .from("domains")
          .update({
            settings: {
              dns_status: "active",
              dns_verified_at: new Date().toISOString(),
              vercel_status: "active"
            }
          })
          .eq("user_id", userId)
          .eq("subdomain", subdomain);

        return true;
      }

      if (attempt >= maxRetries) {
        console.error("Domain verification failed after maximum retries");
        return false;
      }

      attempt++;
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return await checkStatus();
    } catch (error) {
      console.error("Error verifying domain setup:", error);
      return false;
    }
  };

  // Start the verification process
  checkStatus().catch(console.error);
}
