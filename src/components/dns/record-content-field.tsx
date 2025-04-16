
import React from "react";
import { Input } from "@/components/ui/input";
import { getContentLabel, getContentPlaceholder } from "./dns-record-validator";

interface RecordContentFieldProps {
  type: string;
  content: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  helpText?: string;
}

const RecordContentField: React.FC<RecordContentFieldProps> = ({ 
  type, 
  content, 
  onChange,
  onBlur,
  error,
  helpText
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {getContentLabel(type)}
      </label>
      <Input
        placeholder={getContentPlaceholder(type)}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={error ? "border-red-300 pr-10 focus:border-red-500 focus:ring-red-500" : ""}
      />
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : (
        <>
          {type === "A" && (
            <p className="text-xs text-gray-500 mt-1">
              For Vercel, use: 76.76.21.21
            </p>
          )}
          {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
        </>
      )}
    </div>
  );
};

export default RecordContentField;
