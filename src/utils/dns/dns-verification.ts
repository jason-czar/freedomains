
import { supabase } from "@/integrations/supabase/client";
import { DNSVerificationResult } from "./types";

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
