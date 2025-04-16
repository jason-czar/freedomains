
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Plus } from "lucide-react";

interface DNSRecordFormFooterProps {
  adding: boolean;
  disabled: boolean;
  onAddRecord: () => void;
}

const DNSRecordFormFooter: React.FC<DNSRecordFormFooterProps> = ({
  adding,
  disabled,
  onAddRecord
}) => {
  return (
    <div className="flex items-center mt-4 pt-4 border-t border-gray-200">
      <div className="flex-1 text-sm text-gray-500">
        <AlertCircle className="h-4 w-4 inline-block mr-1 text-orange-500" />
        DNS changes can take up to 24 hours to propagate globally
      </div>
      
      <Button 
        onClick={onAddRecord}
        disabled={adding || disabled}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {adding ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </>
        )}
      </Button>
    </div>
  );
};

export default DNSRecordFormFooter;
