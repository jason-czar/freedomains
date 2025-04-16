
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface RecordProxyFieldProps {
  proxied: boolean;
  onChange: (value: boolean) => void;
}

const RecordProxyField: React.FC<RecordProxyFieldProps> = ({ 
  proxied, 
  onChange 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Label className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Proxy through Cloudflare
      </Label>
      <Switch
        checked={proxied}
        onCheckedChange={onChange}
      />
      <div className="text-xs text-gray-500">
        {proxied 
          ? "Traffic will flow through Cloudflare for performance and security benefits"
          : "Traffic will bypass Cloudflare and go directly to your server"
        }
      </div>
    </div>
  );
};

export default RecordProxyField;
