
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Domain } from "@/types/domain-types";
import DomainRow from "./DomainRow";
import DomainTableHeader from "./DomainTableHeader";

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
            <DomainTableHeader />
            <tbody>
              {domains.map((domain) => (
                <DomainRow
                  key={domain.id}
                  domain={domain}
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

export default DomainList;
