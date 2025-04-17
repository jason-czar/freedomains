
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Info } from "lucide-react";

const DomainInstructions: React.FC = () => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Info className="h-5 w-5 mr-2 text-blue-500" />
          Domain Setup Instructions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dns">
          <TabsList className="mb-4">
            <TabsTrigger value="dns">DNS Records</TabsTrigger>
            <TabsTrigger value="nameservers">Nameservers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dns">
            <div className="space-y-4">
              <div className="text-sm">
                <p className="font-medium mb-2">To setup your domain with DNS records:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Log in to your domain registrar (where you purchased your domain)</li>
                  <li>Navigate to the DNS management section</li>
                  <li>Add the following DNS records:</li>
                </ol>
                <div className="mt-3 pl-5">
                  <ul className="space-y-1">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span className="font-medium">A Record:</span> 
                      <code className="bg-gray-100 px-2 py-1 ml-2 rounded">@ → 76.76.21.21</code>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span className="font-medium">CNAME Record:</span> 
                      <code className="bg-gray-100 px-2 py-1 ml-2 rounded">www → yourdomain.com</code>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="text-sm bg-blue-50 p-3 rounded">
                <p className="font-medium text-blue-700">Note:</p>
                <p className="text-blue-600">DNS changes may take up to 48 hours to propagate globally.</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="nameservers">
            <div className="space-y-4">
              <div className="text-sm">
                <p className="font-medium mb-2">To use our nameservers:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Log in to your domain registrar (where you purchased your domain)</li>
                  <li>Navigate to the nameserver settings</li>
                  <li>Replace the existing nameservers with:</li>
                </ol>
                <div className="mt-3 pl-5">
                  <ul className="space-y-1">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <code className="bg-gray-100 px-2 py-1 rounded">ns1.com.channel</code>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <code className="bg-gray-100 px-2 py-1 rounded">ns2.com.channel</code>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="text-sm bg-blue-50 p-3 rounded">
                <p className="font-medium text-blue-700">Note:</p>
                <p className="text-blue-600">Using our nameservers gives us full control over your domain's DNS settings.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DomainInstructions;
