
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

  console.log("Edge function called with env variables present:", {
    hasApiKey: !!CLOUDFLARE_API_KEY,
    hasZoneId: !!CLOUDFLARE_ZONE_ID
  });

  if (!CLOUDFLARE_API_KEY || !CLOUDFLARE_ZONE_ID) {
    console.error("Missing Cloudflare credentials");
    return errorResponse('Missing Cloudflare credentials. Check edge function secrets.', 500);
  }

  try {
    const requestBody: DomainRequest = await req.json();
    const { 
      action, 
      subdomain = "", 
      domain = "com.channel", 
      nameservers, 
      records,
      record_id,
      record
    } = requestBody;
    
    console.log(`Processing domain-dns action: ${action}`, {
      subdomain,
      domain,
      hasRecords: records ? records.length : 0,
      hasNameservers: nameservers ? nameservers.length : 0
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
        return await createDomain(
          subdomain, 
          domain, 
          CLOUDFLARE_ZONE_ID, 
          CLOUDFLARE_API_KEY, 
          nameservers, 
          records
        );
        
      case 'delete':
        return await deleteDomain(subdomain, domain, CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_KEY);
        
      case 'list_records':
        return await listRecords(subdomain, domain, CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_KEY);
        
      case 'add_record':
        if (!records || !Array.isArray(records) || records.length === 0) {
          return errorResponse('Missing or invalid records data');
        }
        return await addRecord(
          records, 
          subdomain, 
          domain, 
          CLOUDFLARE_ZONE_ID, 
          CLOUDFLARE_API_KEY
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
