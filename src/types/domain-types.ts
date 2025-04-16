
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
