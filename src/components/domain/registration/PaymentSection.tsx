
import React from "react";
import PaymentMethodForm from "../PaymentMethodForm";

interface PaymentSectionProps {
  showPaymentForm: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  showPaymentForm,
  onSuccess,
  onCancel
}) => {
  if (!showPaymentForm) return null;
  
  return (
    <PaymentMethodForm 
      onSuccess={onSuccess} 
      onCancel={onCancel} 
    />
  );
};

export default PaymentSection;
