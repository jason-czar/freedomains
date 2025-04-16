
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import DNSRecordTypeSelect from "./dns-record-type-select";
import TTLSelect from "./ttl-select";
import { DNSRecord } from "./dns-record-table";

interface AddDNSRecordFormProps {
  fullDomain: string;
  adding: boolean;
  onAddRecord: (record: DNSRecord) => void;
}

const AddDNSRecordForm: React.FC<AddDNSRecordFormProps> = ({
  fullDomain,
  adding,
  onAddRecord
}) => {
  const [newRecord, setNewRecord] = useState<DNSRecord>({
    type: "A",
    name: "",
    content: "",
    ttl: 1,
    proxied: true,
  });

  const handleAddRecord = () => {
    onAddRecord(newRecord);
  };

  const getContentPlaceholder = () => {
    switch (newRecord.type) {
      case "A":
        return "192.0.2.1";
      case "AAAA":
        return "2001:db8::";
      case "CNAME":
        return "example.com";
      case "MX":
        return "mail.example.com";
      default:
        return "";
    }
  };

  const getContentLabel = () => {
    switch (newRecord.type) {
      case "MX":
        return "Mail Server";
      case "CNAME":
        return "Points To";
      case "TXT":
        return "Text Value";
      default:
        return "Value";
    }
  };

  return (
    <div className="space-y-4 border rounded-md p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DNSRecordTypeSelect
          value={newRecord.type}
          onValueChange={(value) => setNewRecord({...newRecord, type: value})}
        />
        
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
            {getContentLabel()}
          </label>
          <Input
            placeholder={getContentPlaceholder()}
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
        
        <TTLSelect
          value={String(newRecord.ttl || 1)}
          onValueChange={(value) => setNewRecord({...newRecord, ttl: parseInt(value)})}
        />
        
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
  );
};

export default AddDNSRecordForm;
