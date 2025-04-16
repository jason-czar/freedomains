
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import DNSRecordTypeSelect from "./dns-record-type-select";
import TTLSelect from "./ttl-select";
import RecordNameField from "./record-name-field";
import RecordContentField from "./record-content-field";
import RecordPriorityField from "./record-priority-field";
import RecordProxyField from "./record-proxy-field";
import ValidationError from "./record-validation-error";
import { validateDNSRecord, getFieldHelp } from "./validators/dns-record-validator";
import { formatTXTRecord } from "./validators/content-formatters";
import { DNSRecord, ValidationError as ValidationErrorType } from "@/types/domain-types";

interface AddDNSRecordFormProps {
  fullDomain: string;
  adding: boolean;
  onAddRecord: (record: DNSRecord) => void;
  existingRecords?: DNSRecord[];
}

const AddDNSRecordForm: React.FC<AddDNSRecordFormProps> = ({
  fullDomain,
  adding,
  onAddRecord,
  existingRecords = []
}) => {
  const [newRecord, setNewRecord] = useState<DNSRecord>({
    type: "A",
    name: "",
    content: "",
    ttl: 1,
    proxied: true,
  });

  const [validationError, setValidationError] = useState<ValidationErrorType | null>(null);
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

  return (
    <div className="space-y-4 border rounded-md p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DNSRecordTypeSelect
          value={newRecord.type}
          onValueChange={(value) => handleRecordChange('type', value)}
        />
        
        <RecordNameField
          name={newRecord.name}
          onChange={(value) => handleRecordChange('name', value)}
          onBlur={() => handleBlur('name')}
          fullDomain={fullDomain}
          type={newRecord.type}
          error={fieldErrors.name}
          helpText={getFieldHelp(newRecord.type, 'name')}
        />
        
        <RecordContentField
          type={newRecord.type}
          content={newRecord.content}
          onChange={(value) => handleRecordChange('content', value)}
          onBlur={() => handleBlur('content')}
          error={fieldErrors.content}
          helpText={getFieldHelp(newRecord.type, 'content')}
        />
        
        {newRecord.type === "MX" && (
          <RecordPriorityField
            priority={newRecord.priority}
            onChange={(value) => handleRecordChange('priority', value)}
            onBlur={() => handleBlur('priority')}
            error={fieldErrors.priority}
            helpText={getFieldHelp(newRecord.type, 'priority')}
          />
        )}
        
        <TTLSelect
          value={String(newRecord.ttl || 1)}
          onValueChange={(value) => handleRecordChange('ttl', parseInt(value))}
        />
        
        {(newRecord.type === "A" || newRecord.type === "AAAA" || newRecord.type === "CNAME") && (
          <RecordProxyField
            proxied={!!newRecord.proxied}
            onChange={(value) => handleRecordChange('proxied', value)}
          />
        )}
      </div>
      
      {validationError && <ValidationError error={validationError} />}
      
      <div className="flex items-center mt-4 pt-4 border-t border-gray-200">
        <div className="flex-1 text-sm text-gray-500">
          <AlertCircle className="h-4 w-4 inline-block mr-1 text-orange-500" />
          DNS changes can take up to 24 hours to propagate globally
        </div>
        
        <Button 
          onClick={handleAddRecord}
          disabled={adding || !newRecord.content}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {adding ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AddDNSRecordForm;
