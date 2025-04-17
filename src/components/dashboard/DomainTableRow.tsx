
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
    <tr className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors">
      <td className="py-3 font-medium text-gray-300">
        {domain.subdomain}.{domain.settings?.domain_suffix || "com.channel"}
      </td>
      <td className="py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          domain.is_active 
            ? "bg-emerald-900/30 text-emerald-400 border border-emerald-500/20" 
            : "bg-yellow-900/30 text-yellow-400 border border-yellow-500/20"
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
            className="border-blue-500/20 text-blue-400 hover:border-blue-500/40 hover:bg-blue-900/20"
          >
            <Edit className="h-4 w-4 mr-1" />
            Manage
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDnsManager(domain)}
            className="border-indigo-500/20 text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-900/20"
          >
            <Globe className="h-4 w-4 mr-1" />
            DNS
          </Button>
          <button 
            className="text-gray-400 hover:text-rose-400 transition-colors"
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
