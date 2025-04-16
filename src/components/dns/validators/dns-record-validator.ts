
import { DNSRecord, DNSValidationResult } from "@/types/domain-types";
import { isValidIPv4, isValidIPv6, isValidHostname, isValidEmail } from "./common-validators";

/**
 * Validates a DNS record
 */
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
