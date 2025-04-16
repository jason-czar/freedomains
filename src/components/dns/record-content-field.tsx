
import React from "react";
import { Input } from "@/components/ui/input";
import { getContentLabel, getContentPlaceholder } from "./validators/ui-helpers";
import { AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
        {type === "TXT" && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-1 inline-flex items-center">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>TXT record content will be automatically wrapped in quotation marks if needed. Example: "vc-domain-verify=verification-token"</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
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
          {type === "TXT" && (
            <p className="text-xs text-gray-500 mt-1">
              Quotation marks will be added automatically. Example: "vc-domain-verify=verification-token"
            </p>
          )}
          {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
        </>
      )}
    </div>
  );
};

export default RecordContentField;
