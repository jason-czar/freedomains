
import React from "react";
import { Input } from "@/components/ui/input";
import { getContentLabel, getContentPlaceholder } from "./dns-record-validator";

interface RecordContentFieldProps {
  type: string;
  content: string;
  onChange: (value: string) => void;
}

const RecordContentField: React.FC<RecordContentFieldProps> = ({ 
  type, 
  content, 
  onChange 
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
      />
      {type === "A" && (
        <p className="text-xs text-gray-500 mt-1">
          For Vercel, use: 76.76.21.21
        </p>
      )}
    </div>
  );
};

export default RecordContentField;
