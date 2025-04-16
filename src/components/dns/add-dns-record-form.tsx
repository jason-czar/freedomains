
import React from "react";
import ValidationError from "./record-validation-error";
import DNSRecordFormFields from "./form-sections/dns-record-form-fields";
import DNSRecordFormFooter from "./form-sections/dns-record-form-footer";
import { useDNSRecordForm } from "./hooks/use-dns-record-form";
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
  const {
    newRecord,
    validationError,
    fieldErrors,
    handleRecordChange,
    handleBlur,
    handleAddRecord
  } = useDNSRecordForm(existingRecords, fullDomain, onAddRecord);

  return (
    <div className="space-y-4 border rounded-md p-4">
      <DNSRecordFormFields
        newRecord={newRecord}
        fullDomain={fullDomain}
        fieldErrors={fieldErrors}
        handleRecordChange={handleRecordChange}
        handleBlur={handleBlur}
      />
      
      {validationError && <ValidationError error={validationError} />}
      
      <DNSRecordFormFooter
        adding={adding}
        disabled={!newRecord.content}
        onAddRecord={handleAddRecord}
      />
    </div>
  );
};

export default AddDNSRecordForm;
