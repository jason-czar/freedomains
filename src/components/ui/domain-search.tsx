
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DomainSearchProps {
  onSearch?: (domain: string) => void;
}

const DomainSearch = ({ onSearch }: DomainSearchProps) => {
  const [subdomain, setSubdomain] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // This would be connected to a real API in production
  const checkAvailability = (domain: string) => {
    setIsSearching(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      // For demo purposes, we'll make random domains available
      const available = Math.random() > 0.3;
      setIsAvailable(available);
      setIsSearching(false);
      
      if (onSearch) {
        onSearch(domain);
      }
    }, 1000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (subdomain.trim()) {
      checkAvailability(subdomain.trim());
    }
  };

  return (
    <div className="clay-panel max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Find Your Perfect Subdomain</h2>
      
      <form onSubmit={handleSearch} className="flex flex-col space-y-4">
        <div className="flex items-center">
          <Input
            type="text"
            placeholder="yourname"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            className="clay-input flex-grow"
            autoComplete="off"
          />
          <span className="px-3 text-lg font-medium text-gray-600">.com.channel</span>
        </div>
        
        <Button 
          type="submit" 
          className="clay-button-primary w-full"
          disabled={isSearching || !subdomain.trim()}
        >
          {isSearching ? "Checking..." : "Check Availability"}
        </Button>
      </form>

      {isAvailable !== null && !isSearching && (
        <div className={`mt-6 p-4 rounded-clay text-center ${isAvailable ? 'bg-clay-mint text-green-700' : 'bg-clay-pink text-rose-700'}`}>
          {isAvailable ? (
            <>
              <div className="text-xl font-bold mb-2">{subdomain}.com.channel is available!</div>
              <Button className="clay-button bg-white text-green-600 mt-2">
                Register Now
              </Button>
            </>
          ) : (
            <div className="text-xl font-bold">Sorry, {subdomain}.com.channel is already taken.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DomainSearch;
