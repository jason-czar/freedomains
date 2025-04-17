import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DomainTableRow from "./DomainTableRow";

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

  return (
    <div className="min-h-[200px]">
      {loading ? (
        <div className="flex justify-center items-center h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : domains.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg min-h-[200px] flex items-center justify-center">
          <div>
            <p className="text-gray-500">You don't have any domains registered yet.</p>
            <Button 
              variant="link" 
              className="text-indigo-600"
              onClick={() => window.location.href = "/domains"}
            >
              Register your first domain
            </Button>
          </div>
        </div>
      ) : (
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
                <DomainTableRow
                  key={domain.id}
                  domain={domain}
                  setSelectedDomain={setSelectedDomain}
                  setActiveTab={setActiveTab}
                  openDnsManager={openDnsManager}
                  handleDeleteDomain={handleDeleteDomain}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DomainTable;
