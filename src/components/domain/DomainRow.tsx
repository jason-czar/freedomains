
import React from "react";
import { Button } from "@/components/ui/button";
import { Globe, Server } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Domain } from "@/types/domain-types";

interface DomainRowProps {
  domain: Domain;
  openDnsManager: (domain: Domain) => void;
  handleDeleteDomain: (domainId: string, subdomain: string, domainSuffix?: string) => void;
}

const DomainRow: React.FC<DomainRowProps> = ({
  domain,
  openDnsManager,
  handleDeleteDomain
}) => {
  const navigate = useNavigate();

  const getDomainDisplay = () => {
    const suffix = domain.settings?.domain_suffix || "com.channel";
    return `${domain.subdomain}.${suffix}`;
  };

  const isDnsActive = () => {
    // Consider DNS active if explicitly marked as active in the settings
    if (domain.settings?.dns_active === true) {
      return true;
    }
    
    // Check if there are DNS records in the settings
    if (domain.settings?.dns_records && domain.settings.dns_records.length > 0) {
      return true;
    }
    
    return false;
  };

  return (
    <tr key={domain.id} className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-4 font-medium">
        <div className="flex items-center">
          {getDomainDisplay()}
          {isDnsActive() ? (
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              DNS Active
            </span>
          ) : (
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex items-center">
              DNS Issue
            </span>
          )}
        </div>
      </td>
      <td className="py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          domain.settings?.delegated 
            ? "bg-purple-100 text-purple-800" 
            : "bg-blue-100 text-blue-800"
        }`}>
          {domain.settings?.delegated ? (
            <><Server className="h-3 w-3 mr-1" /> Delegated</>
          ) : (
            "Standard"
          )}
        </span>
      </td>
      <td className="py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          domain.is_active 
            ? "bg-green-100 text-green-800" 
            : "bg-yellow-100 text-yellow-800"
        }`}>
          {domain.is_active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="py-4">{new Date(domain.created_at).toLocaleDateString()}</td>
      <td className="py-4">
        {domain.expires_at 
          ? new Date(domain.expires_at).toLocaleDateString() 
          : "Never"}
      </td>
      <td className="py-4">
        <div className="flex gap-2">
          <Button
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/dashboard?domain=${domain.id}`)}
          >
            Manage
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDnsManager(domain)}
          >
            <Globe className="h-4 w-4 mr-1" />
            DNS
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-800"
            onClick={() => handleDeleteDomain(domain.id, domain.subdomain, domain.settings?.domain_suffix)}
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default DomainRow;
