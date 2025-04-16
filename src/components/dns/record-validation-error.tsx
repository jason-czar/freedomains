
import React from "react";
import { AlertCircle } from "lucide-react";

interface ValidationErrorProps {
  message: string | null;
}

const ValidationError: React.FC<ValidationErrorProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm flex items-start">
      <AlertCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
      <div>{message}</div>
    </div>
  );
};

export default ValidationError;
