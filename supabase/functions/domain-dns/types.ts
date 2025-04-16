
// DNS Record Types
export type DNSRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA';

// Interface for DNS record
export interface DNSRecord {
  type: DNSRecordType;
  name: string;
  content: string;
  ttl?: number;
  priority?: number;
  proxied?: boolean;
}

// Interface for request body
export interface DomainRequest {
  action: string;
  subdomain?: string;
  domain?: string;
  nameservers?: string[];
  records?: DNSRecord[];
  record_id?: string;
  record?: DNSRecord;
}
