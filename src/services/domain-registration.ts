
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
    await createDNSRecords(subdomain, domainSuffix, includeEmail);

    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    const { error: dbError } = await supabase.from("domains").insert({
      user_id: userId,
      subdomain: subdomain.trim(),
      is_active: true,
      expires_at: expirationDate.toISOString(),
      settings: {
        domain_suffix: domainSuffix,
        delegation_type: "standard",
        dns_active: true,
        vercel_cname_added: true,
        email_enabled: includeEmail,
        free_first_year: true,
        renewal_price: 19.99
      }
    });

    if (dbError) {
      await supabase.functions.invoke("domain-dns", {
        body: {
          action: "delete",
          subdomain: subdomain.trim(),
          domain: domainSuffix
        }
      });
      throw dbError;
    }

    return true;
  } catch (error: any) {
    console.error("Error registering domain:", error.message);
    throw error;
  }
};
