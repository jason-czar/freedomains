import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { validateDomainName } from "@/utils/domain-validation";
import { checkPaymentMethod, redirectToStripeCheckout } from "@/utils/payment";
import { registerDomain } from "@/services/domain";

export const useDomainRegistration = (fetchDomains: () => Promise<void>) => {
  const [creatingDomain, setCreatingDomain] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const [domainSuffix] = useState("com.channel");  // Updated to com.channel
  const [registrationType, setRegistrationType] = useState("standard");
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [includeEmail, setIncludeEmail] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePaymentSuccess = () => {
    setHasPaymentMethod(true);
    setShowPaymentForm(false);
    handleDomainRegistration();
  };

  const handleDomainRegistration = async () => {
    if (!user) {
      toast.error("You must be logged in to register a domain");
      navigate("/login");
      return;
    }

    if (!newDomain.trim()) {
      toast.error("Please enter a domain name");
      return;
    }

    if (!isAvailable) {
      toast.error("This domain is not available");
      return;
    }

    if (!hasPaymentMethod) {
      const checkoutUrl = await redirectToStripeCheckout('domain', user.id, newDomain, domainSuffix);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
      return;
    }

    setCreatingDomain(true);
    try {
      await registerDomain(user.id, newDomain, domainSuffix, includeEmail);

      if (includeEmail) {
        const checkoutUrl = await redirectToStripeCheckout('email', user.id, newDomain, domainSuffix);
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        }
        return;
      }

      toast.success("Domain registered successfully!");
      
      const freeMessage = "Your domain is free for the first year.";
      const renewalMessage = "It will renew at $19.99/year after the first year.";
      const emailMessage = includeEmail ? "Email service ($4.99/month) has been activated." : "";
      
      toast.info(`${freeMessage} ${renewalMessage} ${emailMessage}`, {
        duration: 10000
      });
      
      setNewDomain("");
      setIsAvailable(null);
      setIncludeEmail(false);
      fetchDomains();
      
      navigate('/dashboard?tab=domains');
    } catch (error: any) {
      console.error("Error registering domain:", error.message);
      toast.error("Failed to register domain: " + error.message);
    } finally {
      setCreatingDomain(false);
    }
  };

  const initializePaymentCheck = async () => {
    if (user) {
      const hasMethod = await checkPaymentMethod(user.id);
      setHasPaymentMethod(hasMethod);
    }
  };

  return {
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
    checkPaymentMethod: initializePaymentCheck,
    handlePaymentSuccess,
    registerDomain: handleDomainRegistration
  };
};
