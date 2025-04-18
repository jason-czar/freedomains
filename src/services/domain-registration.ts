
import { supabase } from "@/integrations/supabase/client";
import { createDNSRecords, checkDNSStatus, checkVercelStatus } from "@/utils/dns-records";
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

// Enhanced domain verification function with retries and status tracking
async function verifyDomainSetup(subdomain: string, domainSuffix: string, userId: string, domainId: string) {
  const maxRetries = 10; // Increased from 5 to 10 for more patience with DNS propagation
  const retryDelay = 15000; // Increased from 10 to 15 seconds
  let attempt = 0;

  const checkStatus = async () => {
    try {
      // Update verification in progress status
      await supabase
        .from("domains")
        .update({
          settings: supabase.sql`jsonb_set(settings, '{dns_verification_attempts}', to_jsonb(${attempt}))`,
        })
        .eq("id", domainId);

      // Check DNS propagation
      const dnsCheck = await checkDNSStatus(subdomain, domainSuffix);
      
      if (dnsCheck.success) {
        // DNS is propagated, now check Vercel verification
        const vercelCheck = await checkVercelStatus(subdomain, domainSuffix);
        
        // Update domain status based on verification results
        await supabase
          .from("domains")
          .update({
            settings: {
              dns_status: "active",
              dns_verified_at: new Date().toISOString(),
              vercel_status: vercelCheck.success ? "active" : "pending",
              dns_verification_complete: true,
              dns_verification_result: dnsCheck,
              vercel_verification_result: vercelCheck
            }
          })
          .eq("id", domainId);

        return true;
      }

      if (attempt >= maxRetries) {
        console.error("Domain verification failed after maximum retries");
        
        // Update status to show verification failed after max attempts
        await supabase
          .from("domains")
          .update({
            settings: {
              dns_status: "verification_failed",
              dns_verification_complete: true,
              dns_verification_max_attempts: true,
              dns_last_check_at: new Date().toISOString(),
              dns_verification_result: dnsCheck
            }
          })
          .eq("id", domainId);
          
        return false;
      }

      attempt++;
      
      // Update the database with current verification status
      await supabase
        .from("domains")
        .update({
          settings: {
            dns_status: "pending",
            dns_verification_in_progress: true,
            dns_last_check_at: new Date().toISOString(),
            dns_verification_attempts: attempt,
            dns_verification_result: dnsCheck
          }
        })
        .eq("id", domainId);
        
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return await checkStatus();
    } catch (error) {
      console.error("Error verifying domain setup:", error);
      
      // Update the database with error status
      await supabase
        .from("domains")
        .update({
          settings: {
            dns_status: "verification_error",
            dns_verification_error: String(error),
            dns_last_check_at: new Date().toISOString()
          }
        })
        .eq("id", domainId);
        
      return false;
    }
  };

  // Start the verification process in the background
  checkStatus().catch(error => {
    console.error("Background verification process error:", error);
  });
}

// New function to manually re-check domain verification
export const recheckDomainVerification = async (domainId: string, subdomain: string, domainSuffix: string) => {
  try {
    // Update status to show verification is in progress
    await supabase
      .from("domains")
      .update({
        settings: {
          dns_verification_in_progress: true,
          dns_recheck_requested_at: new Date().toISOString()
        }
      })
      .eq("id", domainId);
      
    // Check DNS propagation
    const dnsCheck = await checkDNSStatus(subdomain, domainSuffix);
    
    if (dnsCheck.success) {
      // DNS is propagated, now check Vercel verification
      const vercelCheck = await checkVercelStatus(subdomain, domainSuffix);
      
      // Update domain status based on verification results
      await supabase
        .from("domains")
        .update({
          settings: {
            dns_status: "active",
            dns_verified_at: new Date().toISOString(),
            vercel_status: vercelCheck.success ? "active" : "pending",
            dns_verification_complete: true,
            dns_verification_in_progress: false,
            dns_verification_result: dnsCheck,
            vercel_verification_result: vercelCheck,
            dns_last_check_at: new Date().toISOString()
          }
        })
        .eq("id", domainId);
        
      return { success: true, dnsCheck, vercelCheck };
    } else {
      // Update status to show verification still failed
      await supabase
        .from("domains")
        .update({
          settings: {
            dns_status: "verification_failed",
            dns_verification_in_progress: false,
            dns_last_check_at: new Date().toISOString(),
            dns_verification_result: dnsCheck
          }
        })
        .eq("id", domainId);
        
      return { success: false, dnsCheck };
    }
  } catch (error: any) {
    console.error("Error rechecking domain verification:", error);
    
    // Update the database with error status
    await supabase
      .from("domains")
      .update({
        settings: {
          dns_verification_in_progress: false,
          dns_status: "verification_error",
          dns_verification_error: error.message,
          dns_last_check_at: new Date().toISOString()
        }
      })
      .eq("id", domainId);
      
    return { success: false, error: error.message };
  }
};
