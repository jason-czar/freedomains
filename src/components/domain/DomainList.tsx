
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, Server } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Domain {
  id: string;
  subdomain: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  settings: {
    domain_suffix?: string;
    delegated?: boolean;
    nameservers?: string[];
  };
}

interface DomainListProps {
  domains: Domain[];
  loading: boolean;
  fetchDomains: () => Promise<void>;
  openDnsManager: (domain: Domain) => void;
}

const DomainList: React.FC<DomainListProps> = ({
  domains,
  loading,
  fetchDomains,
  openDnsManager
}) => {
  const navigate = useNavigate();

  const getDomainDisplay = (domain: Domain) => {
    const suffix = domain.settings?.domain_suffix || "com.channel";
    return `${domain.subdomain}.${suffix}`;
  };

  const handleDeleteDomain = async (domainId: string, subdomain: string, domainSuffix: string = "com.channel") => {
    const confirmed = window.confirm("Are you sure you want to delete this domain? This action cannot be undone.");
    
    if (!confirmed) return;
    
    try {
      // Delete from Cloudflare first
      const { error: cfError } = await supabase.functions.invoke("domain-dns", {
        body: { 
          action: "delete", 
          subdomain: subdomain,
          domain: domainSuffix
        }
      });
      
      if (cfError) {
        console.error("Error deleting Cloudflare DNS record:", cfError);
        // Continue with database deletion even if Cloudflare deletion fails
      }
      
      // Delete from database
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

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Your Domains</h3>
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : domains.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">You don't have any domains registered yet.</p>
          <p className="text-gray-500 mt-1">Register your first domain above!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 text-left font-semibold text-gray-600">Domain</th>
                <th className="py-3 text-left font-semibold text-gray-600">Type</th>
                <th className="py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="py-3 text-left font-semibold text-gray-600">Registered On</th>
                <th className="py-3 text-left font-semibold text-gray-600">Expires On</th>
                <th className="py-3 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((domain) => (
                <tr key={domain.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 font-medium">{getDomainDisplay(domain)}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DomainList;
