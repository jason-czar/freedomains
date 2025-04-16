
import React from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const DNS_RECORD_TYPES = [
  { value: "A", label: "A (IPv4 Address)" },
  { value: "AAAA", label: "AAAA (IPv6 Address)" },
  { value: "CNAME", label: "CNAME (Alias)" },
  { value: "MX", label: "MX (Mail Exchange)" },
  { value: "TXT", label: "TXT (Text)" },
  { value: "NS", label: "NS (Nameserver)" },
  { value: "SRV", label: "SRV (Service)" },
  { value: "CAA", label: "CAA (Certificate Authority)" },
];

interface DNSRecordTypeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const DNSRecordTypeSelect: React.FC<DNSRecordTypeSelectProps> = ({ 
  value, 
  onValueChange 
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Record Type
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select record type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {DNS_RECORD_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default DNSRecordTypeSelect;
