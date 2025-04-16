
import React from "react";
import { getFieldHelp } from "../validators/ui-helpers";
import DNSRecordTypeSelect from "../dns-record-type-select";
import RecordNameField from "../record-name-field";
import RecordContentField from "../record-content-field";
import RecordPriorityField from "../record-priority-field";
import RecordProxyField from "../record-proxy-field";
import TTLSelect from "../ttl-select";
import { DNSRecord } from "@/types/domain-types";

interface DNSRecordFormFieldsProps {
  newRecord: DNSRecord;
  fullDomain: string;
  fieldErrors: Record<string, string>;
  handleRecordChange: (field: keyof DNSRecord, value: any) => void;
  handleBlur: (field: keyof DNSRecord) => void;
}

const DNSRecordFormFields: React.FC<DNSRecordFormFieldsProps> = ({
  newRecord,
  fullDomain,
  fieldErrors,
  handleRecordChange,
  handleBlur
}) => {
  return (
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
  );
};

export default DNSRecordFormFields;
