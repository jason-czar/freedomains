
import React from "react";
import RegistrationTabs from "../RegistrationTabs";

interface DomainRegistrationFormHeaderProps {
  registrationType: string;
  setRegistrationType: (type: string) => void;
}

const DomainRegistrationFormHeader: React.FC<DomainRegistrationFormHeaderProps> = ({
  registrationType,
  setRegistrationType
}) => {
  return (
    <RegistrationTabs 
      registrationType={registrationType} 
      setRegistrationType={setRegistrationType} 
    />
  );
};

export default DomainRegistrationFormHeader;
