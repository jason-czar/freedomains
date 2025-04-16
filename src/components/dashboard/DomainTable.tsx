
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Globe, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DomainTableProps {
  domains: any[];
  loading: boolean;
  fetchDomains: () => Promise<void>;
  setSelectedDomain: (id: string) => void;
  setActiveTab: (tab: string) => void;
  openDnsManager: (domain: any) => void;
}

const DomainTable: React.FC<DomainTableProps> = ({
  domains,
  loading,
  fetchDomains,
  setSelectedDomain,
  setActiveTab,
  openDnsManager
}) => {
  const handleDeleteDomain = async (domainId: string, subdomain: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this domain? This action cannot be undone.");
    
    if (!confirmed) return;
    
    try {
      const { error: cfError } = await supabase.functions.invoke("domain-dns", {
        body: { 
          action: "delete", 
          subdomain: subdomain 
        }
      });
      
      if (cfError) {
        console.error("Error deleting Cloudflare DNS record:", cfError);
      }
      
      const { error: dbError } = await supabase
        .from("domains")
        .delete()
        .eq("id", domainId);
      
      if (dbError) throw dbError;
      
      toast.success("Domain deleted successfully");
      fetchDomains();
    } catch (error: any) {
      console.error("Error deleting domain:", error.message);
      toast.error("Failed to delete domain");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">You don't have any domains registered yet.</p>
        <Button 
          variant="link" 
          className="text-indigo-600"
          onClick={() => window.location.href = "/domains"}
        >
          Register your first domain
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 text-left font-semibold text-gray-600">Domain</th>
            <th className="py-3 text-left font-semibold text-gray-600">Status</th>
            <th className="py-3 text-left font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {domains.map((domain) => (
            <tr key={domain.id} className="border-b border-gray-100 hover:bg-gray-50">
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DomainTable;
