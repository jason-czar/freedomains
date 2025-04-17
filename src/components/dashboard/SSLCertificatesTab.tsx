
import React from "react";
import { Shield } from "lucide-react";

const SSLCertificatesTab: React.FC = () => {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      <h2 className="text-2xl font-bold mb-6 text-white">SSL Certificates</h2>
      <p className="text-gray-300 mb-6">
        Manage SSL certificates for your domains. All certificates are automatically renewed 30 days before expiration.
      </p>
      
      <div className="bg-emerald-900/30 rounded-xl p-4 text-center py-12 border border-emerald-500/20">
        <Shield className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-white">All Your Domains Are Secured</h3>
        <p className="text-gray-300 max-w-md mx-auto">
          Your domains are protected with Let's Encrypt SSL certificates that automatically renew.
        </p>
      </div>
    </div>
  );
};

export default SSLCertificatesTab;
