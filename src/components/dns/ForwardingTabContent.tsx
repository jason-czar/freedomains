
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DomainSettings } from "@/types/domain-types";

interface ForwardingTabContentProps {
  domainId: string;
  subdomain: string;
  domainSuffix: string;
  forwardingUrl: string;
  forwardingType: string;
  records: any[];
  onForwardingUpdated: () => void;
  setActiveTab: (tab: string) => void;
}

const ForwardingTabContent: React.FC<ForwardingTabContentProps> = ({
  domainId,
  subdomain,
  domainSuffix,
  forwardingUrl: initialUrl,
  forwardingType: initialType,
  records,
  onForwardingUpdated,
  setActiveTab
}) => {
  const [forwardingUrl, setForwardingUrl] = useState(initialUrl);
  const [forwardingType, setForwardingType] = useState(initialType);
  const [updatingForwarding, setUpdatingForwarding] = useState(false);

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
      
      // Update domain settings in database
      const settingsUpdate: Record<string, any> = {
        domain_suffix: domainSuffix,
        forwarding: {
          url: forwardingUrl.trim(),
          type: forwardingType
        }
      };
      
      const { error: updateError } = await supabase
        .from("domains")
        .update({
          settings: settingsUpdate
        })
        .eq("id", domainId);
      
      if (updateError) throw updateError;
      
      toast.success("Forwarding settings updated successfully");
      onForwardingUpdated();
      setActiveTab("records");
    } catch (error: any) {
      console.error("Error updating forwarding settings:", error);
      toast.error("Failed to update forwarding settings");
    } finally {
      setUpdatingForwarding(false);
    }
  };

  return (
    <>
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
    </>
  );
};

export default ForwardingTabContent;
