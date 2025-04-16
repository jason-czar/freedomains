
import { useState } from "react";
import { validateDNSRecord } from "../validators/dns-record-validator";
import { formatTXTRecord } from "../validators/content-formatters";
import { DNSRecord, ValidationError } from "@/types/domain-types";

export function useDNSRecordForm(
  existingRecords: DNSRecord[] = [],
  fullDomain: string,
  onAddRecord: (record: DNSRecord) => void
) {
  const [newRecord, setNewRecord] = useState<DNSRecord>({
    type: "A",
    name: "",
    content: "",
    ttl: 1,
    proxied: true,
  });

  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleRecordChange = (field: keyof DNSRecord, value: any) => {
    setNewRecord(prev => {
      const updated = { ...prev, [field]: value };
      
      // Reset proxied flag for records that don't support it
      if (field === 'type') {
        updated.proxied = ['A', 'AAAA', 'CNAME'].includes(value) ? true : false;
        
        // Reset priority if changing from MX to another type
        if (value !== 'MX') {
          updated.priority = undefined;
        } else if (!updated.priority) {
          updated.priority = 10; // Default MX priority
        }
      }
      
      return updated;
    });
    
    // Clear errors when field is updated
    setValidationError(null);
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateField = (field: keyof DNSRecord): string => {
    if (field === 'name' && !newRecord.name && newRecord.name !== '@') {
      return "Record name is required";
    }
    
    if (field === 'content' && !newRecord.content) {
      return "Record content is required";
    }
    
    if (field === 'priority' && newRecord.type === 'MX' && 
        (newRecord.priority === undefined || newRecord.priority < 0)) {
      return "MX records require a valid priority value";
    }
    
    return '';
  };

  const handleBlur = (field: keyof DNSRecord) => {
    const error = validateField(field);
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleAddRecord = () => {
    // First check for basic field validation
    const nameError = validateField('name');
    const contentError = validateField('content');
    const priorityError = validateField('priority');
    
    if (nameError || contentError || (newRecord.type === 'MX' && priorityError)) {
      setFieldErrors({
        name: nameError,
        content: contentError,
        priority: priorityError
      });
      return;
    }
    
    // Then perform more complex validation
    const validation = validateDNSRecord(newRecord, existingRecords, fullDomain);
    
    if (!validation.isValid) {
      setValidationError(validation.error);
      
      // Also set the specific field error for inline feedback
      if (validation.error && validation.error.field) {
        setFieldErrors(prev => ({ 
          ...prev, 
          [validation.error.field as string]: validation.error?.message || '' 
        }));
      }
      return;
    }
    
    // Format name field properly and handle TXT record formatting
    const formattedRecord = {...newRecord};
    
    // For root domain use @
    if (formattedRecord.name === "" || formattedRecord.name === "@") {
      formattedRecord.name = "@";
    }
    
    // For TXT records, ensure content is wrapped in quotes
    if (formattedRecord.type === "TXT") {
      formattedRecord.content = formatTXTRecord(formattedRecord.content);
    }
    
    onAddRecord(formattedRecord);
  };

  return {
    newRecord,
    validationError,
    fieldErrors,
    handleRecordChange,
    handleBlur,
    handleAddRecord
  };
}
