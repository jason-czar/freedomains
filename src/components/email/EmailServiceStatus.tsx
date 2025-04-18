
import React from "react";
import { Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailServiceStatusProps {
  domainDisplay: string;
}

const EmailServiceStatus: React.FC<EmailServiceStatusProps> = ({ domainDisplay }) => {
  return (
    <div className="bg-indigo-900/30 rounded-xl p-6 border border-indigo-500/20">
      <div className="flex items-center space-x-4 mb-4">
        <div className="bg-indigo-800/50 p-3 rounded-full">
          <Mail className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Email Service is Active</h3>
          <p className="text-gray-400">You're currently being billed $4.99/month for email service.</p>
        </div>
      </div>
      
      <div className="mt-6 border-t border-indigo-800/50 pt-6">
        <h4 className="text-lg font-medium text-white mb-4">Email Management</h4>
        
        <div className="bg-black/40 rounded-lg p-4 mb-4">
          <h5 className="font-medium text-white mb-2">Login to Zoho Mail</h5>
          <p className="text-gray-400 mb-3">Manage your email accounts, create mailboxes, and access your email.</p>
          <Button variant="outline" className="border-indigo-500/30 text-indigo-400">
            Access Zoho Mail Control Panel
          </Button>
        </div>
        
        <div className="bg-black/40 rounded-lg p-4">
          <h5 className="font-medium text-white mb-2">DNS Records</h5>
          <p className="text-gray-400 mb-3">Your email DNS records have been set up automatically.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 p-3 rounded border border-gray-800/50">
              <div className="text-xs text-gray-500 mb-1">MX Record 1</div>
              <div className="text-gray-300 font-mono text-sm break-all">
                mx.zoho.com (Priority: 10)
              </div>
            </div>
            <div className="bg-gray-900/50 p-3 rounded border border-gray-800/50">
              <div className="text-xs text-gray-500 mb-1">MX Record 2</div>
              <div className="text-gray-300 font-mono text-sm break-all">
                mx2.zoho.com (Priority: 20)
              </div>
            </div>
            <div className="bg-gray-900/50 p-3 rounded border border-gray-800/50 md:col-span-2">
              <div className="text-xs text-gray-500 mb-1">SPF Record (TXT)</div>
              <div className="text-gray-300 font-mono text-sm break-all">
                v=spf1 include:zoho.com ~all
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailServiceStatus;
