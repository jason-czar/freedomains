
import { DNSRecord } from "@/types/domain-types";

export const isValidIPv4 = (ip: string): boolean => {
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  if (!ipv4Regex.test(ip)) return false;
  
  const parts = ip.split('.');
  return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255);
};

export const isValidIPv6 = (ip: string): boolean => {
  // Basic IPv6 validation
  return /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^::1$|^([0-9a-fA-F]{1,4}::?){1,7}[0-9a-fA-F]{1,4}$/.test(ip);
};

export const validateDNSRecord = (
  newRecord: DNSRecord, 
  existingRecords: DNSRecord[] = [], 
  fullDomain: string
): { isValid: boolean; error: string | null } => {
  // Check for duplicate records
  if (['A', 'AAAA', 'CNAME'].includes(newRecord.type)) {
    const nameToCheck = newRecord.name === "" || newRecord.name === "@" 
                        ? fullDomain 
                        : `${newRecord.name}.${fullDomain}`;
    
    const duplicateRecord = existingRecords.find(record => 
      (record.type === newRecord.type) && 
      (record.name === nameToCheck || 
        (record.name === fullDomain && (newRecord.name === "" || newRecord.name === "@")))
    );
    
    if (duplicateRecord) {
      return {
        isValid: false,
        error: `A ${newRecord.type} record with this name already exists. Please delete it first or use a different name.`
      };
    }
  }
  
  // CNAME validation
  if (newRecord.type === "CNAME") {
    // Cannot create CNAME record for root domain if A/AAAA record exists
    if (newRecord.name === "" || newRecord.name === "@") {
      if (existingRecords.some(r => (r.type === "A" || r.type === "AAAA") && 
          (r.name === fullDomain || r.name === "@"))) {
        return {
          isValid: false,
          error: "Cannot create a CNAME record for the root domain when A or AAAA records exist."
        };
      }
    }
    
    // Prevent CNAME loops
    if (newRecord.content === fullDomain ||
        newRecord.content === `${newRecord.name}.${fullDomain}`) {
      return {
        isValid: false,
        error: "CNAME cannot point to itself."
      };
    }
  }
  
  // Validate specific record types
  if (newRecord.type === "AAAA" && !isValidIPv6(newRecord.content)) {
    return {
      isValid: false,
      error: "Please enter a valid IPv6 address."
    };
  }
  
  if (newRecord.type === "A" && !isValidIPv4(newRecord.content)) {
    return {
      isValid: false,
      error: "Please enter a valid IPv4 address."
    };
  }
  
  // MX record validation
  if (newRecord.type === "MX" && !newRecord.priority) {
    return {
      isValid: false,
      error: "MX records require a priority value."
    };
  }
  
  return { isValid: true, error: null };
};

export const getContentPlaceholder = (recordType: string): string => {
  switch (recordType) {
    case "A":
      return "192.0.2.1";
    case "AAAA":
      return "2001:db8::";
    case "CNAME":
      return "example.com";
    case "MX":
      return "mail.example.com";
    case "TXT":
      return "v=spf1 include:_spf.example.com ~all";
    case "NS":
      return "ns1.example.com";
    default:
      return "";
  }
};

export const getContentLabel = (recordType: string): string => {
  switch (recordType) {
    case "MX":
      return "Mail Server";
    case "CNAME":
      return "Points To";
    case "TXT":
      return "Text Value";
    case "NS":
      return "Nameserver";
    default:
      return "Value";
  }
};
