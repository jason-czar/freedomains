
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { setSearchParam } from "@/utils/urlParams";

interface DomainSearchProps {
  onSearch?: (domain: string) => void;
}

const DomainSearch = ({
  onSearch
}: DomainSearchProps) => {
  const navigate = useNavigate();
  const [subdomain, setSubdomain] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSearching, setIsSearching] = useState(false);

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
      
      // After checking availability, navigate to register-domain page
      navigate(`/register-domain${setSearchParam(domain)}`);
    }, 1000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (subdomain.trim()) {
      checkAvailability(subdomain.trim());
    }
  };

  const handleRegisterClick = () => {
    navigate(`/domains${setSearchParam(subdomain)}`);
  };

  return <div className="bg-black/40 backdrop-blur-sm border border-gray-800/50 rounded-xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] max-w-xl mx-auto">
    <h2 className="text-2xl font-bold text-center mb-6 text-white">Find Your Perfect Subdomain</h2>
    
    <form onSubmit={handleSearch} className="flex flex-col space-y-4">
      <div className="flex items-center bg-gray-900/60 rounded-full p-1 border-[0.5px] border-white/30 mx-0">
        <Input type="text" placeholder="yourname" value={subdomain} onChange={e => setSubdomain(e.target.value)} autoComplete="off" className="bg-transparent border-0 focus:ring-0 text-white text-lg flex-grow rounded-full shadow-none px-[20px]" />
        <span className="px-3 text-lg font-medium text-gray-400">.com.channel</span>
      </div>
      
      <Button type="submit" className="w-full py-6 bg-gradient-to-r from-emerald-500 to-green-400 text-gray-900 font-semibold hover:brightness-110 shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_rgba(0,255,165,0.4)]" disabled={isSearching || !subdomain.trim()}>
        {isSearching ? "Checking..." : "Check Availability"}
      </Button>
      
      <p className="text-center text-gray-400 text-sm">Free for the first year, then $19.99/year</p>
    </form>

    {isAvailable !== null && !isSearching && <div className={`mt-6 p-4 rounded-xl text-center ${isAvailable ? 'bg-emerald-900/30 border border-emerald-500/20' : 'bg-rose-900/30 border border-rose-500/20'}`}>
      {isAvailable ? <>
        <div className="text-xl font-bold mb-2 text-emerald-400">{subdomain}.com.channel is available!</div>
        <Button 
          className="mt-2 bg-black/40 border border-emerald-500/30 hover:border-emerald-500/50 text-gray-950 text-base font-semibold"
          onClick={handleRegisterClick}
        >
          Register Now
        </Button>
        <p className="mt-2 text-gray-400 text-sm">Free for the first year, then $19.99/year</p>
      </> : <div className="text-xl font-bold text-rose-400">Sorry, {subdomain}.com.channel is already taken.</div>}
    </div>}
  </div>;
};

export default DomainSearch;
