import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Info } from "lucide-react";
const DomainInstructions: React.FC = () => {
  return <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Domain Registration Instructions</h3>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General Information</TabsTrigger>
          <TabsTrigger value="dns">DNS Setup</TabsTrigger>
          <TabsTrigger value="ssl">SSL Certificates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-green-400" />
                About Domain Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                When you register a domain, you're securing a unique web address for your project.
                Here are some important things to know:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                  <span>All domains are registered under the <strong>.com.channel</strong> TLD.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                  <span>Domain registration is instant and doesn't require any verification.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                  <span>You can manage your domains from the Dashboard after registration.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-green-400" />
                DNS Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                After registering your domain, you can configure DNS records to point to your services:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                  <span>Create <strong>A records</strong> to point your domain to an IP address.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                  <span>Use <strong>CNAME records</strong> to create aliases to other domains.</span>
                </li>
                
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ssl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-green-400" />
                SSL Certificates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Secure your domain with SSL certificates:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                  <span>Free SSL certificates are available for all registered domains.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                  <span>Certificates are automatically renewed before expiration.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                  <span>HTTPS encryption keeps your visitors' data secure.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default DomainInstructions;