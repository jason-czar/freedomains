import { DNSRecord, DNSValidationResult } from "@/types/domain-types";

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

export const isValidHostname = (hostname: string): boolean => {
  // Simple hostname validation
  return /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(hostname);
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const formatTXTRecord = (content: string): string => {
  // Trim whitespace
  content = content.trim();
  
  // If the content is already wrapped in double quotes, return as is
  if (/^".*"$/.test(content)) {
    return content;
  }
  
  // Otherwise, wrap it in double quotes
  return `"${content}"`;
};

export const validateDNSRecord = (
  newRecord: DNSRecord, 
  existingRecords: DNSRecord[] = [], 
  fullDomain: string
): DNSValidationResult => {
  // Base validation - empty fields
  if (!newRecord.name && newRecord.name !== '@') {
    return {
      isValid: false,
      error: {
        message: "Record name is required.",
        field: "name",
        code: "required"
      }
    };
  }
  
  if (!newRecord.content) {
    return {
      isValid: false,
      error: {
        message: "Record content is required.",
        field: "content",
        code: "required"
      }
    };
  }
  
  // Record type specific validations
  switch (newRecord.type) {
    case "A":
      if (!isValidIPv4(newRecord.content)) {
        return {
          isValid: false,
          error: {
            message: "Please enter a valid IPv4 address (e.g., 192.0.2.1).",
            field: "content",
            code: "invalid_ipv4"
          }
        };
      }
      break;
    
    case "AAAA":
      if (!isValidIPv6(newRecord.content)) {
        return {
          isValid: false,
          error: {
            message: "Please enter a valid IPv6 address (e.g., 2001:db8::1).",
            field: "content",
            code: "invalid_ipv6"
          }
        };
      }
      break;
    
    case "CNAME":
      if (newRecord.content === fullDomain ||
          newRecord.content === `${newRecord.name}.${fullDomain}`) {
        return {
          isValid: false,
          error: {
            message: "CNAME cannot point to itself.",
            field: "content",
            code: "cname_loop"
          }
        };
      }
      break;
    
    case "MX":
      if (!newRecord.priority && newRecord.priority !== 0) {
        return {
          isValid: false,
          error: {
            message: "MX records require a priority value.",
            field: "priority",
            code: "missing_priority"
          }
        };
      }
      
      if (!isValidHostname(newRecord.content) && !isValidEmail(newRecord.content)) {
        return {
          isValid: false,
          error: {
            message: "Please enter a valid domain name for the mail server.",
            field: "content",
            code: "invalid_mx_target"
          }
        };
      }
      break;
    
    case "TXT":
      // TXT records should not be empty and have reasonable length
      if (newRecord.content.length > 2000) {
        return {
          isValid: false,
          error: {
            message: "TXT record is too long (maximum 2000 characters).",
            field: "content",
            code: "txt_too_long"
          }
        };
      }
      break;
    
    case "NS":
      if (!isValidHostname(newRecord.content)) {
        return {
          isValid: false,
          error: {
            message: "Please enter a valid domain name for the nameserver.",
            field: "content",
            code: "invalid_nameserver"
          }
        };
      }
      break;
  }
  
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
        error: {
          message: `A ${newRecord.type} record with this name already exists. Please delete it first or use a different name.`,
          field: "name",
          code: "duplicate_record"
        }
      };
    }
  }
  
  // CNAME validation for root domain
  if (newRecord.type === "CNAME" && (newRecord.name === "" || newRecord.name === "@")) {
    if (existingRecords.some(r => (r.type === "A" || r.type === "AAAA") && 
        (r.name === fullDomain || r.name === "@"))) {
      return {
        isValid: false,
        error: {
          message: "Cannot create a CNAME record for the root domain when A or AAAA records exist.",
          field: "type",
          code: "cname_conflict"
        }
      };
    }
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

export const getFieldHelp = (recordType: string, field: string): string => {
  if (field === "content") {
    switch (recordType) {
      case "A":
        return "IPv4 address that this domain should point to.";
      case "AAAA":
        return "IPv6 address that this domain should point to.";
      case "CNAME":
        return "Domain name that this domain should alias to.";
      case "MX":
        return "Mail server that handles email for this domain.";
      case "TXT":
        return "Text record, often used for domain verification. Quotation marks will be added automatically if needed.";
      case "NS":
        return "Nameserver authority for this domain.";
      default:
        return "";
    }
  }
  
  if (field === "name") {
    return "The subdomain or @ for the root domain.";
  }
  
  if (field === "priority" && recordType === "MX") {
    return "Lower values have higher priority.";
  }
  
  return "";
};
