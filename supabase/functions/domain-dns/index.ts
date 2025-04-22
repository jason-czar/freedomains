
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, errorResponse } from "./helpers.ts";
import { DomainRequest } from "./types.ts";
import { 
  checkDomain, 
  createDomain, 
  deleteDomain, 
  listRecords, 
  addRecord, 
  deleteRecord, 
  updateRecord,
  verifyDomainRecords,
  checkVercelVerification
} from "./actions.ts";

// Main server function
serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Get environment variables
  const CLOUDFLARE_API_KEY = Deno.env.get('CLOUDFLARE_API_KEY');
  const CLOUDFLARE_ZONE_ID = Deno.env.get('CLOUDFLARE_ZONE_ID');
  const VERCEL_ACCESS_TOKEN = Deno.env.get('VERCEL_ACCESS_TOKEN');

  console.log("Edge function called with env variables present:", {
    hasApiKey: !!CLOUDFLARE_API_KEY,
    hasZoneId: !!CLOUDFLARE_ZONE_ID,
    hasVercelToken: !!VERCEL_ACCESS_TOKEN,
    apiKeyLength: CLOUDFLARE_API_KEY ? CLOUDFLARE_API_KEY.length : 0,
    zoneIdLength: CLOUDFLARE_ZONE_ID ? CLOUDFLARE_ZONE_ID.length : 0,
    timestamp: new Date().toISOString()
  });

  if (!CLOUDFLARE_API_KEY || !CLOUDFLARE_ZONE_ID) {
    console.error("Missing Cloudflare credentials");
    return errorResponse('Missing Cloudflare credentials. Check edge function secrets.', 500);
  }

  try {
    let requestBody;
    
    try {
      requestBody = await req.json();
      console.log("Request body received:", JSON.stringify(requestBody));
    } catch (jsonError) {
      console.error("Error parsing request body:", jsonError);
      return errorResponse('Invalid JSON in request body', 400);
    }
    
    const { 
      action, 
      subdomain = "", 
      domain = "com.channel", 
      nameservers, 
      records,
      record_id,
      record,
      useFullyQualifiedNames = false
    } = requestBody as DomainRequest;
    
    console.log(`Processing domain-dns action: ${action}`, {
      subdomain,
      domain,
      hasRecords: records ? records.length : 0,
      hasNameservers: nameservers ? nameservers.length : 0,
      hasVercelToken: !!VERCEL_ACCESS_TOKEN,
      useFullyQualifiedNames
    });
    
    if (!action) {
      return errorResponse('Missing required action parameter');
    }

    // Process based on action type
    switch (action) {
      case 'check':
        console.log(`Checking domain availability: ${subdomain}.${domain}`);
        return await checkDomain(subdomain, domain, CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_KEY);
        
      case 'create':
        console.log(`Creating domain: ${subdomain}.${domain}`);
        if (records && Array.isArray(records)) {
          console.log(`Creating with specific records:`, JSON.stringify(records));
        }
        const createResponse = await createDomain(
          subdomain, 
          domain, 
          CLOUDFLARE_ZONE_ID, 
          CLOUDFLARE_API_KEY, 
          nameservers, 
          records
        );
        console.log(`Create domain response:`, createResponse.status);
        return createResponse;
        
      case 'delete':
        return await deleteDomain(subdomain, domain, CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_KEY);
        
      case 'list_records':
        return await listRecords(subdomain, domain, CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_KEY);
        
      case 'add_record':
        if (!records || !Array.isArray(records) || records.length === 0) {
          return errorResponse('Missing or invalid records data');
        }
        console.log(`Adding records:`, JSON.stringify(records));
        return await addRecord(
          records, 
          subdomain, 
          domain, 
          CLOUDFLARE_ZONE_ID, 
          CLOUDFLARE_API_KEY,
          useFullyQualifiedNames
        );
        
      case 'delete_record':
        if (!record_id) {
          return errorResponse('Missing record ID');
        }
        return await deleteRecord(record_id, CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_KEY);
        
      case 'update_record':
        if (!record_id || !record) {
          return errorResponse('Missing record ID or record data');
        }
        return await updateRecord(record_id, record, CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_KEY);
        
      case 'verify':
        return await verifyDomainRecords(subdomain, domain, CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_KEY);
      
      case 'check_vercel':
        return await checkVercelVerification(subdomain, domain, CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_KEY);
        
      default:
        return errorResponse(`Invalid action: ${action}`);
    }

  } catch (error) {
    console.error('Error processing domain-dns request:', error);
    return errorResponse(`Error processing request: ${error.message}`, 500);
  }
});
