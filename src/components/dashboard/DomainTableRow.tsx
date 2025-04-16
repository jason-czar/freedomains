
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Globe, Trash2 } from "lucide-react";

interface DomainTableRowProps {
  domain: any;
  setSelectedDomain: (id: string) => void;
  setActiveTab: (tab: string) => void;
  openDnsManager: (domain: any) => void;
  handleDeleteDomain: (domainId: string, subdomain: string) => void;
}

const DomainTableRow: React.FC<DomainTableRowProps> = ({
  domain,
  setSelectedDomain,
  setActiveTab,
  openDnsManager,
  handleDeleteDomain
}) => {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-3 font-medium">
        {domain.subdomain}.{domain.settings?.domain_suffix || "com.channel"}
      </td>
      <td className="py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          domain.is_active 
            ? "bg-green-100 text-green-800" 
            : "bg-yellow-100 text-yellow-800"
        }`}>
          {domain.is_active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="py-3">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedDomain(domain.id);
              setActiveTab("editor");
            }}
          >
            <Edit className="h-4 w-4 mr-1" />
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
          <button 
            className="text-gray-500 hover:text-red-600"
            onClick={() => handleDeleteDomain(domain.id, domain.subdomain)}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default DomainTableRow;
