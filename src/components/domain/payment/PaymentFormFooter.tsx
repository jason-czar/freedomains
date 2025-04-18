
import React from "react";
import { Button } from "@/components/ui/button";
import { XCircle, Loader2, CreditCard } from "lucide-react";

interface PaymentFormFooterProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export const PaymentFormFooter: React.FC<PaymentFormFooterProps> = ({ 
  isSubmitting, 
  onCancel 
}) => {
  return (
    <div className="flex justify-end space-x-4 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        className="border-gray-700 text-gray-300"
      >
        <XCircle className="h-4 w-4 mr-2" />
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-gradient-to-r from-emerald-500 to-green-400 text-gray-900"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Save Card
          </>
        )}
      </Button>
    </div>
  );
};
