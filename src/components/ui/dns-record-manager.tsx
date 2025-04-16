
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import DNSRecordTable, { DNSRecord } from "../dns/dns-record-table";
import AddDNSRecordForm from "../dns/add-dns-record-form";
import DNSEmptyState from "../dns/dns-empty-state";
import DNSLoadingState from "../dns/dns-loading-state";

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
  
  const fullDomain = `${subdomain}.${domainSuffix}`;
  
  useEffect(() => {
    fetchRecords();
  }, [subdomain, domainSuffix]);
  
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
        setRecords(data.records || []);
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
    if (!newRecord.name) {
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
    
    setAdding(true);
    try {
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
        throw new Error(data.results?.[0]?.errors?.[0]?.message || "Failed to add DNS record");
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
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="records">DNS Records</TabsTrigger>
          <TabsTrigger value="add">Add Record</TabsTrigger>
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
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DNSRecordManager;
