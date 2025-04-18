
import { DNSRecord } from "./types.ts";
import { formatResponse, errorResponse, getCloudflareHeaders } from "./helpers.ts";
import { updateDomainSettings } from "./domain-settings.ts";

export async function checkDomain(
  subdomain: string,
  domainSuffix: string,
  zoneId: string,
  apiKey: string
) {
  const fullDomain = subdomain ? `${subdomain}.${domainSuffix}` : domainSuffix;
  const checkUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${fullDomain}`;
  
  const response = await fetch(checkUrl, {
    method: 'GET',
    headers: getCloudflareHeaders(apiKey),
  });

  const data = await response.json();
  
  const isAvailable = !data.result || data.result.length === 0;
  
  return formatResponse({ 
    isAvailable,
    fullDomain,
    cloudflareResponse: data
  });
}

export async function createDomain(
  subdomain: string,
  domainSuffix: string,
  zoneId: string,
  apiKey: string,
  nameservers?: string[],
  records?: DNSRecord[]
) {
  const fullDomain = subdomain ? `${subdomain}.${domainSuffix}` : domainSuffix;
  
  if (nameservers && Array.isArray(nameservers) && nameservers.length > 0) {
    const nsRecords = [];
    
    for (const ns of nameservers) {
      const createNsUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
      
      const nsResponse = await fetch(createNsUrl, {
        method: 'POST',
        headers: getCloudflareHeaders(apiKey),
        body: JSON.stringify({
          type: 'NS',
          name: fullDomain,
          content: ns,
          ttl: 3600,
          proxied: false
        }),
      });

      const nsData = await nsResponse.json();
      nsRecords.push(nsData.result);
      
      console.log(`Created NS record for ${fullDomain} pointing to ${ns}:`, nsData);
    }
    
    return formatResponse({ 
      success: true,
      fullDomain,
      delegated: true,
      nsRecords: nsRecords,
      message: "Nameserver delegation completed"
    });
  }
  
  if (records && Array.isArray(records) && records.length > 0) {
    const createdRecords = [];
    const failedRecords = [];
    
    for (const record of records) {
      const createUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
      
      const response = await fetch(createUrl, {
        method: 'POST',
        headers: getCloudflareHeaders(apiKey),
        body: JSON.stringify({
          type: record.type,
          name: record.name.includes('.') ? record.name : `${record.name}.${domainSuffix}`,
          content: record.content,
          ttl: record.ttl || 1,
          priority: record.priority,
          proxied: record.proxied !== undefined ? record.proxied : (
            ['A', 'AAAA', 'CNAME'].includes(record.type) ? true : false
          )
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        console.error(`Failed to create ${record.type} record:`, data.errors);
        failedRecords.push({
          record,
          errors: data.errors
        });
      } else {
        createdRecords.push(data.result);
      }
    }
    
    const domainSettings = await updateDomainSettings(zoneId, apiKey);
    
    // Check if we have any failures, but still return success if at least some records were created
    const success = createdRecords.length > 0;
    const hasFailures = failedRecords.length > 0;
    
    return formatResponse({ 
      success,
      fullDomain,
      dnsRecords: createdRecords,
      failedRecords: hasFailures ? failedRecords : undefined,
      partialSuccess: success && hasFailures,
      domainSettings
    });
  }
  
  const createUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
  
  const response = await fetch(createUrl, {
    method: 'POST',
    headers: getCloudflareHeaders(apiKey),
    body: JSON.stringify({
      type: 'A',
      name: fullDomain,
      content: '76.76.21.21',
      ttl: 1,
      proxied: true
    }),
  });

  const data = await response.json();
  
  if (data.success) {
    const vercelCnameUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
    
    const vercelCnameResponse = await fetch(vercelCnameUrl, {
      method: 'POST',
      headers: getCloudflareHeaders(apiKey),
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
    
    const domainSettings = await updateDomainSettings(zoneId, apiKey);
  }
  
  return formatResponse({ 
    success: data.success,
    fullDomain,
    dnsRecord: data.result,
    cloudflareResponse: data,
    domainSettings: await updateDomainSettings(zoneId, apiKey)
  }, data.success ? 200 : 400);
}

export async function verifyDomainRecords(
  subdomain: string,
  domainSuffix: string,
  zoneId: string,
  apiKey: string
) {
  const fullDomain = subdomain ? `${subdomain}.${domainSuffix}` : domainSuffix;
  
  try {
    // Check A record
    const aRecordUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A&name=${fullDomain}`;
    const aResponse = await fetch(aRecordUrl, {
      method: 'GET',
      headers: getCloudflareHeaders(apiKey),
    });
    const aData = await aResponse.json();
    
    if (!aData.success || !aData.result || aData.result.length === 0) {
      return formatResponse({ 
        success: false,
        error: "A record not found or not propagated",
        fullDomain,
        recordStatus: {
          aRecord: false,
          vercelCname: false
        }
      });
    }
    
    // Check Vercel CNAME
    const cnameUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=CNAME&name=_vercel.${fullDomain}`;
    const cnameResponse = await fetch(cnameUrl, {
      method: 'GET',
      headers: getCloudflareHeaders(apiKey),
    });
    const cnameData = await cnameResponse.json();
    
    if (!cnameData.success || !cnameData.result || cnameData.result.length === 0) {
      return formatResponse({ 
        success: false,
        error: "Vercel CNAME record not found or not propagated",
        fullDomain,
        recordStatus: {
          aRecord: true,
          vercelCname: false
        },
        existingRecords: {
          a: aData.result[0]
        }
      });
    }
    
    // All checks passed
    return formatResponse({ 
      success: true,
      message: "All DNS records verified",
      fullDomain,
      recordStatus: {
        aRecord: true,
        vercelCname: true
      },
      records: {
        a: aData.result[0],
        cname: cnameData.result[0]
      }
    });
  } catch (error) {
    console.error('Error verifying DNS records:', error);
    return formatResponse({ 
      success: false,
      error: error.message || 'Failed to verify DNS records',
      fullDomain,
      recordStatus: {
        error: true
      }
    });
  }
}

// New function to check Vercel domain verification status
export async function checkVercelVerification(
  subdomain: string,
  domainSuffix: string,
  zoneId: string,
  apiKey: string
) {
  const fullDomain = subdomain ? `${subdomain}.${domainSuffix}` : domainSuffix;
  
  try {
    // This is a simulated verification since we don't have direct access to Vercel's API
    // In a real implementation, you would call Vercel's API to check domain verification status
    
    // First check if our DNS records are propagated
    const verifyResponse = await verifyDomainRecords(subdomain, domainSuffix, zoneId, apiKey);
    const verifyData = await verifyResponse.json();
    
    if (!verifyData.success) {
      return formatResponse({ 
        success: false,
        message: "DNS records not fully propagated yet",
        fullDomain,
        vercelStatus: "pending",
        dnsVerification: verifyData
      });
    }
    
    // Simulate a domain verification check
    // For a real implementation, you would use Vercel's API
    // For now, we'll consider it verified if DNS is propagated
    
    return formatResponse({ 
      success: true,
      message: "Domain appears to be verified with Vercel",
      fullDomain,
      vercelStatus: "active",
      dnsVerification: verifyData
    });
    
  } catch (error) {
    console.error('Error checking Vercel verification:', error);
    return formatResponse({ 
      success: false,
      error: error.message || 'Failed to check Vercel verification',
      fullDomain,
      vercelStatus: "error"
    });
  }
}
