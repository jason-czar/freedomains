
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DomainAvailabilityChecker from "./DomainAvailabilityChecker";
import NameserverManager from "./NameserverManager";

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
  const [nameservers, setNameservers] = useState<string[]>(["ns1.example.com", "ns2.example.com"]);
  const { user } = useAuth();
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
      // Prepare nameservers if needed for delegation
      const nsArray = registrationType === "delegated" 
        ? nameservers.filter(ns => ns.trim() !== "") 
        : undefined;
      
      // Create DNS records directly through Cloudflare
      const { data: cfData, error: cfError } = await supabase.functions.invoke("domain-dns", {
        body: { 
          action: "create", 
          subdomain: newDomain.trim(),
          domain: domainSuffix,
          nameservers: nsArray,
          records: [
            {
              type: "A",
              name: newDomain.trim(),
              content: "76.76.21.21",
              ttl: 1,
              proxied: true
            },
            {
              type: "TXT",
              name: `_vercel.${newDomain.trim()}`,
              content: "vc-domain-verify=verification-token", // This will be updated by Vercel
              ttl: 1,
              proxied: false
            }
          ]
        }
      });
      
      if (cfError) throw cfError;
      
      if (!cfData.success && !cfData.delegated) {
        throw new Error("Failed to create DNS records: " + JSON.stringify(cfData.cloudflareResponse?.errors));
      }
      
      // Register in database
      const { error: dbError } = await supabase
        .from("domains")
        .insert({
          user_id: user.id,
          subdomain: newDomain.trim(),
          is_active: true,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          settings: {
            domain_suffix: domainSuffix,
            delegation_type: registrationType,
            nameservers: nsArray,
            delegated: registrationType === "delegated"
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
      
      if (registrationType === "delegated") {
        toast.info(`Your domain ${newDomain}.${domainSuffix} has been delegated to your nameservers.`, {
          duration: 10000,
        });
      } else {
        toast.info(`Domain ${newDomain}.${domainSuffix} is ready to use. You can now manage DNS records through the DNS Manager.`, {
          duration: 10000,
        });
      }
      
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

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Register New Domain</h3>
      
      <Tabs value={registrationType} onValueChange={setRegistrationType} className="mb-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-4">
          <TabsTrigger value="standard">Standard Domain</TabsTrigger>
          <TabsTrigger value="delegated">Nameserver Delegation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="standard">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-blue-800">
              <strong>Standard Domain:</strong> We'll create an A record pointing to Vercel. 
              You'll need to add this domain to your Vercel project settings.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="delegated">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-blue-800">
              <strong>Nameserver Delegation:</strong> We'll delegate this subdomain to your nameservers, 
              giving you full control over all DNS records. You'll need your own DNS hosting service 
              (like Cloudflare, AWS Route53, etc).
            </p>
          </div>
          
          <NameserverManager 
            nameservers={nameservers}
            setNameservers={setNameservers}
          />
        </TabsContent>
      </Tabs>
      
      <DomainAvailabilityChecker
        newDomain={newDomain}
        setNewDomain={setNewDomain}
        isAvailable={isAvailable}
        setIsAvailable={setIsAvailable}
        domainSuffix={domainSuffix}
        validateDomainName={validateDomainName}
      />
      
      <div className="mt-4">
        <Button 
          onClick={registerDomain} 
          disabled={!isAvailable || !validateDomainName(newDomain) || creatingDomain || 
            (registrationType === "delegated" && nameservers.filter(ns => ns.trim() !== "").length < 2)}
          className="w-full md:w-auto"
        >
          {creatingDomain ? (
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
      </div>
    </div>
  );
};

export default DomainRegistrationForm;
