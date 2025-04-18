export interface DomainSettings {
  domain_suffix?: string;
  nameservers?: string[];
  forwarding?: {
    url?: string;
    type?: string;
  };
  delegated?: boolean;
  dns_active?: boolean;
  dns_records?: any[];
  email_enabled?: boolean;
  free_first_year?: boolean;
  renewal_price?: number;
  vercel_cname_added?: boolean;
}

export interface Domain {
  id: string;
  subdomain: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  settings: DomainSettings;
}

export interface DNSManagerProps {
  domainId: string;
  subdomain: string;
  domainSuffix: string;
  onRefresh?: () => void;
}

export interface DNSRecord {
  type: string;
  name: string;
  content: string;
  ttl?: number;
  priority?: number;
  proxied?: boolean;
  id?: string;
}

export interface ValidationError {
  message: string;
  field?: string;
  code?: string;
}

export interface DNSValidationResult {
  isValid: boolean;
  error: ValidationError | null;
}
