
import { supabase } from "@/integrations/supabase/client";
import { checkDNSStatus, checkVercelStatus } from "@/utils/dns";

export async function verifyDomainSetup(subdomain: string, domainSuffix: string, userId: string, domainId: string) {
  const maxRetries = 10;
  const retryDelay = 15000;
  let attempt = 0;

  const checkStatus = async () => {
    try {
      console.log(`[Domain Verification] Attempt ${attempt + 1}/${maxRetries} for ${subdomain}.${domainSuffix}`);
      
      // Update verification in progress status
      await supabase
        .from("domains")
        .update({
          settings: {
            dns_verification_attempts: attempt,
            dns_verification_in_progress: true,
            dns_last_check_at: new Date().toISOString()
          }
        })
        .eq("id", domainId);

      // Check DNS propagation
      console.log(`[Domain Verification] Checking DNS status...`);
      const dnsCheck = await checkDNSStatus(subdomain, domainSuffix);
      console.log(`[Domain Verification] DNS check result:`, dnsCheck);
      
      if (dnsCheck.success) {
        // DNS is propagated, now check Vercel verification
        console.log(`[Domain Verification] DNS check successful, checking Vercel verification...`);
        const vercelCheck = await checkVercelStatus(subdomain, domainSuffix);
        console.log(`[Domain Verification] Vercel check result:`, vercelCheck);
        
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

        console.log(`[Domain Verification] Verification completed successfully`);
        return true;
      }

      if (attempt >= maxRetries) {
        console.error(`[Domain Verification] Failed after maximum retries for ${subdomain}.${domainSuffix}`);
        
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
        
      console.log(`[Domain Verification] Waiting ${retryDelay/1000}s before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return await checkStatus();
    } catch (error) {
      console.error(`[Domain Verification] Error:`, error);
      
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
    console.error(`[Domain Verification] Background process error:`, error);
  });
}

export async function recheckDomainVerification(domainId: string, subdomain: string, domainSuffix: string) {
  try {
    await supabase
      .from("domains")
      .update({
        settings: {
          dns_verification_in_progress: true,
          dns_recheck_requested_at: new Date().toISOString()
        }
      })
      .eq("id", domainId);
      
    const dnsCheck = await checkDNSStatus(subdomain, domainSuffix);
    
    if (dnsCheck.success) {
      const vercelCheck = await checkVercelStatus(subdomain, domainSuffix);
      
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
}
