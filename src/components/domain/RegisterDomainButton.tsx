
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RegisterDomainButtonProps {
  onClick: () => Promise<void>;
  disabled: boolean;
  isLoading: boolean;
  hasPaymentMethod?: boolean;
}

const RegisterDomainButton: React.FC<RegisterDomainButtonProps> = ({
  onClick,
  disabled,
  isLoading,
  hasPaymentMethod = true
}) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      await onClick();
      // Navigate to dashboard with domains tab active
      navigate('/dashboard?tab=domains');
    } catch (error) {
      // If onClick throws an error, it will be handled by the parent component
      console.error("Error during domain registration:", error);
    }
  };

  const buttonText = hasPaymentMethod ? 
    (isLoading ? "Registering..." : "Register") : 
    "Add Payment Method & Register";

  const buttonIcon = hasPaymentMethod ? 
    (isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin text-gray-800" /> : <PlusCircle className="h-4 w-4 mr-2 text-gray-800" />) : 
    <CreditCard className="h-4 w-4 mr-2 text-gray-800" />;

  return (
    <Button 
      onClick={handleClick} 
      disabled={disabled}
      className="w-1/2 md:w-1/2 bg-gradient-to-r from-emerald-500 to-green-400 text-gray-900 font-semibold hover:brightness-110 shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_rgba(0,255,165,0.4)]"
    >
      {buttonIcon}
      {buttonText}
    </Button>
  );
};

export default RegisterDomainButton;
