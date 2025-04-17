
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Info } from "lucide-react";

const DomainInstructions: React.FC = () => {
  return (
    <Card className="mt-8 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-green-400" />
          DNS Setup Instructions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="nameservers">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900/60 p-1">
            <TabsTrigger value="nameservers" className="data-[state=active]:bg-gray-800 data-[state=active]:text-green-400">Nameserver Setup</TabsTrigger>
            <TabsTrigger value="records" className="data-[state=active]:bg-gray-800 data-[state=active]:text-green-400">DNS Records</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nameservers" className="space-y-4 mt-4">
            <p className="text-sm text-gray-300">
              Use the following nameservers with your domain registrar to delegate DNS management to our service:
            </p>
            
            <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800/50">
              <ul className="space-y-2">
                <li className="font-mono text-sm flex items-center text-gray-200">
                  <Check className="h-4 w-4 text-green-400 mr-2" />
                  ns1.yourdomainprovider.com
                </li>
                <li className="font-mono text-sm flex items-center text-gray-200">
                  <Check className="h-4 w-4 text-green-400 mr-2" />
                  ns2.yourdomainprovider.com
                </li>
              </ul>
            </div>
            
            <p className="text-sm text-gray-400 mt-4">
              <strong className="text-gray-300">Note:</strong> Nameserver changes can take 24-48 hours to fully propagate across the internet.
            </p>
          </TabsContent>
          
          <TabsContent value="records" className="space-y-4 mt-4">
            <p className="text-sm text-gray-300">
              If you prefer to keep your existing nameservers, add these DNS records to your domain:
            </p>
            
            <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800/50">
              <div className="grid grid-cols-4 gap-2 font-semibold text-sm border-b border-gray-800 pb-2 mb-2">
                <div className="text-green-400">Type</div>
                <div className="text-green-400">Name</div>
                <div className="text-green-400">Value</div>
                <div className="text-green-400">TTL</div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-sm border-b border-gray-800/50 pb-2 mb-2 text-gray-200">
                <div>A</div>
                <div>@</div>
                <div>76.76.21.21</div>
                <div>3600</div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-sm text-gray-200">
                <div>CNAME</div>
                <div>_vercel</div>
                <div>cname.vercel-dns.com</div>
                <div>3600</div>
              </div>
            </div>
            
            <p className="text-sm text-gray-400 mt-4">
              <strong className="text-gray-300">Note:</strong> DNS record changes typically propagate within a few hours.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DomainInstructions;
