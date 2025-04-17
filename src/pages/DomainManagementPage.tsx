
import { useState, useEffect } from "react";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DNSRecordManager from "@/components/ui/dns-record-manager";
import DomainRegistrationForm from "@/components/domain/DomainRegistrationForm";
import DomainList from "@/components/domain/DomainList";
import DomainInstructions from "@/components/domain/DomainInstructions";

const DomainManagementPage = () => {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dnsModalOpen, setDnsModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [checkingDns, setCheckingDns] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchDomains();
  }, [user]);

  const checkDnsStatus = async (domainList: any[]) => {
    // Don't trigger multiple checks in parallel
    if (checkingDns) return;
    
    setCheckingDns(true);
    
    // First update UI with existing data, then check DNS status in background
    const domainsToCheck = [...domainList].filter(domain => 
      !domain.settings?.dns_active && !domain.settings?.dns_check_skipped
    );
    
    if (domainsToCheck.length === 0) {
      setCheckingDns(false);
      return;
    }
    
    try {
      for (const domain of domainsToCheck) {
        try {
          const { data, error } = await supabase.functions.invoke("domain-dns", {
            body: {
              action: "list_records",
              subdomain: domain.subdomain,
              domain: domain.settings?.domain_suffix || "com.channel"
            }
          });
          
          if (error) {
            console.error(`Error checking DNS for ${domain.subdomain}:`, error);
            
            // Mark as checked to avoid repeated failures
            await supabase
              .from("domains")
              .update({
                settings: {
                  ...domain.settings,
                  dns_check_skipped: true
                }
              })
              .eq("id", domain.id);
              
            continue;
          }
          
          if (data.success && data.records && data.records.length > 0) {
            // Update domain settings to mark DNS as active
            const { error: updateError } = await supabase
              .from("domains")
              .update({
                settings: {
                  ...domain.settings,
                  dns_active: true,
                  dns_records: data.records
                }
              })
              .eq("id", domain.id);
              
            if (updateError) {
              console.error(`Error updating DNS status for ${domain.subdomain}:`, updateError);
            }
          }
        } catch (err) {
          console.error(`Error in DNS check for ${domain.subdomain}:`, err);
        }
      }
    } finally {
      setCheckingDns(false);
      // Refetch domains with updated DNS status
      fetchDomains();
    }
  };

  const fetchDomains = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("domains")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setDomains(data || []);
      setLoading(false);
      
      // Check DNS status for all domains after UI is updated
      if (data && data.length > 0) {
        // Use setTimeout to allow the UI to update first
        setTimeout(() => checkDnsStatus(data || []), 100);
      }
    } catch (error: any) {
      console.error("Error fetching domains:", error.message);
      toast.error("Failed to load domains");
      setLoading(false);
    }
  };

  const openDnsManager = (domain: any) => {
    setSelectedDomain(domain);
    setDnsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-clay-base/30 py-10">
        <div className="clay-container">
          <div className="clay-card mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">Domain Management</h2>
            </div>
            
            <DomainRegistrationForm fetchDomains={fetchDomains} />
            
            <DomainList 
              domains={domains}
              loading={loading}
              fetchDomains={fetchDomains}
              openDnsManager={openDnsManager}
            />
            
            <DomainInstructions />
          </div>
        </div>
      </main>
      
      {/* DNS Management Modal */}
      <Dialog open={dnsModalOpen} onOpenChange={setDnsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>DNS Management</DialogTitle>
          </DialogHeader>
          
          {selectedDomain && (
            <DNSRecordManager 
              domainId={selectedDomain.id}
              subdomain={selectedDomain.subdomain}
              domainSuffix={selectedDomain.settings?.domain_suffix || "com.channel"}
              onRefresh={fetchDomains}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default DomainManagementPage;
