import { DNSRecord } from "./types.ts";
import { formatResponse, errorResponse, getCloudflareHeaders } from "./helpers.ts";

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
        return formatResponse({ 
          success: false,
          errors: data.errors,
          cloudflareResponse: data
        }, 400);
      }
      
      createdRecords.push(data.result);
    }
    
    const domainSettings = await updateDomainSettings(zoneId, apiKey);
    
    return formatResponse({ 
      success: true,
      fullDomain,
      dnsRecords: createdRecords,
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
    domainSettings
  }, data.success ? 200 : 400);
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

  const checkData = await response.json();
  
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

export async function listRecords(
  subdomain: string,
  domainSuffix: string,
  zoneId: string,
  apiKey: string
) {
  const fullDomain = subdomain ? `${subdomain}.${domainSuffix}` : domainSuffix;
  const listUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${fullDomain}`;
  
  const response = await fetch(listUrl, {
    method: 'GET',
    headers: getCloudflareHeaders(apiKey),
  });

  const data = await response.json();
  
  return formatResponse({ 
    success: data.success,
    records: data.result,
    fullDomain
  }, data.success ? 200 : 400);
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
  
  for (const record of records) {
    if (!record.type || !record.name || !record.content) {
      results.push({
        success: false,
        error: 'Missing required fields in record (type, name, content)'
      });
      continue;
    }
    
    const recordData: DNSRecord = {
      type: record.type,
      name: record.name.includes('.') ? record.name : `${record.name}.${fullDomain}`,
      content: record.content,
      ttl: record.ttl || 1
    };
    
    if (record.type === 'MX' && record.priority) {
      recordData.priority = record.priority;
    }
    
    if (['A', 'AAAA', 'CNAME'].includes(record.type)) {
      recordData.proxied = record.proxied !== undefined ? record.proxied : true;
    } else {
      recordData.proxied = false;
    }
    
    const createUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
    
    try {
      const response = await fetch(createUrl, {
        method: 'POST',
        headers: getCloudflareHeaders(apiKey),
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
  
  return formatResponse({ 
    success: results.every(r => r.success),
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

async function updateDomainSettings(zoneId: string, apiKey: string) {
  const sslUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/ssl`;
  const sslResponse = await fetch(sslUrl, {
    method: 'PATCH',
    headers: getCloudflareHeaders(apiKey),
    body: JSON.stringify({
      value: 'full'
    }),
  });
  const sslData = await sslResponse.json();
  console.log("SSL settings updated:", sslData);

  const httpsUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/always_use_https`;
  const httpsResponse = await fetch(httpsUrl, {
    method: 'PATCH',
    headers: getCloudflareHeaders(apiKey),
    body: JSON.stringify({
      value: 'on'
    }),
  });
  const httpsData = await httpsResponse.json();
  console.log("HTTPS settings updated:", httpsData);

  const browserIntegrityUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/browser_check`;
  const browserIntegrityResponse = await fetch(browserIntegrityUrl, {
    method: 'PATCH',
    headers: getCloudflareHeaders(apiKey),
    body: JSON.stringify({
      value: 'on'
    }),
  });
  const browserIntegrityData = await browserIntegrityResponse.json();
  console.log("Browser Integrity Check updated:", browserIntegrityData);

  const minifyUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/auto_minify`;
  const minifyResponse = await fetch(minifyUrl, {
    method: 'PATCH',
    headers: getCloudflareHeaders(apiKey),
    body: JSON.stringify({
      value: {
        html: true,
        css: true,
        js: true
      }
    }),
  });
  const minifyData = await minifyResponse.json();
  console.log("Auto Minify settings updated:", minifyData);

  const brotliUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/brotli`;
  const brotliResponse = await fetch(brotliUrl, {
    method: 'PATCH',
    headers: getCloudflareHeaders(apiKey),
    body: JSON.stringify({
      value: 'on'
    }),
  });
  const brotliData = await brotliResponse.json();
  console.log("Brotli compression enabled:", brotliData);

  const http3Url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/http3`;
  const http3Response = await fetch(http3Url, {
    method: 'PATCH',
    headers: getCloudflareHeaders(apiKey),
    body: JSON.stringify({
      value: 'on'
    }),
  });
  const http3Data = await http3Response.json();
  console.log("HTTP/3 enabled:", http3Data);

  const tlsUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/min_tls_version`;
  const tlsResponse = await fetch(tlsUrl, {
    method: 'PATCH',
    headers: getCloudflareHeaders(apiKey),
    body: JSON.stringify({
      value: '1.2'
    }),
  });
  const tlsData = await tlsResponse.json();
  console.log("Minimum TLS version set:", tlsData);

  const cacheTtlUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/browser_cache_ttl`;
  const cacheTtlResponse = await fetch(cacheTtlUrl, {
    method: 'PATCH',
    headers: getCloudflareHeaders(apiKey),
    body: JSON.stringify({
      value: 14400
    }),
  });
  const cacheTtlData = await cacheTtlResponse.json();
  console.log("Browser cache TTL updated:", cacheTtlData);

  const emailObfuscationUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/email_obfuscation`;
  const emailObfuscationResponse = await fetch(emailObfuscationUrl, {
    method: 'PATCH',
    headers: getCloudflareHeaders(apiKey),
    body: JSON.stringify({
      value: 'on'
    }),
  });
  const emailObfuscationData = await emailObfuscationResponse.json();
  console.log("Email obfuscation enabled:", emailObfuscationData);

  return {
    ssl: sslData,
    https: httpsData,
    browserIntegrity: browserIntegrityData,
    minify: minifyData,
    brotli: brotliData,
    http3: http3Data,
    tls: tlsData,
    cacheTtl: cacheTtlData,
    emailObfuscation: emailObfuscationData
  };
}
