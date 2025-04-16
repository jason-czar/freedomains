
import React from "react";
import { Input } from "@/components/ui/input";

interface RecordNameFieldProps {
  name: string;
  onChange: (value: string) => void;
  fullDomain: string;
  type: string;
}

const RecordNameField: React.FC<RecordNameFieldProps> = ({ 
  name, 
  onChange, 
  fullDomain,
  type
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Name
      </label>
      <div className="flex">
        <Input
          placeholder={type === "MX" ? "mail" : "www"}
          value={name}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">
          .{fullDomain}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Use @ for root domain ({fullDomain})
      </p>
    </div>
  );
};

export default RecordNameField;
