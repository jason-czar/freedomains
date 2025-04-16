
import React, { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import DNSRecordTable from "./dns-record-table";
import DNSEmptyState from "./dns-empty-state";
import DNSLoadingState from "./dns-loading-state";
import { DNSRecord } from "./dns-record-table";
import { supabase } from "@/integrations/supabase/client";

interface RecordsTabContentProps {
  records: DNSRecord[];
  loading: boolean;
  refreshing: boolean;
  fullDomain: string;
  subdomain: string;
  domainSuffix: string;
  onRefresh: () => void;
}

const RecordsTabContent: React.FC<RecordsTabContentProps> = ({
  records,
  loading,
  refreshing,
  fullDomain,
  subdomain,
  domainSuffix,
  onRefresh
}) => {
  const [deleting, setDeleting] = useState<string | null>(null);

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
      
      onRefresh();
    } catch (error: any) {
      console.error("Error deleting DNS record:", error);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
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
    </div>
  );
};

export default RecordsTabContent;
