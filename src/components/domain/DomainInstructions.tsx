
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Info } from "lucide-react";

const DomainInstructions: React.FC = () => {
  return (
    <Card className="mt-8 bg-white/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          DNS Setup Instructions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="nameservers">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nameservers">Nameserver Setup</TabsTrigger>
            <TabsTrigger value="records">DNS Records</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nameservers" className="space-y-4 mt-4">
            <p className="text-sm text-gray-600">
              Use the following nameservers with your domain registrar to delegate DNS management to our service:
            </p>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <ul className="space-y-2">
                <li className="font-mono text-sm flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  ns1.yourdomainprovider.com
                </li>
                <li className="font-mono text-sm flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  ns2.yourdomainprovider.com
                </li>
              </ul>
            </div>
            
            <p className="text-sm text-gray-600 mt-4">
              <strong>Note:</strong> Nameserver changes can take 24-48 hours to fully propagate across the internet.
            </p>
          </TabsContent>
          
          <TabsContent value="records" className="space-y-4 mt-4">
            <p className="text-sm text-gray-600">
              If you prefer to keep your existing nameservers, add these DNS records to your domain:
            </p>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-4 gap-2 font-semibold text-sm border-b pb-2 mb-2">
                <div>Type</div>
                <div>Name</div>
                <div>Value</div>
                <div>TTL</div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-sm border-b pb-2 mb-2">
                <div>A</div>
                <div>@</div>
                <div>76.76.21.21</div>
                <div>3600</div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div>CNAME</div>
                <div>_vercel</div>
                <div>cname.vercel-dns.com</div>
                <div>3600</div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-4">
              <strong>Note:</strong> DNS record changes typically propagate within a few hours.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DomainInstructions;
