
import React from "react";
import { Check } from "lucide-react";

const emailFeatures = [
  "Professional email addresses on your domain",
  "5 mailboxes included",
  "25GB storage per mailbox",
  "Webmail access",
  "Mobile app access",
  "IMAP/POP support",
  "Spam and virus protection"
] as const;

const EmailFeaturesList = () => {
  return (
    <div className="bg-indigo-900/20 rounded-lg p-5 mb-6">
      <h4 className="text-lg font-medium text-white mb-3">Email Service Features</h4>
      <ul className="space-y-2">
        {emailFeatures.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="text-indigo-400 h-5 w-5 mt-0.5 mr-2 shrink-0" />
            <div className="text-gray-300">{feature}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmailFeaturesList;
