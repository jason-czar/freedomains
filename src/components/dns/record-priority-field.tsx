
import React from "react";
import { Input } from "@/components/ui/input";

interface RecordPriorityFieldProps {
  priority: number | undefined;
  onChange: (value: number) => void;
  onBlur?: () => void;
  error?: string;
  helpText?: string;
}

const RecordPriorityField: React.FC<RecordPriorityFieldProps> = ({ 
  priority, 
  onChange,
  onBlur,
  error,
  helpText
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Priority
      </label>
      <Input
        type="number"
        placeholder="10"
        value={priority || ""}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        onBlur={onBlur}
        className={error ? "border-red-300 pr-10 focus:border-red-500 focus:ring-red-500" : ""}
      />
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : (
        <>
          {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
        </>
      )}
    </div>
  );
};

export default RecordPriorityField;
