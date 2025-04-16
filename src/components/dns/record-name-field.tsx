
import React from "react";
import { Input } from "@/components/ui/input";

interface RecordNameFieldProps {
  name: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  fullDomain: string;
  type: string;
  error?: string;
  helpText?: string;
}

const RecordNameField: React.FC<RecordNameFieldProps> = ({ 
  name, 
  onChange, 
  onBlur,
  fullDomain,
  type,
  error,
  helpText
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
          onBlur={onBlur}
          className={error ? "border-red-300 pr-10 focus:border-red-500 focus:ring-red-500" : ""}
        />
        <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">
          .{fullDomain}
        </span>
      </div>
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : (
        <>
          <p className="text-xs text-gray-500 mt-1">
            Use @ for root domain ({fullDomain})
          </p>
          {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
        </>
      )}
    </div>
  );
};

export default RecordNameField;
