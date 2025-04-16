
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, RefreshCw, Link, ArrowRightLeft, Server } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import DNSRecordTable, { DNSRecord } from "../dns/dns-record-table";
import AddDNSRecordForm from "../dns/add-dns-record-form";
import DNSEmptyState from "../dns/dns-empty-state";
import DNSLoadingState from "../dns/dns-loading-state";
import { NameserverManager } from "../domain/NameserverManager";

interface DomainSettings {
  domain_suffix?: string;
  nameservers?: string[];
  forwarding?: {
    url?: string;
    type?: string;
  };
}

interface DNSRecordManagerProps {
  domainId: string;
  subdomain: string;
  domainSuffix: string;
  onRefresh?: () => void;
}

const DNSRecordManager: React.FC<DNSRecordManagerProps> = ({ 
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
  const [deleting, setDeleting] = useState<string | null>(null);
  const [nameservers, setNameservers] = useState<string[]>(["ns1.example.com", "ns2.example.com"]);
  const [forwardingUrl, setForwardingUrl] = useState("");
  const [forwardingType, setForwardingType] = useState("301");
  const [updatingNameservers, setUpdatingNameservers] = useState(false);
  const [updatingForwarding, setUpdatingForwarding] = useState(false);
  
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
  
  const handleAddRecord = async (newRecord: DNSRecord) => {
    // Validate inputs
    if (!newRecord.name && newRecord.name !== '@') {
      toast.error("Please enter a record name");
      return;
    }
    
    if (!newRecord.content) {
      toast.error("Please enter record content");
      return;
    }
    
    // Special validation for MX records
    if (newRecord.type === "MX" && !newRecord.priority) {
      toast.error("MX records require a priority value");
      return;
    }
    
    try {
      // Check if there's a duplicate record already
      const existingRecord = records.find(r => 
        r.type === newRecord.type && 
        (r.name === newRecord.name || 
         (r.name === fullDomain && newRecord.name === '@'))
      );
      
      if (existingRecord && ['A', 'AAAA', 'CNAME'].includes(newRecord.type)) {
        toast.error(`A ${newRecord.type} record with that name already exists. Delete it first or use a different name.`);
        return;
      }
      
      setAdding(true);
      
      const { data, error } = await supabase.functions.invoke("domain-dns", {
        body: {
          action: "add_record",
          subdomain,
          domain: domainSuffix,
          records: [newRecord]
        }
      });
      
      if (error) throw error;
      
      if (!data.success) {
        const errorMessage = data.results?.[0]?.errors?.[0]?.message || "Failed to add DNS record";
        throw new Error(errorMessage);
      }
      
      toast.success("DNS record added successfully");
      
      // Refresh records
      refreshRecords();
      
      // Switch back to records tab
      setActiveTab("records");
    } catch (error: any) {
      console.error("Error adding DNS record:", error);
      toast.error(`Failed to add DNS record: ${error.message}`);
    } finally {
      setAdding(false);
    }
  };
  
  const handleDeleteRecord = async (recordId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this DNS record? This action cannot be undone.");
    
    if (!confirmed) return;
    
    setDeleting(recordId);
    try {
      const { data, error } = await supabase.functions.invoke("domain-dns", {
        body: {
          action: "delete_record",
          record_id: recordId
        }
      });
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error("Failed to delete DNS record");
      }
      
      toast.success("DNS record deleted successfully");
      refreshRecords();
    } catch (error: any) {
      console.error("Error deleting DNS record:", error);
      toast.error("Failed to delete DNS record");
    } finally {
      setDeleting(null);
    }
  };
  
  const handleUpdateNameservers = async () => {
    if (nameservers.filter(ns => ns.trim()).length < 2) {
      toast.error("You must provide at least 2 nameservers");
      return;
    }
    
    setUpdatingNameservers(true);
    try {
      // First, delete existing NS records
      const nsRecords = records.filter(r => r.type === "NS");
      for (const record of nsRecords) {
        if (record.id) {
          await supabase.functions.invoke("domain-dns", {
            body: {
              action: "delete_record",
              record_id: record.id
            }
          });
        }
      }
      
      // Add new NS records
      const validNameservers = nameservers.filter(ns => ns.trim());
      const { data, error } = await supabase.functions.invoke("domain-dns", {
        body: {
          action: "add_record",
          subdomain,
          domain: domainSuffix,
          records: validNameservers.map(ns => ({
            type: "NS",
            name: "@",
            content: ns.trim(),
            ttl: 3600,
            proxied: false
          }))
        }
      });
      
      if (error) throw error;
      
      // Update domain settings in database with proper typing
      const { error: updateError } = await supabase
        .from("domains")
        .update({
          settings: {
            domain_suffix: domainSuffix,
            nameservers: validNameservers
          } as DomainSettings
        })
        .eq("id", domainId);
      
      if (updateError) throw updateError;
      
      toast.success("Nameservers updated successfully");
      refreshRecords();
      setActiveTab("records");
    } catch (error: any) {
      console.error("Error updating nameservers:", error);
      toast.error("Failed to update nameservers");
    } finally {
      setUpdatingNameservers(false);
    }
  };
  
  const handleUpdateForwarding = async () => {
    if (!forwardingUrl.trim()) {
      toast.error("Please enter a forwarding URL");
      return;
    }
    
    setUpdatingForwarding(true);
    try {
      // First, check if there's an existing redirect record
      const redirectRecords = records.filter(r => r.type === "URL");
      
      // Delete existing redirect records
      for (const record of redirectRecords) {
        if (record.id) {
          await supabase.functions.invoke("domain-dns", {
            body: {
              action: "delete_record",
              record_id: record.id
            }
          });
        }
      }
      
      // Add new URL redirect record
      const { data, error } = await supabase.functions.invoke("domain-dns", {
        body: {
          action: "add_record",
          subdomain,
          domain: domainSuffix,
          records: [{
            type: "URL",
            name: "@",
            content: forwardingUrl.trim(),
            ttl: 1,
            proxied: true
          }]
        }
      });
      
      if (error) throw error;
      
      // Update domain settings in database with proper typing
      const { error: updateError } = await supabase
        .from("domains")
        .update({
          settings: {
            domain_suffix: domainSuffix,
            forwarding: {
              url: forwardingUrl.trim(),
              type: forwardingType
            }
          } as DomainSettings
        })
        .eq("id", domainId);
      
      if (updateError) throw updateError;
      
      toast.success("Forwarding settings updated successfully");
      refreshRecords();
      setActiveTab("records");
    } catch (error: any) {
      console.error("Error updating forwarding settings:", error);
      toast.error("Failed to update forwarding settings");
    } finally {
      setUpdatingForwarding(false);
    }
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
          {loading ? (
            <DNSLoadingState />
          ) : records.length === 0 ? (
            <DNSEmptyState />
          ) : (
            <DNSRecordTable 
              records={records}
              fullDomain={fullDomain}
              deleting={deleting}
              onDeleteRecord={handleDeleteRecord}
            />
          )}
        </TabsContent>
        
        <TabsContent value="add">
          <AddDNSRecordForm 
            fullDomain={fullDomain}
            adding={adding}
            onAddRecord={handleAddRecord}
            existingRecords={records}
          />
        </TabsContent>
        
        <TabsContent value="nameservers">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-blue-800">
              <strong>Nameserver Delegation:</strong> Configure custom nameservers to take full control 
              over all DNS records. You'll need your own DNS hosting service 
              (like Cloudflare, AWS Route53, etc).
            </p>
          </div>
          
          <NameserverManager 
            nameservers={nameservers}
            setNameservers={setNameservers}
          />
          
          <Button 
            onClick={handleUpdateNameservers}
            disabled={updatingNameservers || nameservers.filter(ns => ns.trim()).length < 2}
            className="mt-4"
          >
            {updatingNameservers ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating Nameservers
              </>
            ) : (
              <>
                <Server className="h-4 w-4 mr-2" />
                Update Nameservers
              </>
            )}
          </Button>
        </TabsContent>
        
        <TabsContent value="forwarding">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-blue-800">
              <strong>Domain Forwarding:</strong> Redirect this domain to another URL.
              This will replace any existing A or CNAME records.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination URL
              </label>
              <input 
                type="url"
                className="w-full p-2 border rounded"
                placeholder="https://example.com"
                value={forwardingUrl}
                onChange={(e) => setForwardingUrl(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Redirect Type
              </label>
              <select
                className="w-full p-2 border rounded"
                value={forwardingType}
                onChange={(e) => setForwardingType(e.target.value)}
              >
                <option value="301">Permanent (301)</option>
                <option value="302">Temporary (302)</option>
              </select>
            </div>
            
            <Button 
              onClick={handleUpdateForwarding}
              disabled={updatingForwarding || !forwardingUrl.trim()}
            >
              {updatingForwarding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating Forwarding
                </>
              ) : (
                <>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Update Forwarding
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DNSRecordManager;
