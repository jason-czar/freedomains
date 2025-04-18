
import React from "react";
import { Mail } from "lucide-react";
import PaymentMethodForm from "../domain/PaymentMethodForm";
import EmailFeaturesList from "./EmailFeaturesList";
import EmailPricingSection from "./EmailPricingSection";
import EmailActivationButton from "./EmailActivationButton";

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
  if (showPaymentForm) {
    return (
      <PaymentMethodForm
        onSuccess={onPaymentSuccess}
        onCancel={onPaymentCancel}
      />
    );
  }

  return (
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
      
      <EmailFeaturesList />
      <EmailPricingSection />
      
      <EmailActivationButton
        activating={activating}
        hasPaymentMethod={hasPaymentMethod}
        onActivate={onActivate}
      />
    </div>
  );
};

export default EmailServiceActivation;
