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
  console.log(`Checking domain availability for: ${fullDomain}`);
  
  try {
    // Check if A record exists
    const checkAUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A&name=${fullDomain}`;
    const responseA = await fetch(checkAUrl, {
      method: 'GET',
      headers: getCloudflareHeaders(apiKey),
    });
    const dataA = await responseA.json();
    
    // Check if CNAME record exists
    const checkCnameUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=CNAME&name=${fullDomain}`;
    const responseCname = await fetch(checkCnameUrl, {
      method: 'GET',
      headers: getCloudflareHeaders(apiKey),
    });
    const dataCname = await responseCname.json();
    
    // Check if _vercel CNAME record exists
    const checkVercelUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=CNAME&name=_vercel.${fullDomain}`;
    const responseVercel = await fetch(checkVercelUrl, {
      method: 'GET',
      headers: getCloudflareHeaders(apiKey),
    });
    const dataVercel = await responseVercel.json();
    
    // Domain is available if none of these records exist
    const hasARecord = dataA.success && dataA.result && dataA.result.length > 0;
    const hasCnameRecord = dataCname.success && dataCname.result && dataCname.result.length > 0;
    const hasVercelRecord = dataVercel.success && dataVercel.result && dataVercel.result.length > 0;
    
    const isAvailable = !hasARecord && !hasCnameRecord && !hasVercelRecord;
    console.log(`Domain ${fullDomain} availability check: ${isAvailable ? 'Available' : 'Not Available'}`);
    console.log(`- Has A record: ${hasARecord}`);
    console.log(`- Has CNAME record: ${hasCnameRecord}`);
    console.log(`- Has Vercel CNAME record: ${hasVercelRecord}`);
    
    return formatResponse({ 
      isAvailable,
      fullDomain,
      existingRecords: {
        a: hasARecord ? dataA.result : null,
        cname: hasCnameRecord ? dataCname.result : null,
        vercel: hasVercelRecord ? dataVercel.result : null
      }
    });
  } catch (error) {
    console.error(`Error checking domain availability for ${fullDomain}:`, error);
    return errorResponse(`Error checking domain availability: ${error.message}`, 500);
  }
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
  console.log(`Creating domain: ${fullDomain} in Cloudflare zone ${zoneId}`);
  console.log(`Using ${records ? records.length : 0} specific records, ${nameservers ? nameservers.length : 0} nameservers`);
  
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
    console.log(`Creating ${records.length} DNS records for ${fullDomain}`);
    const createdRecords = [];
    const failedRecords = [];
    
    // Check if we're using fully qualified names in the records
    const useFullyQualifiedNames = records.some(r => 
      r.name && r.name.includes('.') && r.name.endsWith(domainSuffix)
    );
    
    console.log(`Records appear to use fully qualified names: ${useFullyQualifiedNames}`);
    
    for (const record of records) {
      // If using fully qualified names, use the record name as-is
      // Otherwise format it according to our standard rules
      let recordName;
      if (useFullyQualifiedNames) {
        recordName = record.name;
      } else {
        recordName = record.name.includes('.') ? record.name : `${record.name}.${domainSuffix}`;
      }
      
      console.log(`Creating ${record.type} record: ${recordName} -> ${record.content}`);
      
      const createUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
      
      try {
        // Configure proxied value based on record type and user settings
        let isProxied = false;
        if (record.proxied !== undefined) {
          isProxied = record.proxied;
        } else if (['A', 'AAAA'].includes(record.type)) {
          isProxied = true;
        } else if (record.type === 'CNAME') {
          // Don't proxy CNAME records for Vercel or other verification purposes
          isProxied = !(
            recordName.startsWith('_vercel.') || 
            recordName === 'www.' + fullDomain ||
            record.content.includes('vercel') ||
            record.content.includes('_domainkey') || 
            record.content.includes('_acme-challenge')
          );
        }
        
        const requestBody = {
          type: record.type,
          name: recordName,
          content: record.content,
          ttl: record.ttl || 1,
          priority: record.priority,
          proxied: isProxied
        };
        
        console.log(`Sending request to Cloudflare for ${record.type} record:`, JSON.stringify(requestBody));
        
        const response = await fetch(createUrl, {
          method: 'POST',
          headers: getCloudflareHeaders(apiKey),
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log(`Cloudflare response for ${record.type} record:`, JSON.stringify(data));
        
        if (!data.success) {
          console.error(`Failed to create ${record.type} record for ${recordName}:`, data.errors);
          failedRecords.push({
            record,
            errors: data.errors
          });
        } else {
          console.log(`Successfully created ${record.type} record for ${recordName}`);
          createdRecords.push(data.result);
        }
      } catch (error) {
        console.error(`Exception creating ${record.type} record for ${recordName}:`, error);
        failedRecords.push({
          record,
          errors: [{ message: error.message || "Network error" }]
        });
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
      domainSettings,
      message: success 
        ? (hasFailures ? `Created ${createdRecords.length} records, ${failedRecords.length} failed` : "All records created successfully") 
        : "Failed to create any DNS records"
    });
  }
  
  console.log(`Creating default A record for ${fullDomain} -> 76.76.21.21`);
  const createUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
  
  try {
    // Default behavior: Create A record (proxied) and Vercel CNAME (not proxied)
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
    
    if (!data.success) {
      console.error(`Failed to create A record for ${fullDomain}:`, data.errors);
      return formatResponse({ 
        success: false,
        fullDomain,
        error: data.errors,
        message: "Failed to create A record in Cloudflare"
      }, 400);
    }
    
    console.log(`A record created successfully for ${fullDomain}, adding Vercel CNAME`);
    
    // Create Vercel verification CNAME
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
    
    // Create www CNAME if it's a subdomain
    let wwwCnameData = null;
    if (subdomain) {
      console.log(`Creating www CNAME for ${fullDomain}`);
      const wwwCnameUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
      
      const wwwCnameResponse = await fetch(wwwCnameUrl, {
        method: 'POST',
        headers: getCloudflareHeaders(apiKey),
        body: JSON.stringify({
          type: 'CNAME',
          name: `www.${fullDomain}`,
          content: 'cname.vercel-dns.com',
          ttl: 1,
          proxied: false
        }),
      });
      
      wwwCnameData = await wwwCnameResponse.json();
      
      if (!wwwCnameData.success) {
        console.error(`Failed to create www CNAME for ${fullDomain}:`, wwwCnameData.errors);
      }
    }
    
    if (!vercelCnameData.success) {
      console.error(`Failed to create Vercel CNAME for ${fullDomain}:`, vercelCnameData.errors);
      return formatResponse({ 
        success: true, // Still return success since A record was created
        fullDomain,
        dnsRecord: data.result,
        warning: "Vercel verification CNAME could not be created",
        vercelError: vercelCnameData.errors,
        domainSettings: await updateDomainSettings(zoneId, apiKey)
      });
    }
    
    console.log(`Vercel CNAME created successfully for _vercel.${fullDomain}`);
    const domainSettings = await updateDomainSettings(zoneId, apiKey);
    
    return formatResponse({ 
      success: true,
      fullDomain,
      dnsRecord: data.result,
      vercelCname: vercelCnameData.result,
      wwwCname: wwwCnameData?.result || null,
      message: "DNS records created successfully",
      domainSettings
    });
    
  } catch (error) {
    console.error(`Exception creating DNS records for ${fullDomain}:`, error);
    return formatResponse({ 
      success: false,
      fullDomain,
      error: error.message || "Network error",
      message: "Exception occurred calling Cloudflare API"
    }, 500);
  }
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
    
    // Also check if we have a CNAME for the main domain instead of an A record
    const cnameMainUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=CNAME&name=${fullDomain}`;
    const cnameMainResponse = await fetch(cnameMainUrl, {
      method: 'GET',
      headers: getCloudflareHeaders(apiKey),
    });
    const cnameMainData = await cnameMainResponse.json();
    
    // Check if either an A record or a CNAME exists for the main domain
    const hasMainRecord = (aData.success && aData.result && aData.result.length > 0) || 
                          (cnameMainData.success && cnameMainData.result && cnameMainData.result.length > 0);
    
    if (!hasMainRecord) {
      return formatResponse({ 
        success: false,
        error: "No A record or CNAME found for main domain",
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
          a: aData.result && aData.result.length > 0 ? aData.result[0] : null,
          cname: cnameMainData.result && cnameMainData.result.length > 0 ? cnameMainData.result[0] : null
        }
      });
    }
    
    // Check for Vercel TXT verification records
    const txtUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=TXT&name=_vercel.${fullDomain}`;
    const txtResponse = await fetch(txtUrl, {
      method: 'GET',
      headers: getCloudflareHeaders(apiKey),
    });
    const txtData = await txtResponse.json();
    
    // All checks passed
    return formatResponse({ 
      success: true,
      message: "All DNS records verified",
      fullDomain,
      recordStatus: {
        aRecord: true,
        vercelCname: true,
        vercelTxt: txtData.success && txtData.result && txtData.result.length > 0
      },
      records: {
        a: aData.result && aData.result.length > 0 ? aData.result[0] : null,
        cname: cnameData.result[0],
        mainCname: cnameMainData.result && cnameMainData.result.length > 0 ? cnameMainData.result[0] : null,
        txt: txtData.success && txtData.result ? txtData.result : []
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

export async function checkVercelVerification(
  subdomain: string,
  domainSuffix: string,
  zoneId: string,
  apiKey: string
) {
  const fullDomain = subdomain ? `${subdomain}.${domainSuffix}` : domainSuffix;
  const VERCEL_ACCESS_TOKEN = Deno.env.get('VERCEL_ACCESS_TOKEN');
  
  try {
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
    
    // If we have a Vercel access token, use it to check verification status with Vercel API
    if (VERCEL_ACCESS_TOKEN) {
      try {
        // First try to find the domain in Vercel
        const vercelDomainsResponse = await fetch('https://api.vercel.com/v9/projects/getmychannel/domains', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${VERCEL_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        const vercelDomains = await vercelDomainsResponse.json();
        console.log(`Vercel domains response for ${fullDomain}:`, vercelDomains);
        
        if (vercelDomains.domains && Array.isArray(vercelDomains.domains)) {
          // Find the domain in the list
          const domain = vercelDomains.domains.find((d: any) => 
            d.name === fullDomain || d.name === `www.${fullDomain}`
          );
          
          if (domain) {
            return formatResponse({ 
              success: true,
              message: `Domain found in Vercel with status: ${domain.verification.length > 0 ? domain.verification[0].status : 'unknown'}`,
              fullDomain,
              vercelStatus: domain.verification.length > 0 && domain.verification[0].status === 'verified' ? 'active' : 'pending',
              vercelData: domain,
              dnsVerification: verifyData
            });
          }
        }
        
        // If domain not found in Vercel, we need to add it
        return formatResponse({ 
          success: false,
          message: "Domain not found in Vercel. It may need to be added to your Vercel project first.",
          fullDomain,
          vercelStatus: "not_found",
          dnsVerification: verifyData
        });
        
      } catch (vercelError) {
        console.error('Error checking Vercel API:', vercelError);
        // Fall back to simulated verification
      }
    }
    
    // Simulate a domain verification check if we can't use the Vercel API
    // For a real implementation, you would use Vercel's API
    
    return formatResponse({ 
      success: true,
      message: "Domain appears to be verified with Vercel (based on DNS records only)",
      fullDomain,
      vercelStatus: "active",
      dnsVerification: verifyData,
      note: "This is an estimate. For accurate status, check your Vercel dashboard."
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
