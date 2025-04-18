import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DomainAvailabilityChecker from "./DomainAvailabilityChecker";
import RegistrationTabs from "./RegistrationTabs";
import RegisterDomainButton from "./RegisterDomainButton";
import { getSearchParam } from "@/utils/urlParams";
interface DomainRegistrationFormProps {
  fetchDomains: () => Promise<void>;
}
const DomainRegistrationForm: React.FC<DomainRegistrationFormProps> = ({
  fetchDomains
}) => {
  const [newDomain, setNewDomain] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [creatingDomain, setCreatingDomain] = useState(false);
  const [domainSuffix, setDomainSuffix] = useState("com.channel");
  const [registrationType, setRegistrationType] = useState("standard");
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const validateDomainName = (domain: string) => {
    // Basic validation: only alphanumeric and hyphens, between 3-63 characters
    const isValid = /^[a-z0-9-]{3,63}$/.test(domain) && !domain.startsWith('-') && !domain.endsWith('-');
    return isValid;
  };
  const registerDomain = async () => {
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
    setCreatingDomain(true);
    try {
      // Create DNS records directly through Cloudflare
      const {
        data: cfData,
        error: cfError
      } = await supabase.functions.invoke("domain-dns", {
        body: {
          action: "create",
          subdomain: newDomain.trim(),
          domain: domainSuffix,
          records: [{
            type: "A",
            name: newDomain.trim(),
            content: "76.76.21.21",
            ttl: 1,
            proxied: true
          }, {
            type: "CNAME",
            name: `_vercel.${newDomain.trim()}`,
            content: "cname.vercel-dns.com",
            ttl: 1,
            proxied: false
          }]
        }
      });
      if (cfError) throw cfError;
      if (!cfData.success) {
        throw new Error("Failed to create DNS records: " + JSON.stringify(cfData.cloudflareResponse?.errors));
      }

      // Register in database
      const {
        error: dbError
      } = await supabase.from("domains").insert({
        user_id: user.id,
        subdomain: newDomain.trim(),
        is_active: true,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        settings: {
          domain_suffix: domainSuffix,
          delegation_type: "standard",
          dns_active: true,
          vercel_cname_added: true
        }
      });
      if (dbError) {
        // Rollback Cloudflare records if database insert fails
        await supabase.functions.invoke("domain-dns", {
          body: {
            action: "delete",
            subdomain: newDomain.trim(),
            domain: domainSuffix
          }
        });
        throw dbError;
      }
      toast.success("Domain registered successfully!");
      toast.info(`Domain ${newDomain}.${domainSuffix} is ready to use. You can now manage DNS records through the DNS Manager.`, {
        duration: 10000
      });
      setNewDomain("");
      setIsAvailable(null);
      fetchDomains();
    } catch (error: any) {
      console.error("Error registering domain:", error.message);
      toast.error("Failed to register domain: " + error.message);
    } finally {
      setCreatingDomain(false);
    }
  };
  const isRegisterButtonDisabled = !isAvailable || !validateDomainName(newDomain) || creatingDomain;
  useEffect(() => {
    const domainParam = getSearchParam();
    if (domainParam) {
      setNewDomain(domainParam);
      // Trigger the availability check after a short delay to ensure the component is fully mounted
      setTimeout(() => {
        const checkAvailabilityButton = document.querySelector('[data-action="check-availability"]') as HTMLButtonElement;
        if (checkAvailabilityButton) {
          checkAvailabilityButton.click();
        }
      }, 100);
    }
  }, []);
  return <div className="mb-6">
      
      
      <RegistrationTabs registrationType={registrationType} setRegistrationType={setRegistrationType} />
      
      <div className="w-full md:w-1/2 mx-auto">
        <DomainAvailabilityChecker newDomain={newDomain} setNewDomain={setNewDomain} isAvailable={isAvailable} setIsAvailable={setIsAvailable} domainSuffix={domainSuffix} validateDomainName={validateDomainName} />
      </div>
      
      <div className="mt-4 flex justify-center">
        <RegisterDomainButton onClick={registerDomain} disabled={isRegisterButtonDisabled} isLoading={creatingDomain} />
      </div>
    </div>;
};
export default DomainRegistrationForm;