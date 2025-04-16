
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Server } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NameserverManager } from "../domain/NameserverManager";
import { DomainSettings } from "@/types/domain-types";

interface NameserversTabContentProps {
  domainId: string;
  subdomain: string;
  domainSuffix: string;
  nameservers: string[];
  records: any[];
  onNameserversUpdated: () => void;
  setActiveTab: (tab: string) => void;
}

const NameserversTabContent: React.FC<NameserversTabContentProps> = ({
  domainId,
  subdomain,
  domainSuffix,
  nameservers: initialNameservers,
  records,
  onNameserversUpdated,
  setActiveTab
}) => {
  const [nameservers, setNameservers] = useState<string[]>(initialNameservers);
  const [updatingNameservers, setUpdatingNameservers] = useState(false);

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
      
      // Update domain settings in database
      const settingsUpdate: Record<string, any> = {
        domain_suffix: domainSuffix,
        nameservers: validNameservers
      };
      
      const { error: updateError } = await supabase
        .from("domains")
        .update({
          settings: settingsUpdate
        })
        .eq("id", domainId);
      
      if (updateError) throw updateError;
      
      toast.success("Nameservers updated successfully");
      onNameserversUpdated();
      setActiveTab("records");
    } catch (error: any) {
      console.error("Error updating nameservers:", error);
      toast.error("Failed to update nameservers");
    } finally {
      setUpdatingNameservers(false);
    }
  };

  return (
    <>
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
    </>
  );
};

export default NameserversTabContent;
