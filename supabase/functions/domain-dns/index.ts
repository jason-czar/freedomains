
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
    const { action, subdomain } = await req.json();

    if (!action || !subdomain) {
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

    if (action === 'check') {
      // Check if a DNS record already exists for this subdomain
      const checkUrl = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?name=${subdomain}.com.channel`;
      
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
          cloudflareResponse: data
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } 
    else if (action === 'create') {
      // Create a new DNS record for the subdomain
      const createUrl = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`;
      
      const response = await fetch(createUrl, {
        method: 'POST',
        headers: cloudflareHeaders,
        body: JSON.stringify({
          type: 'A',
          name: `${subdomain}.com.channel`,
          content: '76.76.21.21', // Vercel's Edge Network IP
          ttl: 1, // Auto TTL
          proxied: true // Use Cloudflare proxy
        }),
      });

      const data = await response.json();
      
      return new Response(
        JSON.stringify({ 
          success: data.success,
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
      const checkUrl = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?name=${subdomain}.com.channel`;
      
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

      // Delete the record
      const recordId = checkData.result[0].id;
      const deleteUrl = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${recordId}`;
      
      const deleteResponse = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: cloudflareHeaders,
      });

      const deleteData = await deleteResponse.json();
      
      return new Response(
        JSON.stringify({ 
          success: deleteData.success,
          cloudflareResponse: deleteData
        }),
        { 
          status: deleteData.success ? 200 : 400, 
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
