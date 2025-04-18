
import React from "react";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailActivationButtonProps {
  activating: boolean;
  hasPaymentMethod: boolean;
  onActivate: () => void;
}

const EmailActivationButton = ({ 
  activating, 
  hasPaymentMethod, 
  onActivate 
}: EmailActivationButtonProps) => {
  return (
    <>
      <Button
        className="w-full py-6 bg-gradient-to-r from-indigo-500 to-blue-400 text-white font-semibold hover:brightness-110"
        onClick={onActivate}
        disabled={activating}
      >
        {activating ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Activating Email Service...
          </>
        ) : (
          <>
            <Mail className="h-5 w-5 mr-2" />
            {hasPaymentMethod ? "Activate Email Service" : "Add Payment Method & Activate"}
          </>
        )}
      </Button>
      
      <p className="text-gray-400 text-sm mt-4 text-center">
        Email service will be billed immediately at $4.99/month.
      </p>
    </>
  );
};

export default EmailActivationButton;
