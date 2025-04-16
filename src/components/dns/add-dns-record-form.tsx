
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
  existingRecords?: DNSRecord[];
}

const AddDNSRecordForm: React.FC<AddDNSRecordFormProps> = ({
  fullDomain,
  adding,
  onAddRecord,
  existingRecords = []
}) => {
  const [newRecord, setNewRecord] = useState<DNSRecord>({
    type: "A",
    name: "",
    content: "",
    ttl: 1,
    proxied: true,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const validateRecord = (): boolean => {
    // Check for duplicate records
    if (['A', 'AAAA', 'CNAME'].includes(newRecord.type)) {
      const nameToCheck = newRecord.name === "" || newRecord.name === "@" 
                          ? fullDomain 
                          : `${newRecord.name}.${fullDomain}`;
      
      const duplicateRecord = existingRecords.find(record => 
        (record.type === newRecord.type) && 
        (record.name === nameToCheck || 
         (record.name === fullDomain && (newRecord.name === "" || newRecord.name === "@")))
      );
      
      if (duplicateRecord) {
        setValidationError(`A ${newRecord.type} record with this name already exists. Please delete it first or use a different name.`);
        return false;
      }
    }
    
    // CNAME validation
    if (newRecord.type === "CNAME") {
      // Cannot create CNAME record for root domain if A/AAAA record exists
      if (newRecord.name === "" || newRecord.name === "@") {
        if (existingRecords.some(r => (r.type === "A" || r.type === "AAAA") && 
            (r.name === fullDomain || r.name === "@"))) {
          setValidationError("Cannot create a CNAME record for the root domain when A or AAAA records exist.");
          return false;
        }
      }
      
      // Prevent CNAME loops
      if (newRecord.content === fullDomain ||
          newRecord.content === `${newRecord.name}.${fullDomain}`) {
        setValidationError("CNAME cannot point to itself.");
        return false;
      }
    }
    
    // Validate specific record types
    if (newRecord.type === "AAAA" && !isValidIPv6(newRecord.content)) {
      setValidationError("Please enter a valid IPv6 address.");
      return false;
    }
    
    if (newRecord.type === "A" && !isValidIPv4(newRecord.content)) {
      setValidationError("Please enter a valid IPv4 address.");
      return false;
    }
    
    // MX record validation
    if (newRecord.type === "MX" && !newRecord.priority) {
      setValidationError("MX records require a priority value.");
      return false;
    }
    
    setValidationError(null);
    return true;
  };

  const isValidIPv4 = (ip: string): boolean => {
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    if (!ipv4Regex.test(ip)) return false;
    
    const parts = ip.split('.');
    return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255);
  };
  
  const isValidIPv6 = (ip: string): boolean => {
    // Basic IPv6 validation
    return /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^::1$|^([0-9a-fA-F]{1,4}::?){1,7}[0-9a-fA-F]{1,4}$/.test(ip);
  };

  const handleAddRecord = () => {
    if (!validateRecord()) return;
    
    // Format name field properly
    const formattedRecord = {...newRecord};
    
    // For root domain use @
    if (formattedRecord.name === "" || formattedRecord.name === "@") {
      formattedRecord.name = "@";
    }
    
    onAddRecord(formattedRecord);
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
      case "TXT":
        return "v=spf1 include:_spf.example.com ~all";
      case "NS":
        return "ns1.example.com";
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
      case "NS":
        return "Nameserver";
      default:
        return "Value";
    }
  };

  return (
    <div className="space-y-4 border rounded-md p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DNSRecordTypeSelect
          value={newRecord.type}
          onValueChange={(value) => {
            setNewRecord({
              ...newRecord, 
              type: value,
              // Reset proxied flag for records that don't support it
              proxied: ['A', 'AAAA', 'CNAME'].includes(value) ? true : false
            });
            setValidationError(null);
          }}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <div className="flex">
            <Input
              placeholder={newRecord.type === "MX" ? "mail" : "www"}
              value={newRecord.name}
              onChange={(e) => {
                setNewRecord({...newRecord, name: e.target.value});
                setValidationError(null);
              }}
            />
            <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">
              .{fullDomain}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Use @ for root domain ({fullDomain})
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {getContentLabel()}
          </label>
          <Input
            placeholder={getContentPlaceholder()}
            value={newRecord.content}
            onChange={(e) => {
              setNewRecord({...newRecord, content: e.target.value});
              setValidationError(null);
            }}
          />
          {newRecord.type === "A" && (
            <p className="text-xs text-gray-500 mt-1">
              For Vercel, use: 76.76.21.21
            </p>
          )}
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
              onChange={(e) => {
                setNewRecord({...newRecord, priority: parseInt(e.target.value) || 0});
                setValidationError(null);
              }}
            />
          </div>
        )}
        
        <TTLSelect
          value={String(newRecord.ttl || 1)}
          onValueChange={(value) => {
            setNewRecord({...newRecord, ttl: parseInt(value)});
            setValidationError(null);
          }}
        />
        
        {(newRecord.type === "A" || newRecord.type === "AAAA" || newRecord.type === "CNAME") && (
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Proxy through Cloudflare
            </Label>
            <Switch
              checked={!!newRecord.proxied}
              onCheckedChange={(checked) => {
                setNewRecord({...newRecord, proxied: checked});
                setValidationError(null);
              }}
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
      
      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm flex items-start">
          <AlertCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
          <div>{validationError}</div>
        </div>
      )}
      
      <div className="flex items-center mt-4 pt-4 border-t border-gray-200">
        <div className="flex-1 text-sm text-gray-500">
          <AlertCircle className="h-4 w-4 inline-block mr-1 text-orange-500" />
          DNS changes can take up to 24 hours to propagate globally
        </div>
        
        <Button 
          onClick={handleAddRecord}
          disabled={adding || !newRecord.content}
          className="bg-green-600 hover:bg-green-700 text-white"
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
