
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Mail, Check } from "lucide-react";

interface EmailAddOnOptionProps {
  includeEmail: boolean;
  setIncludeEmail: (include: boolean) => void;
  domain: string;
}

const EmailAddOnOption: React.FC<EmailAddOnOptionProps> = ({
  includeEmail,
  setIncludeEmail,
  domain
}) => {
  return (
    <div className="mt-6 p-4 bg-indigo-900/30 rounded-xl border border-indigo-500/20 flex items-center justify-between">
      <div className="flex items-center">
        <div className="bg-indigo-800/50 p-2 rounded-lg mr-3">
          <Mail className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-white font-medium">Email Service (Premium)</h3>
          <p className="text-gray-400 text-sm">
            Add email addresses like you@{domain}
          </p>
          <div className="mt-1 flex items-center">
            <span className="text-indigo-400 font-bold">$4.99</span>
            <span className="text-gray-500 text-sm ml-1">/month</span>
            <span className="ml-2 px-2 py-0.5 bg-indigo-700/50 rounded-full text-xs text-indigo-300">Optional Add-on</span>
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <Switch
          checked={includeEmail}
          onCheckedChange={setIncludeEmail}
          className="data-[state=checked]:bg-indigo-600"
        />
      </div>

      {includeEmail && (
        <div className="absolute -bottom-14 left-0 right-0 bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/10 text-sm text-gray-300">
          <div className="flex items-start">
            <Check className="h-4 w-4 text-indigo-400 mt-0.5 mr-2 flex-shrink-0" />
            <p>
              Email service will be activated immediately at $4.99/month using Zoho Mail.
              You'll be able to create up to 5 email addresses on your domain.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailAddOnOption;
