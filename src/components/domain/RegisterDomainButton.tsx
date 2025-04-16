
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";

interface RegisterDomainButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

const RegisterDomainButton: React.FC<RegisterDomainButtonProps> = ({
  onClick,
  disabled,
  isLoading
}) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={disabled}
      className="w-full md:w-auto"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Registering...
        </>
      ) : (
        <>
          <PlusCircle className="h-4 w-4 mr-2" />
          Register
        </>
      )}
    </Button>
  );
};

export default RegisterDomainButton;
