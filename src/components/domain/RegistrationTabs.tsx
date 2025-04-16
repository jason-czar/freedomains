
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NameserverManager } from "./NameserverManager";

interface RegistrationTabsProps {
  registrationType: string;
  setRegistrationType: (value: string) => void;
  nameservers: string[];
  setNameservers: (nameservers: string[]) => void;
}

const RegistrationTabs: React.FC<RegistrationTabsProps> = ({
  registrationType,
  setRegistrationType,
  nameservers,
  setNameservers
}) => {
  return (
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
  );
};

export default RegistrationTabs;
