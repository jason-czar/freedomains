
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DomainManagementPage = () => {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDomains();
  }, [user]);

  const fetchDomains = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("domains")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setDomains(data || []);
    } catch (error: any) {
      console.error("Error fetching domains:", error.message);
      toast.error("Failed to load domains");
    } finally {
      setLoading(false);
    }
  };

  const checkDomainAvailability = async () => {
    if (!newDomain.trim()) {
      toast.error("Please enter a domain name");
      return;
    }

    setCheckingAvailability(true);
    setIsAvailable(null);
    
    try {
      // Check if domain exists in the database
      const { data, error } = await supabase
        .from("domains")
        .select("id")
        .eq("subdomain", newDomain.trim())
        .single();
      
      if (error && error.code !== "PGRST116") {
        throw error;
      }
      
      setIsAvailable(!data);
    } catch (error: any) {
      console.error("Error checking domain availability:", error.message);
      toast.error("Failed to check domain availability");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const registerDomain = async () => {
    if (!user) {
      toast.error("You must be logged in to register a domain");
      navigate("/login");
      return;
    }
    
    if (!newDomain.trim()) {
      toast.error("Please enter a domain name");
      return;
    }
    
    if (!isAvailable) {
      toast.error("This domain is not available");
      return;
    }
    
    try {
      const { error } = await supabase
        .from("domains")
        .insert({
          user_id: user.id,
          subdomain: newDomain.trim(),
          is_active: true,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year expiry
        });
      
      if (error) throw error;
      
      toast.success("Domain registered successfully!");
      setNewDomain("");
      setIsAvailable(null);
      fetchDomains();
    } catch (error: any) {
      console.error("Error registering domain:", error.message);
      toast.error("Failed to register domain");
    }
  };

  const validateDomainName = (domain: string) => {
    // Basic validation: only alphanumeric and hyphens, between 3-63 characters
    const isValid = /^[a-z0-9-]{3,63}$/.test(domain) && !domain.startsWith('-') && !domain.endsWith('-');
    return isValid;
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-clay-base/30 py-10">
        <div className="clay-container">
          <div className="clay-card mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">Domain Management</h2>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Register New Domain</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain Name
                  </label>
                  <div className="flex">
                    <Input
                      className="rounded-r-none"
                      placeholder="yourdomain"
                      value={newDomain}
                      onChange={handleNewDomainChange}
                    />
                    <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">
                      .com.channel
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
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={checkDomainAvailability} 
                    disabled={checkingAvailability || !validateDomainName(newDomain)}
                    className="flex-1"
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
                  <Button 
                    onClick={registerDomain} 
                    disabled={!isAvailable || !validateDomainName(newDomain)}
                    className="flex-1"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Register
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Domains</h3>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : domains.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">You don't have any domains registered yet.</p>
                  <p className="text-gray-500 mt-1">Register your first domain above!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-3 text-left font-semibold text-gray-600">Domain</th>
                        <th className="py-3 text-left font-semibold text-gray-600">Status</th>
                        <th className="py-3 text-left font-semibold text-gray-600">Registered On</th>
                        <th className="py-3 text-left font-semibold text-gray-600">Expires On</th>
                        <th className="py-3 text-left font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domains.map((domain) => (
                        <tr key={domain.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 font-medium">{domain.subdomain}.com.channel</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              domain.is_active 
                                ? "bg-green-100 text-green-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {domain.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-4">{new Date(domain.created_at).toLocaleDateString()}</td>
                          <td className="py-4">
                            {domain.expires_at 
                              ? new Date(domain.expires_at).toLocaleDateString() 
                              : "Never"}
                          </td>
                          <td className="py-4">
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/dashboard?domain=${domain.id}`)}
                            >
                              Manage
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DomainManagementPage;
