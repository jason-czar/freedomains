
import React from "react";
import { Shield } from "lucide-react";

const SSLCertificatesTab: React.FC = () => {
  return (
    <div className="clay-card">
      <h2 className="text-2xl font-bold mb-6">SSL Certificates</h2>
      <p className="text-gray-600 mb-6">
        Manage SSL certificates for your domains. All certificates are automatically renewed 30 days before expiration.
      </p>
      
      <div className="bg-clay-mint/30 rounded-clay p-4 text-center py-12">
        <Shield className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">All Your Domains Are Secured</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Your domains are protected with Let's Encrypt SSL certificates that automatically renew.
        </p>
      </div>
    </div>
  );
};

export default SSLCertificatesTab;
