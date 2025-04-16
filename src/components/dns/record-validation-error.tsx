
import React from "react";
import { AlertCircle } from "lucide-react";
import { ValidationError as ValidationErrorType } from "@/types/domain-types";

interface ValidationErrorProps {
  error: ValidationErrorType | null | string;
}

const ValidationError: React.FC<ValidationErrorProps> = ({ error }) => {
  if (!error) return null;
  
  // Handle either string error message or ValidationError object
  const message = typeof error === 'string' ? error : error.message;
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm flex items-start">
      <AlertCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
      <div>{message}</div>
    </div>
  );
};

export default ValidationError;
