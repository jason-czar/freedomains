
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { DNSRecord } from "../dns/dns-record-table";
import RecordsTabContent from "../dns/RecordsTabContent";
import AddRecordTabContent from "../dns/AddRecordTabContent";
import NameserversTabContent from "../dns/NameserversTabContent";
import ForwardingTabContent from "../dns/ForwardingTabContent";
import { DomainSettings, DNSManagerProps } from "@/types/domain-types";

const DNSRecordManager: React.FC<DNSManagerProps> = ({ 
  domainId, 
  subdomain, 
  domainSuffix,
  onRefresh
}) => {
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("records");
  const [adding, setAdding] = useState(false);
  const [nameservers, setNameservers] = useState<string[]>(["ns1.example.com", "ns2.example.com"]);
  const [forwardingUrl, setForwardingUrl] = useState("");
  const [forwardingType, setForwardingType] = useState("301");
  
  const fullDomain = `${subdomain}.${domainSuffix}`;
  
  useEffect(() => {
    fetchRecords();
    fetchDomainSettings();
  }, [subdomain, domainSuffix]);
  
  const fetchDomainSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("domains")
        .select("settings")
        .eq("id", domainId)
        .single();
      
      if (error) throw error;
      
      // Parse settings with proper type checking
      const settings = data?.settings as DomainSettings | null;
      
      if (settings?.nameservers && Array.isArray(settings.nameservers)) {
        setNameservers(settings.nameservers);
      }
      
      if (settings?.forwarding && typeof settings.forwarding === 'object') {
        setForwardingUrl(settings.forwarding.url || "");
        setForwardingType(settings.forwarding.type || "301");
      }
    } catch (error: any) {
      console.error("Error fetching domain settings:", error);
    }
  };
  
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("domain-dns", {
        body: {
          action: "list_records",
          subdomain,
          domain: domainSuffix
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        // Filter and process records to make them more readable
        const processedRecords = (data.records || []).map((record: any) => ({
          ...record,
          // Ensure we display formatted names for readability
          name: record.name
        }));
        
        setRecords(processedRecords);
        
        // Update the domain settings to mark DNS as active if records exist
        if (processedRecords.length > 0) {
          await supabase
            .from("domains")
            .update({
              settings: {
                domain_suffix: domainSuffix,
                dns_active: true,
                dns_records: processedRecords
              }
            })
            .eq("id", domainId);
        }
      } else {
        throw new Error("Failed to fetch DNS records");
      }
    } catch (error: any) {
      console.error("Error fetching DNS records:", error);
      toast.error("Failed to load DNS records");
    } finally {
      setLoading(false);
    }
  };
  
  const refreshRecords = async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
    if (onRefresh) onRefresh();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">DNS Management for {fullDomain}</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={refreshRecords}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="records">DNS Records</TabsTrigger>
          <TabsTrigger value="add">Add Record</TabsTrigger>
          <TabsTrigger value="nameservers">Nameservers</TabsTrigger>
          <TabsTrigger value="forwarding">Forwarding</TabsTrigger>
        </TabsList>
        
        <TabsContent value="records">
          <RecordsTabContent 
            records={records}
            loading={loading}
            refreshing={refreshing}
            fullDomain={fullDomain}
            subdomain={subdomain}
            domainSuffix={domainSuffix}
            onRefresh={refreshRecords}
          />
        </TabsContent>
        
        <TabsContent value="add">
          <AddRecordTabContent 
            fullDomain={fullDomain}
            subdomain={subdomain}
            domainSuffix={domainSuffix}
            adding={adding}
            setAdding={setAdding}
            existingRecords={records}
            onRecordAdded={refreshRecords}
            setActiveTab={setActiveTab}
            domainId={domainId}
          />
        </TabsContent>
        
        <TabsContent value="nameservers">
          <NameserversTabContent
            domainId={domainId}
            subdomain={subdomain}
            domainSuffix={domainSuffix}
            nameservers={nameservers}
            records={records}
            onNameserversUpdated={refreshRecords}
            setActiveTab={setActiveTab}
          />
        </TabsContent>
        
        <TabsContent value="forwarding">
          <ForwardingTabContent
            domainId={domainId}
            subdomain={subdomain}
            domainSuffix={domainSuffix}
            forwardingUrl={forwardingUrl}
            forwardingType={forwardingType}
            records={records}
            onForwardingUpdated={refreshRecords}
            setActiveTab={setActiveTab}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DNSRecordManager;
