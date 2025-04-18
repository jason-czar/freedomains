
import React from "react";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaymentMethodForm from "../domain/PaymentMethodForm";

interface EmailServiceActivationProps {
  domainDisplay: string;
  showPaymentForm: boolean;
  activating: boolean;
  hasPaymentMethod: boolean;
  onActivate: () => void;
  onPaymentSuccess: () => void;
  onPaymentCancel: () => void;
}

const EmailServiceActivation: React.FC<EmailServiceActivationProps> = ({
  domainDisplay,
  showPaymentForm,
  activating,
  hasPaymentMethod,
  onActivate,
  onPaymentSuccess,
  onPaymentCancel
}) => {
  return showPaymentForm ? (
    <PaymentMethodForm
      onSuccess={onPaymentSuccess}
      onCancel={onPaymentCancel}
    />
  ) : (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <div className="bg-indigo-900/30 p-3 rounded-full">
          <Mail className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Add Email Service to Your Domain</h3>
          <p className="text-gray-400">Create professional email addresses like you@{domainDisplay}</p>
        </div>
      </div>
      
      <div className="bg-indigo-900/20 rounded-lg p-5 mb-6">
        <h4 className="text-lg font-medium text-white mb-3">Email Service Features</h4>
        <ul className="space-y-2">
          {[
            "Professional email addresses on your domain",
            "5 mailboxes included",
            "25GB storage per mailbox",
            "Webmail access",
            "Mobile app access",
            "IMAP/POP support",
            "Spam and virus protection"
          ].map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="text-indigo-400 mr-2">✓</div>
              <div className="text-gray-300">{feature}</div>
            </li>
          ))}
        </ul>
        
        <div className="mt-4 pt-4 border-t border-indigo-800/30">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-white">$4.99</span>
            <span className="text-gray-400 ml-1">/month</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">Billed monthly, cancel anytime</p>
        </div>
      </div>
      
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
    </div>
  );
};

export default EmailServiceActivation;
