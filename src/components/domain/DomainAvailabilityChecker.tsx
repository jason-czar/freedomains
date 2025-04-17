import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DomainAvailabilityCheckerProps {
  newDomain: string;
  setNewDomain: (domain: string) => void;
  isAvailable: boolean | null;
  setIsAvailable: (available: boolean | null) => void;
  domainSuffix: string;
  validateDomainName: (domain: string) => boolean;
}

const DomainAvailabilityChecker: React.FC<DomainAvailabilityCheckerProps> = ({
  newDomain,
  setNewDomain,
  isAvailable,
  setIsAvailable,
  domainSuffix,
  validateDomainName
}) => {
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const checkDomainAvailability = async () => {
    if (!newDomain.trim()) {
      toast.error("Please enter a domain name");
      return;
    }

    setCheckingAvailability(true);
    setIsAvailable(null);
    
    try {
      // First check local database
      const { data: existingDomain, error: dbError } = await supabase
        .from("domains")
        .select("id")
        .eq("subdomain", newDomain.trim())
        .single();
      
      if (dbError && dbError.code !== "PGRST116") {
        throw dbError;
      }
      
      if (existingDomain) {
        setIsAvailable(false);
        return;
      }
      
      // Then check with Cloudflare
      const { data, error } = await supabase.functions.invoke("domain-dns", {
        body: { 
          action: "check", 
          subdomain: newDomain.trim(),
          domain: domainSuffix
        }
      });
      
      if (error) throw error;
      
      setIsAvailable(data.isAvailable);
      
      if (!data.isAvailable) {
        toast.warning(`This domain is already registered: ${data.fullDomain}`);
      }
    } catch (error: any) {
      console.error("Error checking domain availability:", error.message);
      toast.error("Failed to check domain availability");
      setIsAvailable(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleNewDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setNewDomain(value);
    
    // Reset availability status when input changes
    if (isAvailable !== null) {
      setIsAvailable(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Domain Name
        </label>
        <div className="flex items-center bg-[#1A1F2C]/80 rounded-full overflow-hidden border border-[#0FA0CE] shadow-[0_0_10px_rgba(15,160,206,0.1)]">
          <Input
            className="flex-1 bg-transparent border-0 text-white placeholder-gray-500 focus:ring-0 text-lg rounded-none"
            placeholder="yourname"
            value={newDomain}
            onChange={handleNewDomainChange}
          />
          <span className="inline-flex items-center px-4 text-gray-400 text-lg">
            .{domainSuffix}
          </span>
        </div>
        <div className="mt-2 text-sm">
          {newDomain && !validateDomainName(newDomain) && (
            <p className="text-red-500">
              Domain must be 3-63 characters long, contain only lowercase letters, numbers, or hyphens, and not start or end with a hyphen.
            </p>
          )}
          {isAvailable === true && (
            <p className="text-green-500 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" /> Domain is available!
            </p>
          )}
          {isAvailable === false && (
            <p className="text-red-500 flex items-center">
              <XCircle className="h-4 w-4 mr-1" /> Domain is not available.
            </p>
          )}
        </div>
      </div>
      <div>
        <Button 
          variant="outline" 
          onClick={checkDomainAvailability} 
          disabled={checkingAvailability || !validateDomainName(newDomain)}
          className="w-full"
        >
          {checkingAvailability ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            "Check Availability"
          )}
        </Button>
      </div>
    </div>
  );
};

export default DomainAvailabilityChecker;
