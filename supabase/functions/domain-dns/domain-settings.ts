
import { getCloudflareHeaders } from "./helpers.ts";

export async function updateDomainSettings(zoneId: string, apiKey: string) {
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
