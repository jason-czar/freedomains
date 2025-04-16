
export interface DomainSettings {
  domain_suffix?: string;
  nameservers?: string[];
  forwarding?: {
    url?: string;
    type?: string;
  };
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
