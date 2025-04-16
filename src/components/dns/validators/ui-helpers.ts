
/**
 * UI helper functions for DNS records
 */

/**
 * Gets the placeholder text for a record content field based on the record type
 */
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

/**
 * Gets the label for a record content field based on the record type
 */
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

/**
 * Gets help text for a specific field based on the record type
 */
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
