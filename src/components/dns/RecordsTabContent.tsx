
import React, { useState } from "react";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
  const [vercelError, setVercelError] = useState<string | null>(null);

  // Check for Vercel verification records
  const hasVercelCname = records.some(r => r.type === "CNAME" && r.name.includes("_vercel"));
  const hasMainCname = records.some(r => r.type === "CNAME" && (r.name === fullDomain || r.name === `www.${fullDomain}`));
  const hasMainARecord = records.some(r => r.type === "A" && r.name === fullDomain);
  
  // Detect inconsistent proxy settings
  const inconsistentProxying = records.some(r => {
    if (r.type === "A" && r.name === fullDomain && r.proxied === false) return true;
    if (r.type === "CNAME" && r.name.includes("_vercel") && r.proxied === true) return true;
    if (r.type === "CNAME" && r.name === `www.${fullDomain}` && r.proxied === true) return true;
    return false;
  });

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
  
  const checkVercelVerification = async () => {
    try {
      setVercelError(null);
      const { data, error } = await supabase.functions.invoke("domain-dns", {
        body: {
          action: "check_vercel",
          subdomain,
          domain: domainSuffix
        }
      });
      
      if (error) {
        setVercelError(error.message);
        return;
      }
      
      if (!data.success || data.vercelStatus !== "active") {
        setVercelError(data.message || "Domain not verified with Vercel");
      }
      
    } catch (error: any) {
      setVercelError(error.message);
    }
  };

  return (
    <div className="space-y-4">
      {!loading && !hasVercelCname && records.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Vercel configuration missing</AlertTitle>
          <AlertDescription>
            This domain is missing the required _vercel CNAME record for Vercel verification.
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 bg-transparent"
              onClick={() => onRefresh()}
            >
              Fix Configuration
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {!loading && inconsistentProxying && (
        <Alert variant="warning" className="bg-amber-900/20 border-amber-700/50 text-amber-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Inconsistent proxy settings</AlertTitle>
          <AlertDescription>
            Some records have non-standard proxy settings which may affect performance or verification.
            Vercel CNAMEs should not be proxied, while A records should typically be proxied.
          </AlertDescription>
        </Alert>
      )}
      
      {!loading && !hasMainARecord && !hasMainCname && records.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Main domain record missing</AlertTitle>
          <AlertDescription>
            This domain is missing the main A record or CNAME record. Visitors won't be able to access your website.
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 bg-transparent"
              onClick={() => onRefresh()}
            >
              Fix Configuration
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {vercelError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Vercel verification error</AlertTitle>
          <AlertDescription>{vercelError}</AlertDescription>
        </Alert>
      )}
      
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
      
      {!loading && records.length > 0 && (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkVercelVerification}
            className="text-xs border-green-500/30 bg-black/40 text-green-400 hover:border-green-500/50 hover:bg-gray-900"
          >
            Check Vercel Verification
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecordsTabContent;
