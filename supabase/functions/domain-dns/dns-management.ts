
import { DNSRecord } from "./types.ts";
import { formatResponse, errorResponse, getCloudflareHeaders } from "./helpers.ts";
import { updateDomainSettings } from "./domain-settings.ts";

export async function listRecords(
  subdomain: string,
  domainSuffix: string,
  zoneId: string,
  apiKey: string
) {
  const fullDomain = subdomain ? `${subdomain}.${domainSuffix}` : domainSuffix;
  
  try {
    // First, check if the subdomain exists by querying for its A or CNAME record
    const checkUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${fullDomain}&type=A,CNAME`;
    
    const checkResponse = await fetch(checkUrl, {
      method: 'GET',
      headers: getCloudflareHeaders(apiKey),
    });

    const checkData = await checkResponse.json();
    
    if (!checkData.success) {
      return errorResponse('Failed to check domain existence');
    }
    
    if (!checkData.result || checkData.result.length === 0) {
      return formatResponse({ 
        success: true,
        records: [],
        fullDomain,
        message: "Domain does not exist or has no A/CNAME records"
      });
    }
    
    // Domain exists, now get all its records
    // We need to query using a wildcard to get all records for this domain and its subdomains
    const listUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?per_page=100`;
    
    const response = await fetch(listUrl, {
      method: 'GET',
      headers: getCloudflareHeaders(apiKey),
    });

    const data = await response.json();
    
    if (!data.success) {
      return errorResponse('Failed to fetch DNS records');
    }
    
    // Filter to only include records for this domain and its subdomains
    const filteredRecords = data.result.filter((record: any) => {
      // Match exact domain or subdomains
      return record.name === fullDomain || 
             record.name.endsWith(`.${fullDomain}`) ||
             (fullDomain === domainSuffix && !record.name.includes('.'));
    });
    
    console.log(`Found ${filteredRecords.length} DNS records for ${fullDomain}`);
    
    return formatResponse({ 
      success: true,
      records: filteredRecords,
      fullDomain
    });
  } catch (error) {
    console.error('Error listing DNS records:', error);
    return errorResponse(error.message || 'Failed to list DNS records');
  }
}

export async function deleteDomain(
  subdomain: string,
  domainSuffix: string,
  zoneId: string,
  apiKey: string
) {
  const fullDomain = subdomain ? `${subdomain}.${domainSuffix}` : domainSuffix;
  
  const checkUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${fullDomain}`;
  
  const checkResponse = await fetch(checkUrl, {
    method: 'GET',
    headers: getCloudflareHeaders(apiKey),
  });

  const checkData = await checkResponse.json();
  
  if (!checkData.success || !checkData.result || checkData.result.length === 0) {
    return errorResponse('DNS record not found', 404);
  }

  const deleteResponses = [];
  for (const record of checkData.result) {
    const recordId = record.id;
    const deleteUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`;
    
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: getCloudflareHeaders(apiKey),
    });

    const deleteData = await deleteResponse.json();
    deleteResponses.push(deleteData);
  }
  
  const vercelCheckUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=_vercel.${fullDomain}`;
  const vercelCheckResponse = await fetch(vercelCheckUrl, {
    method: 'GET',
    headers: getCloudflareHeaders(apiKey),
  });
  
  const vercelCheckData = await vercelCheckResponse.json();
  
  if (vercelCheckData.success && vercelCheckData.result && vercelCheckData.result.length > 0) {
    const vercelRecordId = vercelCheckData.result[0].id;
    const vercelDeleteUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${vercelRecordId}`;
    
    await fetch(vercelDeleteUrl, {
      method: 'DELETE',
      headers: getCloudflareHeaders(apiKey),
    });
  }
  
  return formatResponse({ 
    success: true,
    deletedRecords: deleteResponses.length,
    responses: deleteResponses
  });
}

export async function addRecord(
  records: DNSRecord[],
  subdomain: string, 
  domainSuffix: string,
  zoneId: string,
  apiKey: string
) {
  const fullDomain = subdomain ? `${subdomain}.${domainSuffix}` : domainSuffix;
  const results = [];
  
  // First check if there are any conflicting records
  for (const record of records) {
    if (!record.type || (!record.name && record.name !== '@') || !record.content) {
      results.push({
        success: false,
        error: 'Missing required fields in record (type, name, content)'
      });
      continue;
    }
    
    // Prepare the name for checking conflicts
    let recordName = record.name;
    if (record.name === '@') {
      recordName = fullDomain;
    } else if (!record.name.includes('.')) {
      recordName = `${record.name}.${fullDomain}`;
    }
    
    // Check for existing conflicting records
    if (['A', 'AAAA', 'CNAME'].includes(record.type)) {
      const checkUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${recordName}&type=${record.type}`;
      const checkResponse = await fetch(checkUrl, {
        method: 'GET',
        headers: getCloudflareHeaders(apiKey),
      });
      
      const checkData = await checkResponse.json();
      
      if (checkData.success && checkData.result && checkData.result.length > 0) {
        results.push({
          success: false,
          error: `A ${record.type} record with name ${recordName} already exists`,
          existingRecord: checkData.result[0]
        });
        continue;
      }
    }
    
    const recordData: DNSRecord = {
      type: record.type,
      content: record.content,
      ttl: record.ttl || 1
    };
    
    // Fix name formatting based on input
    if (record.name === '@' || record.name === fullDomain) {
      // Root domain
      recordData.name = fullDomain;
    } else if (record.name.includes('.')) {
      // Already a fully qualified domain name
      recordData.name = record.name;
    } else {
      // Subdomain
      recordData.name = `${record.name}.${fullDomain}`;
    }
    
    if (record.type === 'MX' && record.priority !== undefined) {
      recordData.priority = record.priority;
    }
    
    if (['A', 'AAAA', 'CNAME'].includes(record.type)) {
      recordData.proxied = record.proxied !== undefined ? record.proxied : true;
    } else {
      recordData.proxied = false;
    }
    
    console.log("Creating DNS record:", recordData);
    
    const createUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
    
    try {
      const response = await fetch(createUrl, {
        method: 'POST',
        headers: getCloudflareHeaders(apiKey),
        body: JSON.stringify(recordData),
      });

      const data = await response.json();
      
      // Log errors for debugging
      if (!data.success) {
        console.error("DNS record creation failed:", data.errors);
      } else {
        console.log("DNS record created successfully:", data.result);
      }
      
      results.push({
        success: data.success,
        record: data.result,
        errors: data.errors
      });
    } catch (error) {
      console.error("Error creating DNS record:", error);
      results.push({
        success: false,
        error: error.message || 'Unknown error'
      });
    }
  }
  
  return formatResponse({ 
    success: results.some(r => r.success),
    results,
    fullDomain
  });
}

export async function deleteRecord(
  recordId: string,
  zoneId: string,
  apiKey: string
) {
  const deleteUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`;
  
  const response = await fetch(deleteUrl, {
    method: 'DELETE',
    headers: getCloudflareHeaders(apiKey),
  });

  const data = await response.json();
  
  return formatResponse({ 
    success: data.success,
    cloudflareResponse: data
  }, data.success ? 200 : 400);
}

export async function updateRecord(
  recordId: string,
  record: DNSRecord,
  zoneId: string,
  apiKey: string
) {
  const updateUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`;
  
  const response = await fetch(updateUrl, {
    method: 'PUT',
    headers: getCloudflareHeaders(apiKey),
    body: JSON.stringify(record),
  });

  const data = await response.json();
  
  return formatResponse({ 
    success: data.success,
    record: data.result,
    cloudflareResponse: data
  }, data.success ? 200 : 400);
}
