
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AlertCircle, Check, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface DNSRecord {
  id?: string;
  type: string;
  name: string;
  content: string;
  ttl?: number;
  priority?: number;
  proxied?: boolean;
}

interface DNSRecordManagerProps {
  domainId: string;
  subdomain: string;
  domainSuffix: string;
  onRefresh?: () => void;
}

const DNS_RECORD_TYPES = [
  { value: "A", label: "A (IPv4 Address)" },
  { value: "AAAA", label: "AAAA (IPv6 Address)" },
  { value: "CNAME", label: "CNAME (Alias)" },
  { value: "MX", label: "MX (Mail Exchange)" },
  { value: "TXT", label: "TXT (Text)" },
  { value: "NS", label: "NS (Nameserver)" },
  { value: "SRV", label: "SRV (Service)" },
  { value: "CAA", label: "CAA (Certificate Authority)" },
];

const TTL_OPTIONS = [
  { value: 1, label: "Automatic" },
  { value: 60, label: "1 minute" },
  { value: 300, label: "5 minutes" },
  { value: 1800, label: "30 minutes" },
  { value: 3600, label: "1 hour" },
  { value: 7200, label: "2 hours" },
  { value: 18000, label: "5 hours" },
  { value: 43200, label: "12 hours" },
  { value: 86400, label: "1 day" },
];

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
  
  // New record form state
  const [newRecord, setNewRecord] = useState<DNSRecord>({
    type: "A",
    name: "",
    content: "",
    ttl: 1,
    proxied: true,
  });
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
  
  const handleAddRecord = async () => {
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
      
      // Reset form
      setNewRecord({
        type: "A",
        name: "",
        content: "",
        ttl: 1,
        proxied: true,
      });
      
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
  
  const getFormattedTTL = (ttl: number) => {
    if (ttl === 1) return "Automatic";
    if (ttl === 60) return "1 minute";
    if (ttl === 300) return "5 minutes";
    if (ttl === 1800) return "30 minutes";
    if (ttl === 3600) return "1 hour";
    if (ttl === 7200) return "2 hours";
    if (ttl === 18000) return "5 hours";
    if (ttl === 43200) return "12 hours";
    if (ttl === 86400) return "1 day";
    return `${ttl} seconds`;
  };
  
  const formatRecordName = (name: string) => {
    // If name exactly matches the full domain, show @ (root)
    if (name === fullDomain) {
      return "@";
    }
    
    // If name ends with the full domain, remove it to show subdomain
    if (name.endsWith(`.${fullDomain}`)) {
      return name.replace(`.${fullDomain}`, "");
    }
    
    return name;
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
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No DNS records found for this domain.</p>
              <p className="text-gray-500 mt-1">Add your first DNS record using the Add Record tab.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>TTL</TableHead>
                    <TableHead>Proxied</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.type}</TableCell>
                      <TableCell>{formatRecordName(record.name)}</TableCell>
                      <TableCell className="max-w-xs truncate">{record.content}</TableCell>
                      <TableCell>{getFormattedTTL(record.ttl || 1)}</TableCell>
                      <TableCell>
                        {record.proxied !== undefined ? (
                          record.proxied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            "—"
                          )
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecord(record.id || "")}
                          disabled={!record.id || deleting === record.id}
                        >
                          {deleting === record.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="add">
          <div className="space-y-4 border rounded-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Record Type
                </label>
                <Select 
                  value={newRecord.type} 
                  onValueChange={(value) => setNewRecord({...newRecord, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select record type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {DNS_RECORD_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <div className="flex">
                  <Input
                    placeholder={newRecord.type === "MX" ? "mail" : "www"}
                    value={newRecord.name}
                    onChange={(e) => setNewRecord({...newRecord, name: e.target.value})}
                  />
                  <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">
                    .{fullDomain}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use @ for root domain
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {newRecord.type === "MX" 
                    ? "Mail Server" 
                    : newRecord.type === "CNAME" 
                      ? "Points To" 
                      : newRecord.type === "TXT" 
                        ? "Text Value" 
                        : "Value"}
                </label>
                <Input
                  placeholder={
                    newRecord.type === "A" 
                      ? "192.0.2.1" 
                      : newRecord.type === "AAAA" 
                        ? "2001:db8::" 
                        : newRecord.type === "CNAME" 
                          ? "example.com" 
                          : newRecord.type === "MX" 
                            ? "mail.example.com" 
                            : ""
                  }
                  value={newRecord.content}
                  onChange={(e) => setNewRecord({...newRecord, content: e.target.value})}
                />
              </div>
              
              {newRecord.type === "MX" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={newRecord.priority || ""}
                    onChange={(e) => setNewRecord({...newRecord, priority: parseInt(e.target.value) || 0})}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TTL (Time to Live)
                </label>
                <Select 
                  value={String(newRecord.ttl || 1)} 
                  onValueChange={(value) => setNewRecord({...newRecord, ttl: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select TTL" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {TTL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {(newRecord.type === "A" || newRecord.type === "AAAA" || newRecord.type === "CNAME") && (
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Proxy through Cloudflare
                  </Label>
                  <Switch
                    checked={!!newRecord.proxied}
                    onCheckedChange={(checked) => setNewRecord({...newRecord, proxied: checked})}
                  />
                  <div className="text-xs text-gray-500">
                    {newRecord.proxied 
                      ? "Traffic will flow through Cloudflare for performance and security benefits"
                      : "Traffic will bypass Cloudflare and go directly to your server"
                    }
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center mt-4 pt-4 border-t border-gray-200">
              <div className="flex-1 text-sm text-gray-500">
                <AlertCircle className="h-4 w-4 inline-block mr-1 text-orange-500" />
                DNS changes can take up to 24 hours to propagate globally
              </div>
              
              <Button 
                onClick={handleAddRecord}
                disabled={adding || !newRecord.name || !newRecord.content}
              >
                {adding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Record
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DNSRecordManager;
