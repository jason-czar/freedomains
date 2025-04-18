
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const createDNSRecords = async (subdomain: string, domainSuffix: string, includeEmail: boolean) => {
  const { data: cfData, error: cfError } = await supabase.functions.invoke("domain-dns", {
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

  if (cfError) throw cfError;
  if (!cfData.success) {
    throw new Error("Failed to create DNS records: " + JSON.stringify(cfData.cloudflareResponse?.errors));
  }

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
    }
  }
};
