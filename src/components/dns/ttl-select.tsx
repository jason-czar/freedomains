
import React from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const TTL_OPTIONS = [
  { value: 1, label: "Automatic" },
  { value: 60, label: "1 minute" },
  { value: 300, label: "5 minutes" },
  { value: 1800, label: "30 minutes" },
  { value: 3600, label: "1 hour" },
  { value: 7200, label: "2 hours" },
  { value: 18000, label: "5 hours" },
  { value: 43200, label: "12 hours" },
  { value: 86400, label: "1 day" },
];

export const getFormattedTTL = (ttl: number) => {
  if (ttl === 1) return "Automatic";
  if (ttl === 60) return "1 minute";
  if (ttl === 300) return "5 minutes";
  if (ttl === 1800) return "30 minutes";
  if (ttl === 3600) return "1 hour";
  if (ttl === 7200) return "2 hours";
  if (ttl === 18000) return "5 hours";
  if (ttl === 43200) return "12 hours";
  if (ttl === 86400) return "1 day";
  return `${ttl} seconds`;
};

interface TTLSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const TTLSelect: React.FC<TTLSelectProps> = ({
  value,
  onValueChange
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        TTL (Time to Live)
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select TTL" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {TTL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TTLSelect;
