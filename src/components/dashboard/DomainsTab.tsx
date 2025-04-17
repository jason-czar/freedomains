
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DomainSearch from "./DomainSearch";
import DomainTable from "./DomainTable";
import DomainQuickStats from "./DomainQuickStats";
import DomainRecentActivity from "./DomainRecentActivity";

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
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredDomains = domains.filter(domain => 
    domain.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        
        <DomainSearch onSearch={setSearchQuery} />
        
        <DomainTable 
          domains={filteredDomains}
          loading={loading}
          fetchDomains={fetchDomains}
          setSelectedDomain={setSelectedDomain}
          setActiveTab={setActiveTab}
          openDnsManager={openDnsManager}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:grid-flow-row-dense md:grid-cols-2">
        <div className="md:col-span-2 lg:col-span-1">
          <DomainQuickStats domains={domains} />
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <DomainRecentActivity domains={domains} />
        </div>
      </div>
    </div>
  );
};

export default DomainsTab;
