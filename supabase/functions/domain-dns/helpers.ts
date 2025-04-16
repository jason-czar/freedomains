
import { DNSRecord, DNSRecordType } from "./types.ts";

// Define CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
export const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
};

// Get Cloudflare API headers
export const getCloudflareHeaders = (apiKey: string) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };
};

// Format response with CORS headers
export const formatResponse = (data: any, status = 200) => {
  return new Response(
    JSON.stringify(data),
    { 
      status: status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
};

// Error response
export const errorResponse = (message: string, status = 400) => {
  return formatResponse({ error: message }, status);
};
