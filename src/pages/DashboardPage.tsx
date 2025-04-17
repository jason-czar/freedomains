import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import DNSRecordManager from "@/components/ui/dns-record-manager";

// Import dashboard components
import DomainsTab from "@/components/dashboard/DomainsTab";
import AnalyticsTab from "@/components/dashboard/AnalyticsTab";
import BillingTab from "@/components/dashboard/BillingTab";
import SettingsTab from "@/components/dashboard/SettingsTab";

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("domains");
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [dnsModalOpen, setDnsModalOpen] = useState(false);
  const [selectedDomainForDNS, setSelectedDomainForDNS] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchDomains();
    }
    const domainId = searchParams.get('domain');
    if (domainId) {
      navigate(`/landing-page-builder/${domainId}`);
    }
  }, [user, searchParams]);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.from("domains").select("*").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      setDomains(data || []);
    } catch (error: any) {
      console.error("Error fetching domains:", error.message);
      toast.error("Failed to load domains");
    } finally {
      setLoading(false);
    }
  };

  const openDnsManager = (domain: any) => {
    setSelectedDomainForDNS(domain);
    setDnsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-clay-base/30 py-10">
        <div className="clay-container">
          <div className="flex-1">
            {activeTab === "domains" && (
              <DomainsTab 
                domains={domains} 
                loading={loading} 
                fetchDomains={fetchDomains} 
                setSelectedDomain={setSelectedDomain} 
                setActiveTab={setActiveTab} 
                openDnsManager={openDnsManager}
              />
            )}
            
            {activeTab === "analytics" && <AnalyticsTab />}
            
            {activeTab === "billing" && <BillingTab />}
            
            {activeTab === "settings" && <SettingsTab />}
          </div>
        </div>
      </main>
      
      <Dialog open={dnsModalOpen} onOpenChange={setDnsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader></DialogHeader>
          {selectedDomainForDNS && (
            <DNSRecordManager 
              domainId={selectedDomainForDNS.id}
              subdomain={selectedDomainForDNS.subdomain}
              domainSuffix={selectedDomainForDNS.settings?.domain_suffix || "com.channel"}
              onRefresh={fetchDomains}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default DashboardPage;
