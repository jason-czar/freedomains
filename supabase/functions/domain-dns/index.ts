
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
};

// DNS Record Types
type DNSRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA';

// Interface for DNS record
interface DNSRecord {
  type: DNSRecordType;
  name: string;
  content: string;
  ttl?: number;
  priority?: number;
  proxied?: boolean;
}

// Main server function
serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Get environment variables
  const CLOUDFLARE_API_KEY = Deno.env.get('CLOUDFLARE_API_KEY');
  const CLOUDFLARE_ZONE_ID = Deno.env.get('CLOUDFLARE_ZONE_ID');

  if (!CLOUDFLARE_API_KEY || !CLOUDFLARE_ZONE_ID) {
    return new Response(
      JSON.stringify({ error: 'Missing Cloudflare credentials' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const { action, subdomain, domain, nameservers, records } = await req.json();
    
    // Use domain if provided, otherwise default to com.channel
    const domainSuffix = domain || 'com.channel';

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Set up Cloudflare API request headers
    const cloudflareHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CLOUDFLARE_API_KEY}`,
    };

    // Full domain to check/create (either subdomain.com.channel or subdomain.customdomain)
    const fullDomain = subdomain ? `${subdomain}.${domainSuffix}` : domainSuffix;

    if (action === 'check') {
      // Check if a DNS record already exists for this subdomain
      const checkUrl = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?name=${fullDomain}`;
      
      const response = await fetch(checkUrl, {
        method: 'GET',
        headers: cloudflareHeaders,
      });

      const data = await response.json();
      
      // If result array is empty, the domain is available
      const isAvailable = !data.result || data.result.length === 0;
      
      return new Response(
        JSON.stringify({ 
          isAvailable,
          fullDomain,
          cloudflareResponse: data
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } 
    else if (action === 'create') {
      // If nameservers are provided, create NS records for delegation
      if (nameservers && Array.isArray(nameservers) && nameservers.length > 0) {
        const nsRecords = [];
        
        // Create NS records for each nameserver
        for (const ns of nameservers) {
          const createNsUrl = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`;
          
          const nsResponse = await fetch(createNsUrl, {
            method: 'POST',
            headers: cloudflareHeaders,
            body: JSON.stringify({
              type: 'NS',
              name: fullDomain,
              content: ns,
              ttl: 3600, // 1 hour TTL for nameservers
              proxied: false // NS records cannot be proxied
            }),
          });

          const nsData = await nsResponse.json();
          nsRecords.push(nsData.result);
          
          console.log(`Created NS record for ${fullDomain} pointing to ${ns}:`, nsData);
        }
        
        return new Response(
          JSON.stringify({ 
            success: true,
            fullDomain,
            delegated: true,
            nsRecords: nsRecords,
            message: "Nameserver delegation completed"
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Default behavior: Create a new DNS record for the subdomain (A record)
      const createUrl = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`;
      
      const response = await fetch(createUrl, {
        method: 'POST',
        headers: cloudflareHeaders,
        body: JSON.stringify({
          type: 'A',
          name: fullDomain,
          content: '76.76.21.21', // Vercel's Edge Network IP
          ttl: 1, // Auto TTL
          proxied: true // Use Cloudflare proxy
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Now, let's update the SSL setting to make sure it's set to "Flexible"
        // This will ensure Cloudflare doesn't try to validate the SSL certificate on the origin
        const sslUrl = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/settings/ssl`;
        
        const sslResponse = await fetch(sslUrl, {
          method: 'PATCH',
          headers: cloudflareHeaders,
          body: JSON.stringify({
            value: 'flexible' // Flexible SSL allows Cloudflare to handle SSL termination
          }),
        });
        
        const sslData = await sslResponse.json();
        
        // Also enable Always Use HTTPS
        const httpsUrl = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/settings/always_use_https`;
        
        const httpsResponse = await fetch(httpsUrl, {
          method: 'PATCH',
          headers: cloudflareHeaders,
          body: JSON.stringify({
            value: 'on'
          }),
        });
        
        const httpsData = await httpsResponse.json();
        
        console.log("SSL settings updated:", sslData);
        console.log("HTTPS settings updated:", httpsData);
        
        // Set up CNAME for Vercel verification
        const vercelCnameUrl = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`;
        
        const vercelCnameResponse = await fetch(vercelCnameUrl, {
          method: 'POST',
          headers: cloudflareHeaders,
          body: JSON.stringify({
            type: 'CNAME',
            name: `_vercel.${fullDomain}`,
            content: 'cname.vercel-dns.com',
            ttl: 1,
            proxied: false
          }),
        });
        
        const vercelCnameData = await vercelCnameResponse.json();
        console.log("Vercel verification CNAME added:", vercelCnameData);
      }
      
      return new Response(
        JSON.stringify({ 
          success: data.success,
          fullDomain,
          dnsRecord: data.result,
          cloudflareResponse: data
        }),
        { 
          status: data.success ? 200 : 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    else if (action === 'delete') {
      // First, find the record ID
      const checkUrl = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?name=${fullDomain}`;
      
      const checkResponse = await fetch(checkUrl, {
        method: 'GET',
        headers: cloudflareHeaders,
      });

      const checkData = await checkResponse.json();
      
      if (!checkData.success || !checkData.result || checkData.result.length === 0) {
        return new Response(
          JSON.stringify({ error: 'DNS record not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Delete all records for this subdomain
      const deleteResponses = [];
      for (const record of checkData.result) {
        const recordId = record.id;
        const deleteUrl = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${recordId}`;
        
        const deleteResponse = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: cloudflareHeaders,
        });

        const deleteData = await deleteResponse.json();
        deleteResponses.push(deleteData);
      }
      
      // Also delete the Vercel verification CNAME if it exists
      const vercelCheckUrl = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?name=_vercel.${fullDomain}`;
      const vercelCheckResponse = await fetch(vercelCheckUrl, {
        method: 'GET',
        headers: cloudflareHeaders,
      });
      
      const vercelCheckData = await vercelCheckResponse.json();
      
      if (vercelCheckData.success && vercelCheckData.result && vercelCheckData.result.length > 0) {
        const vercelRecordId = vercelCheckData.result[0].id;
        const vercelDeleteUrl = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${vercelRecordId}`;
        
        await fetch(vercelDeleteUrl, {
          method: 'DELETE',
          headers: cloudflareHeaders,
        });
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          deletedRecords: deleteResponses.length,
          responses: deleteResponses
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    else if (action === 'list_records') {
      // List all DNS records for a domain
      const listUrl = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?name=${fullDomain}`;
      
      const response = await fetch(listUrl, {
        method: 'GET',
        headers: cloudflareHeaders,
      });

      const data = await response.json();
      
      return new Response(
        JSON.stringify({ 
          success: data.success,
          records: data.result,
          fullDomain
        }),
        { 
          status: data.success ? 200 : 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    else if (action === 'add_record') {
      // Validate required fields
      if (!records || !Array.isArray(records) || records.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Missing or invalid records data' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      const results = [];
      
      for (const record of records) {
        // Validate record
        if (!record.type || !record.name || !record.content) {
          results.push({
            success: false,
            error: 'Missing required fields in record (type, name, content)'
          });
          continue;
        }
        
        // Prepare the record data
        const recordData: DNSRecord = {
          type: record.type as DNSRecordType,
          name: record.name.includes('.') ? record.name : `${record.name}.${fullDomain}`,
          content: record.content,
          ttl: record.ttl || 1
        };
        
        // Add priority for MX records
        if (record.type === 'MX' && record.priority) {
          recordData.priority = record.priority;
        }
        
        // Set proxied flag (most records can be proxied except NS, MX, etc.)
        if (['A', 'AAAA', 'CNAME'].includes(record.type)) {
          recordData.proxied = record.proxied !== undefined ? record.proxied : true;
        } else {
          recordData.proxied = false; // Other record types cannot be proxied
        }
        
        // Create the record
        const createUrl = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`;
        
        try {
          const response = await fetch(createUrl, {
            method: 'POST',
            headers: cloudflareHeaders,
            body: JSON.stringify(recordData),
          });

          const data = await response.json();
          
          results.push({
            success: data.success,
            record: data.result,
            errors: data.errors
          });
        } catch (error) {
          results.push({
            success: false,
            error: error.message || 'Unknown error'
          });
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: results.every(r => r.success),
          results,
          fullDomain
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    else if (action === 'delete_record') {
      // Delete a specific DNS record
      if (!req.body.record_id) {
        return new Response(
          JSON.stringify({ error: 'Missing record ID' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      const deleteUrl = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${req.body.record_id}`;
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: cloudflareHeaders,
      });

      const data = await response.json();
      
      return new Response(
        JSON.stringify({ 
          success: data.success,
          cloudflareResponse: data
        }),
        { 
          status: data.success ? 200 : 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    else if (action === 'update_record') {
      // Update a specific DNS record
      if (!req.body.record_id || !req.body.record) {
        return new Response(
          JSON.stringify({ error: 'Missing record ID or record data' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      const updateUrl = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${req.body.record_id}`;
      
      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: cloudflareHeaders,
        body: JSON.stringify(req.body.record),
      });

      const data = await response.json();
      
      return new Response(
        JSON.stringify({ 
          success: data.success,
          record: data.result,
          cloudflareResponse: data
        }),
        { 
          status: data.success ? 200 : 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
