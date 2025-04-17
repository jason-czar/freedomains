
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Info } from "lucide-react";

const DomainInstructions: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Domain Setup Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="dns-setup">DNS Setup</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="getting-started">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-500/20 p-2 rounded-full">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Register your domain</h3>
                  <p className="text-muted-foreground">Your domain has been successfully registered in our system.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-amber-500/20 p-2 rounded-full">
                  <Info className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Set up DNS records</h3>
                  <p className="text-muted-foreground">Configure your DNS settings to point to our servers.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-amber-500/20 p-2 rounded-full">
                  <Info className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Verify your domain</h3>
                  <p className="text-muted-foreground">Complete the verification process to activate your domain.</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="dns-setup">
            <div className="space-y-4">
              <p>To configure your DNS settings, add the following records to your domain provider's DNS settings:</p>
              
              <div className="bg-black/20 p-4 rounded-lg font-mono text-sm">
                <p>A Record: <span className="text-green-400">@</span> → <span className="text-amber-400">192.168.1.1</span></p>
                <p>CNAME Record: <span className="text-green-400">www</span> → <span className="text-amber-400">@</span></p>
                <p>MX Record: <span className="text-green-400">@</span> → <span className="text-amber-400">mail.example.com</span></p>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-400 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  DNS changes can take 24-48 hours to fully propagate across the internet.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="verification">
            <div className="space-y-4">
              <p>To verify domain ownership, use one of the following methods:</p>
              
              <div className="space-y-3">
                <div className="border border-gray-800 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Method 1: DNS Verification</h3>
                  <p className="mb-2">Add this TXT record to your DNS settings:</p>
                  <code className="bg-black/30 p-2 rounded block">
                    TXT Record: _verify → verification-code-12345
                  </code>
                </div>
                
                <div className="border border-gray-800 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Method 2: File Verification</h3>
                  <p className="mb-2">Upload a verification file to your website:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Download the verification file</li>
                    <li>Upload to your web server root directory</li>
                    <li>Verify the file is accessible at: yourwebsite.com/verify.html</li>
                  </ol>
                </div>
              </div>
              
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
                Verify Domain
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DomainInstructions;
