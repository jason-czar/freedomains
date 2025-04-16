
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, CheckCircle, XCircle, Loader2, Server, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DNSRecordManager from "@/components/ui/dns-record-manager";

const DomainManagementPage = () => {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [creatingDomain, setCreatingDomain] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [domainSuffix, setDomainSuffix] = useState("com.channel");
  const [registrationType, setRegistrationType] = useState("standard");
  const [nameservers, setNameservers] = useState<string[]>(["ns1.example.com", "ns2.example.com"]);
  const [dnsModalOpen, setDnsModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
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
    
    setCreatingDomain(true);
    try {
      // Prepare nameservers if needed for delegation
      const nsArray = registrationType === "delegated" 
        ? nameservers.filter(ns => ns.trim() !== "") 
        : undefined;
      
      // First, create the DNS record at Cloudflare
      const { data: cfData, error: cfError } = await supabase.functions.invoke("domain-dns", {
        body: { 
          action: "create", 
          subdomain: newDomain.trim(),
          domain: domainSuffix,
          nameservers: nsArray
        }
      });
      
      if (cfError) throw cfError;
      
      if (!cfData.success && !cfData.delegated) {
        throw new Error("Failed to create DNS record: " + JSON.stringify(cfData.cloudflareResponse?.errors));
      }
      
      // Then register the domain in our database
      const { error: dbError } = await supabase
        .from("domains")
        .insert({
          user_id: user.id,
          subdomain: newDomain.trim(),
          is_active: true,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year expiry
          settings: {
            dns_record_id: cfData.dnsRecord?.id,
            cloudflare_record: cfData.dnsRecord,
            domain_suffix: domainSuffix,
            delegation_type: registrationType,
            nameservers: nsArray,
            delegated: registrationType === "delegated"
          }
        });
      
      if (dbError) {
        // If database insert fails, try to rollback the Cloudflare DNS record
        await supabase.functions.invoke("domain-dns", {
          body: { 
            action: "delete", 
            subdomain: newDomain.trim(),
            domain: domainSuffix
          }
        });
        
        throw dbError;
      }
      
      toast.success("Domain registered successfully!");
      
      if (registrationType === "delegated") {
        toast.info(`Your domain ${newDomain}.${domainSuffix} has been delegated to your nameservers.`, {
          duration: 10000,
        });
      } else {
        toast.info(`Next step: Add ${newDomain}.${domainSuffix} to your Vercel project's domains`, {
          duration: 10000,
        });
      }
      
      setNewDomain("");
      setIsAvailable(null);
      fetchDomains();
    } catch (error: any) {
      console.error("Error registering domain:", error.message);
      toast.error("Failed to register domain: " + error.message);
    } finally {
      setCreatingDomain(false);
    }
  };

  const handleDeleteDomain = async (domainId: string, subdomain: string, domainSuffix: string = "com.channel") => {
    const confirmed = window.confirm("Are you sure you want to delete this domain? This action cannot be undone.");
    
    if (!confirmed) return;
    
    try {
      // Delete from Cloudflare first
      const { error: cfError } = await supabase.functions.invoke("domain-dns", {
        body: { 
          action: "delete", 
          subdomain: subdomain,
          domain: domainSuffix
        }
      });
      
      if (cfError) {
        console.error("Error deleting Cloudflare DNS record:", cfError);
        // Continue with database deletion even if Cloudflare deletion fails
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from("domains")
        .delete()
        .eq("id", domainId);
      
      if (dbError) throw dbError;
      
      toast.success("Domain deleted successfully");
      fetchDomains();
    } catch (error: any) {
      console.error("Error deleting domain:", error.message);
      toast.error("Failed to delete domain");
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

  const getDomainDisplay = (domain: any) => {
    const suffix = domain.settings?.domain_suffix || "com.channel";
    return `${domain.subdomain}.${suffix}`;
  };

  const handleNameserverChange = (index: number, value: string) => {
    const newNameservers = [...nameservers];
    newNameservers[index] = value;
    setNameservers(newNameservers);
  };

  const addNameserver = () => {
    setNameservers([...nameservers, ""]);
  };

  const removeNameserver = (index: number) => {
    const newNameservers = [...nameservers];
    newNameservers.splice(index, 1);
    setNameservers(newNameservers);
  };

  const openDnsManager = (domain: any) => {
    setSelectedDomain(domain);
    setDnsModalOpen(true);
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
              
              <Tabs value={registrationType} onValueChange={setRegistrationType} className="mb-6">
                <TabsList className="grid grid-cols-2 w-full max-w-md mb-4">
                  <TabsTrigger value="standard">Standard Domain</TabsTrigger>
                  <TabsTrigger value="delegated">Nameserver Delegation</TabsTrigger>
                </TabsList>
                
                <TabsContent value="standard">
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-blue-800">
                      <strong>Standard Domain:</strong> We'll create an A record pointing to Vercel. 
                      You'll need to add this domain to your Vercel project settings.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="delegated">
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-blue-800">
                      <strong>Nameserver Delegation:</strong> We'll delegate this subdomain to your nameservers, 
                      giving you full control over all DNS records. You'll need your own DNS hosting service 
                      (like Cloudflare, AWS Route53, etc).
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Nameservers (at least 2 recommended)
                    </label>
                    
                    {nameservers.map((ns, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={ns}
                          onChange={(e) => handleNameserverChange(index, e.target.value)}
                          placeholder="ns1.example.com"
                          className="flex-grow"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeNameserver(index)}
                          disabled={nameservers.length <= 2}
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={addNameserver}
                      className="mt-2"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Nameserver
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              
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
                    disabled={!isAvailable || !validateDomainName(newDomain) || creatingDomain || 
                      (registrationType === "delegated" && nameservers.filter(ns => ns.trim() !== "").length < 2)}
                    className="flex-1"
                  >
                    {creatingDomain ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Register
                      </>
                    )}
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
                        <th className="py-3 text-left font-semibold text-gray-600">Type</th>
                        <th className="py-3 text-left font-semibold text-gray-600">Status</th>
                        <th className="py-3 text-left font-semibold text-gray-600">Registered On</th>
                        <th className="py-3 text-left font-semibold text-gray-600">Expires On</th>
                        <th className="py-3 text-left font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domains.map((domain) => (
                        <tr key={domain.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 font-medium">{getDomainDisplay(domain)}</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              domain.settings?.delegated 
                                ? "bg-purple-100 text-purple-800" 
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {domain.settings?.delegated ? (
                                <><Server className="h-3 w-3 mr-1" /> Delegated</>
                              ) : (
                                "Standard"
                              )}
                            </span>
                          </td>
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
                            <div className="flex gap-2">
                              <Button
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/dashboard?domain=${domain.id}`)}
                              >
                                Manage
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDnsManager(domain)}
                              >
                                <Globe className="h-4 w-4 mr-1" />
                                DNS
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDeleteDomain(domain.id, domain.subdomain, domain.settings?.domain_suffix)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Next Steps After Domain Registration</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-blue-800">For Standard Domains:</h4>
                  <ol className="list-decimal pl-5 space-y-2 text-blue-800">
                    <li>After registering your domain, you need to add it to your Vercel project.</li>
                    <li>Go to your Vercel project settings, find the "Domains" section, and add your new domain.</li>
                    <li>Vercel will automatically verify the domain (we've set up the verification CNAME for you).</li>
                    <li>Once verified, your domain will start working with your Vercel project.</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-semibold text-blue-800">For Delegated Domains:</h4>
                  <ol className="list-decimal pl-5 space-y-2 text-blue-800">
                    <li>After registering your delegated domain, DNS requests will be directed to your nameservers.</li>
                    <li>Set up your DNS hosting service (Cloudflare, Route53, etc.) to recognize this domain.</li>
                    <li>Add the required DNS records to your DNS hosting service to start receiving traffic.</li>
                    <li>You have full control to set up websites, email services, or any other services on your domain.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* DNS Management Modal */}
      <Dialog open={dnsModalOpen} onOpenChange={setDnsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>DNS Management</DialogTitle>
          </DialogHeader>
          
          {selectedDomain && (
            <DNSRecordManager 
              domainId={selectedDomain.id}
              subdomain={selectedDomain.subdomain}
              domainSuffix={selectedDomain.settings?.domain_suffix || "com.channel"}
              onRefresh={fetchDomains}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default DomainManagementPage;
