
import React from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AddDNSRecordForm from "./add-dns-record-form";
import { DNSRecord } from "@/types/domain-types";

interface AddRecordTabContentProps {
  subdomain: string;
  domainSuffix: string;
  fullDomain: string;
  adding: boolean;
  setAdding: (adding: boolean) => void;
  existingRecords: DNSRecord[];
  onRecordAdded: () => void;
  setActiveTab: (tab: string) => void;
}

const AddRecordTabContent: React.FC<AddRecordTabContentProps> = ({
  subdomain,
  domainSuffix,
  fullDomain,
  adding,
  setAdding,
  existingRecords,
  onRecordAdded,
  setActiveTab
}) => {
  const handleAddRecord = async (newRecord: DNSRecord) => {
    try {
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
      
      // Refresh records and switch back to records tab
      onRecordAdded();
      setActiveTab("records");
    } catch (error: any) {
      console.error("Error adding DNS record:", error);
      toast.error(`Failed to add DNS record: ${error.message}`);
    } finally {
      setAdding(false);
    }
  };

  return (
    <AddDNSRecordForm 
      fullDomain={fullDomain}
      adding={adding}
      onAddRecord={handleAddRecord}
      existingRecords={existingRecords}
    />
  );
};

export default AddRecordTabContent;
