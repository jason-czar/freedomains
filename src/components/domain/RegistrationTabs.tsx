
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RegistrationTabsProps {
  registrationType: string;
  setRegistrationType: (value: string) => void;
}

const RegistrationTabs: React.FC<RegistrationTabsProps> = ({
  registrationType,
  setRegistrationType
}) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-4">
      <p className="text-blue-800">
        <strong>Standard Domain:</strong> We'll create an A record pointing to Vercel. 
        You'll need to add this domain to your Vercel project settings.
      </p>
    </div>
  );
};

export default RegistrationTabs;
