
import React, { useEffect } from "react";
import { useDomainRegistration } from "./registration/use-domain-registration";
import { getSearchParam } from "@/utils/urlParams";
import DomainRegistrationFormHeader from "./registration/DomainRegistrationFormHeader";
import DomainAvailabilityChecker from "./DomainAvailabilityChecker";
import EmailAddOnOption from "./EmailAddOnOption";
import PaymentSection from "./registration/PaymentSection";
import RegisterDomainButton from "./RegisterDomainButton";

interface DomainRegistrationFormProps {
  fetchDomains: () => Promise<void>;
}

const DomainRegistrationForm: React.FC<DomainRegistrationFormProps> = ({
  fetchDomains
}) => {
  const {
    creatingDomain,
    isAvailable,
    setIsAvailable,
    newDomain,
    setNewDomain,
    domainSuffix,
    registrationType,
    setRegistrationType,
    hasPaymentMethod,
    includeEmail,
    setIncludeEmail,
    showPaymentForm,
    setShowPaymentForm,
    validateDomainName,
    checkPaymentMethod,
    handlePaymentSuccess,
    registerDomain
  } = useDomainRegistration(fetchDomains);

  useEffect(() => {
    checkPaymentMethod();
  }, []);

  useEffect(() => {
    const domainParam = getSearchParam();
    if (domainParam) {
      setNewDomain(domainParam);
      setTimeout(() => {
        const checkAvailabilityButton = document.querySelector('[data-action="check-availability"]') as HTMLButtonElement;
        if (checkAvailabilityButton) {
          checkAvailabilityButton.click();
        }
      }, 100);
    }
  }, []);

  const isRegisterButtonDisabled = !isAvailable || !validateDomainName(newDomain) || creatingDomain;

  return (
    <div className="mb-6 py-[22px]">
      <DomainRegistrationFormHeader 
        registrationType={registrationType}
        setRegistrationType={setRegistrationType}
      />
      
      <div className="w-full md:w-1/2 mx-auto">
        <DomainAvailabilityChecker 
          newDomain={newDomain} 
          setNewDomain={setNewDomain} 
          isAvailable={isAvailable} 
          setIsAvailable={setIsAvailable} 
          domainSuffix={domainSuffix} 
          validateDomainName={validateDomainName} 
        />

        {isAvailable && (
          <EmailAddOnOption 
            includeEmail={includeEmail} 
            setIncludeEmail={setIncludeEmail} 
            domain={`${newDomain}.${domainSuffix}`} 
          />
        )}
        
        <PaymentSection 
          showPaymentForm={showPaymentForm}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPaymentForm(false)}
        />

        {!showPaymentForm && (
          <div className="mt-4 flex justify-center">
            <RegisterDomainButton 
              onClick={registerDomain} 
              disabled={isRegisterButtonDisabled} 
              isLoading={creatingDomain} 
              hasPaymentMethod={hasPaymentMethod}
            />
          </div>
        )}

        {isAvailable && !hasPaymentMethod && !showPaymentForm && (
          <div className="mt-4 text-center text-gray-500 text-sm">
            <p>Payment information is required for domain registration.</p>
            <p>Your domain will be free for the first year, then renew at $19.99/year.</p>
            {includeEmail && <p>Email service will be billed at $4.99/month starting immediately.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainRegistrationForm;
