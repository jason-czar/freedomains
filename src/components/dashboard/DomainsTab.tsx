import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Edit, Globe, Trash2, FileText, AlertCircle, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DomainsTabProps {
  domains: any[];
  loading: boolean;
  fetchDomains: () => Promise<void>;
  setSelectedDomain: (id: string) => void;
  setActiveTab: (tab: string) => void;
  openDnsManager: (domain: any) => void;
}

const DomainsTab: React.FC<DomainsTabProps> = ({
  domains,
  loading,
  fetchDomains,
  setSelectedDomain,
  setActiveTab,
  openDnsManager
}) => {
  const navigate = useNavigate();
  
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

  return (
    <div>
      <div className="clay-card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Your Domains</h2>
          <Button className="clay-button-primary" onClick={() => navigate("/domains")}>
            <PlusCircle className="h-5 w-5 mr-2" />
            Register New Domain
          </Button>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Input
              className="clay-input pl-10"
              placeholder="Search domains..."
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : domains.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">You don't have any domains registered yet.</p>
            <Button 
              variant="link" 
              className="text-indigo-600"
              onClick={() => navigate("/domains")}
            >
              Register your first domain
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 text-left font-semibold text-gray-600">Domain</th>
                  <th className="py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="py-3 text-left font-semibold text-gray-600">SSL</th>
                  <th className="py-3 text-left font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain) => (
                  <tr key={domain.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 font-medium">
                      <div className="flex items-center">
                        {domain.subdomain}.{domain.settings?.domain_suffix || "com.channel"}
                        {domain.settings?.dns_record_id ? (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            DNS Active
                          </span>
                        ) : (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" /> 
                            DNS Issue
                          </span>
                        )}
                      </div>
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
                      <Shield className="h-5 w-5 text-green-500" />
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
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="clay-card">
          <h3 className="font-semibold text-lg mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="clay-card bg-clay-lavender/40">
              <div className="text-2xl font-bold">{domains.length}</div>
              <div className="text-gray-600">Total Domains</div>
            </div>
            <div className="clay-card bg-clay-mint/40">
              <div className="text-2xl font-bold">2,096</div>
              <div className="text-gray-600">Total Traffic</div>
            </div>
            <div className="clay-card bg-clay-blue/40">
              <div className="text-2xl font-bold">{domains.length}</div>
              <div className="text-gray-600">SSL Certificates</div>
            </div>
            <div className="clay-card bg-clay-peach/40">
              <div className="text-2xl font-bold">
                {domains.filter(d => !d.is_active).length}
              </div>
              <div className="text-gray-600">Inactive</div>
            </div>
          </div>
        </div>
        
        <div className="clay-card">
          <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
          {domains.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {domains.slice(0, 4).map((domain, index) => (
                <div key={index} className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-clay-lavender/40 flex-shrink-0 flex items-center justify-center mr-3">
                    <FileText className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">Domain registered</p>
                    <p className="text-sm text-gray-600">
                      {domain.subdomain}.com.channel • {new Date(domain.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DomainsTab;
