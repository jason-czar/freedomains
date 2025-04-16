
import React from "react";
import { Input } from "@/components/ui/input";

interface RecordPriorityFieldProps {
  priority: number | undefined;
  onChange: (value: number) => void;
}

const RecordPriorityField: React.FC<RecordPriorityFieldProps> = ({ 
  priority, 
  onChange 
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
      />
    </div>
  );
};

export default RecordPriorityField;
