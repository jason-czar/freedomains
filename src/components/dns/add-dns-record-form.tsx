
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
import { validateDNSRecord } from "./dns-record-validator";
import { DNSRecord } from "@/types/domain-types";

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

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleRecordChange = (field: keyof DNSRecord, value: any) => {
    setNewRecord(prev => {
      const updated = { ...prev, [field]: value };
      
      // Reset proxied flag for records that don't support it
      if (field === 'type') {
        updated.proxied = ['A', 'AAAA', 'CNAME'].includes(value) ? true : false;
      }
      
      return updated;
    });
    setValidationError(null);
  };

  const handleAddRecord = () => {
    const validation = validateDNSRecord(newRecord, existingRecords, fullDomain);
    
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }
    
    // Format name field properly
    const formattedRecord = {...newRecord};
    
    // For root domain use @
    if (formattedRecord.name === "" || formattedRecord.name === "@") {
      formattedRecord.name = "@";
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
          fullDomain={fullDomain}
          type={newRecord.type}
        />
        
        <RecordContentField
          type={newRecord.type}
          content={newRecord.content}
          onChange={(value) => handleRecordChange('content', value)}
        />
        
        {newRecord.type === "MX" && (
          <RecordPriorityField
            priority={newRecord.priority}
            onChange={(value) => handleRecordChange('priority', value)}
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
      
      <ValidationError message={validationError} />
      
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
