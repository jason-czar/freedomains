import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Shield, Settings, CreditCard, PlusCircle, ExternalLink, Edit, Trash2, LineChart, FileText, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LandingPageBuilder from "@/components/ui/landing-page-builder";

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("domains");
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      fetchDomains();
    }
    
    const domainId = searchParams.get('domain');
    if (domainId) {
      setSelectedDomain(domainId);
      setActiveTab('editor');
    }
  }, [user, searchParams]);

  const fetchDomains = async () => {
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

  const handleDeleteDomain = async (domainId: string, subdomain: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this domain? This action cannot be undone.");
    
    if (!confirmed) return;
    
    try {
      const { error: cfError } = await supabase.functions.invoke("domain-dns", {
        body: { 
          action: "delete", 
          subdomain: subdomain 
        }
      });
      
      if (cfError) {
        console.error("Error deleting Cloudflare DNS record:", cfError);
      }
      
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-clay-base/30 py-10">
        <div className="clay-container">
          <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-64 space-y-4">
              <div className="clay-card">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-clay-lavender flex items-center justify-center">
                    <span className="text-lg font-bold text-indigo-800">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{user?.email?.split('@')[0] || "User"}</h3>
                    <p className="text-sm text-gray-600">Professional Plan</p>
                  </div>
                </div>
                
                <nav className="space-y-1">
                  <button 
                    className={`w-full py-2 px-3 rounded-lg flex items-center ${
                      activeTab === "domains" 
                        ? "bg-clay-lavender/50 text-indigo-700 font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("domains")}
                  >
                    <Globe className="h-5 w-5 mr-3" />
                    Domains
                  </button>
                  <button 
                    className={`w-full py-2 px-3 rounded-lg flex items-center ${
                      activeTab === "editor" 
                        ? "bg-clay-lavender/50 text-indigo-700 font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      if (selectedDomain || domains.length > 0) {
                        setActiveTab("editor");
                        if (!selectedDomain && domains.length > 0) {
                          setSelectedDomain(domains[0].id);
                        }
                      } else {
                        toast.error("You need to register a domain first");
                        navigate("/domains");
                      }
                    }}
                  >
                    <Edit className="h-5 w-5 mr-3" />
                    Page Editor
                  </button>
                  <button 
                    className={`w-full py-2 px-3 rounded-lg flex items-center ${
                      activeTab === "ssl" 
                        ? "bg-clay-lavender/50 text-indigo-700 font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("ssl")}
                  >
                    <Shield className="h-5 w-5 mr-3" />
                    SSL Certificates
                  </button>
                  <button 
                    className={`w-full py-2 px-3 rounded-lg flex items-center ${
                      activeTab === "analytics" 
                        ? "bg-clay-lavender/50 text-indigo-700 font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("analytics")}
                  >
                    <LineChart className="h-5 w-5 mr-3" />
                    Analytics
                  </button>
                  <button 
                    className={`w-full py-2 px-3 rounded-lg flex items-center ${
                      activeTab === "billing" 
                        ? "bg-clay-lavender/50 text-indigo-700 font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("billing")}
                  >
                    <CreditCard className="h-5 w-5 mr-3" />
                    Billing
                  </button>
                  <button 
                    className={`w-full py-2 px-3 rounded-lg flex items-center ${
                      activeTab === "settings" 
                        ? "bg-clay-lavender/50 text-indigo-700 font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </button>
                </nav>
              </div>
              
              <div className="clay-card bg-clay-mint/70">
                <h3 className="font-semibold mb-2">Plan Usage</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Domains</span>
                      <span className="font-medium">{domains.length}/5</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${Math.min((domains.length / 5) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage</span>
                      <span className="font-medium">8.2/25 GB</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "33%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Bandwidth</span>
                      <span className="font-medium">156/500 GB</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "31%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
            
            <div className="flex-1">
              {activeTab === "domains" && (
                <div>
                  <div className="clay-card mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <h2 className="text-2xl font-bold">Your Domains</h2>
                      <Button className="clay-button-primary" onClick={() => navigate("/domains")}>
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Register New Domain
                      </Button>
                    </div>
                    
                    <div className="mb-6">
                      <div className="relative">
                        <Input
                          className="clay-input pl-10"
                          placeholder="Search domains..."
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : domains.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">You don't have any domains registered yet.</p>
                        <Button 
                          variant="link" 
                          className="text-indigo-600"
                          onClick={() => navigate("/domains")}
                        >
                          Register your first domain
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="py-3 text-left font-semibold text-gray-600">Domain</th>
                              <th className="py-3 text-left font-semibold text-gray-600">Status</th>
                              <th className="py-3 text-left font-semibold text-gray-600">SSL</th>
                              <th className="py-3 text-left font-semibold text-gray-600">Created</th>
                              <th className="py-3 text-left font-semibold text-gray-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {domains.map((domain) => (
                              <tr key={domain.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 font-medium">
                                  <div className="flex items-center">
                                    {domain.subdomain}.com.channel
                                    {domain.settings?.dns_record_id ? (
                                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                        DNS Active
                                      </span>
                                    ) : (
                                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" /> 
                                        DNS Issue
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    domain.is_active 
                                      ? "bg-green-100 text-green-800" 
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}>
                                    {domain.is_active ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td className="py-3">
                                  <Shield className="h-5 w-5 text-green-500" />
                                </td>
                                <td className="py-3">{new Date(domain.created_at).toLocaleDateString()}</td>
                                <td className="py-3">
                                  <div className="flex space-x-2">
                                    <button 
                                      className="text-gray-500 hover:text-indigo-600"
                                      onClick={() => window.open(`https://${domain.subdomain}.com.channel`, '_blank')}
                                    >
                                      <ExternalLink className="h-5 w-5" />
                                    </button>
                                    <button 
                                      className="text-gray-500 hover:text-indigo-600"
                                      onClick={() => {
                                        setSelectedDomain(domain.id);
                                        setActiveTab("editor");
                                      }}
                                    >
                                      <Edit className="h-5 w-5" />
                                    </button>
                                    <button 
                                      className="text-gray-500 hover:text-red-600"
                                      onClick={() => handleDeleteDomain(domain.id, domain.subdomain)}
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="clay-card">
                      <h3 className="font-semibold text-lg mb-4">Quick Stats</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="clay-card bg-clay-lavender/40">
                          <div className="text-2xl font-bold">{domains.length}</div>
                          <div className="text-gray-600">Total Domains</div>
                        </div>
                        <div className="clay-card bg-clay-mint/40">
                          <div className="text-2xl font-bold">2,096</div>
                          <div className="text-gray-600">Total Traffic</div>
                        </div>
                        <div className="clay-card bg-clay-blue/40">
                          <div className="text-2xl font-bold">{domains.length}</div>
                          <div className="text-gray-600">SSL Certificates</div>
                        </div>
                        <div className="clay-card bg-clay-peach/40">
                          <div className="text-2xl font-bold">
                            {domains.filter(d => !d.is_active).length}
                          </div>
                          <div className="text-gray-600">Inactive</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="clay-card">
                      <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
                      {domains.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No recent activity</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {domains.slice(0, 4).map((domain, index) => (
                            <div key={index} className="flex items-start">
                              <div className="h-8 w-8 rounded-full bg-clay-lavender/40 flex-shrink-0 flex items-center justify-center mr-3">
                                <FileText className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div>
                                <p className="font-medium">Domain registered</p>
                                <p className="text-sm text-gray-600">
                                  {domain.subdomain}.com.channel • {new Date(domain.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === "editor" && selectedDomain && (
                <LandingPageBuilder />
              )}
              
              {activeTab === "ssl" && (
                <div className="clay-card">
                  <h2 className="text-2xl font-bold mb-6">SSL Certificates</h2>
                  <p className="text-gray-600 mb-6">
                    Manage SSL certificates for your domains. All certificates are automatically renewed 30 days before expiration.
                  </p>
                  
                  <div className="bg-clay-mint/30 rounded-clay p-4 text-center py-12">
                    <Shield className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">All Your Domains Are Secured</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Your domains are protected with Let's Encrypt SSL certificates that automatically renew.
                    </p>
                  </div>
                </div>
              )}
              
              {activeTab === "analytics" && (
                <div className="clay-card">
                  <h2 className="text-2xl font-bold mb-6">Analytics</h2>
                  <p className="text-gray-600 mb-6">
                    Track the performance of your domains with comprehensive analytics.
                  </p>
                  
                  <Tabs defaultValue="traffic">
                    <TabsList className="grid grid-cols-4 mb-6">
                      <TabsTrigger value="traffic">Traffic</TabsTrigger>
                      <TabsTrigger value="referrers">Referrers</TabsTrigger>
                      <TabsTrigger value="devices">Devices</TabsTrigger>
                      <TabsTrigger value="locations">Locations</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="traffic" className="space-y-4">
                      <div className="clay-card h-64 flex items-center justify-center">
                        <div className="text-2xl text-gray-300">Traffic Chart</div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4">
                        <div className="clay-card bg-clay-lavender/40">
                          <div className="text-2xl font-bold">2,096</div>
                          <div className="text-gray-600">Total Visits</div>
                        </div>
                        <div className="clay-card bg-clay-mint/40">
                          <div className="text-2xl font-bold">1,245</div>
                          <div className="text-gray-600">Unique Visitors</div>
                        </div>
                        <div className="clay-card bg-clay-blue/40">
                          <div className="text-2xl font-bold">3:42</div>
                          <div className="text-gray-600">Avg. Time</div>
                        </div>
                        <div className="clay-card bg-clay-peach/40">
                          <div className="text-2xl font-bold">28%</div>
                          <div className="text-gray-600">Bounce Rate</div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="referrers">
                      <div className="clay-card h-64 flex items-center justify-center">
                        <div className="text-2xl text-gray-300">Referrers Chart</div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="devices">
                      <div className="clay-card h-64 flex items-center justify-center">
                        <div className="text-2xl text-gray-300">Devices Chart</div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="locations">
                      <div className="clay-card h-64 flex items-center justify-center">
                        <div className="text-2xl text-gray-300">Locations Map</div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
              
              {activeTab === "billing" && (
                <div className="clay-card">
                  <h2 className="text-2xl font-bold mb-6">Billing</h2>
                  <p className="text-gray-600 mb-6">
                    Manage your subscription and billing information.
                  </p>
                  
                  <div className="mb-8">
                    <div className="bg-clay-lavender/30 rounded-clay p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">Professional Plan</h3>
                        <span className="bg-clay-lavender px-3 py-1 rounded-full text-indigo-700 text-sm font-medium">
                          Active
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <p className="text-gray-600">Renews on October 15, 2023</p>
                          <p className="text-2xl font-bold mt-1">$24.99<span className="text-base font-normal text-gray-600">/month</span></p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button variant="ghost" className="clay-button bg-white text-gray-700">
                            Cancel Plan
                          </Button>
                          <Button className="clay-button-primary">
                            Upgrade Plan
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                    <div className="clay-card bg-white flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-16 bg-gray-100 rounded flex items-center justify-center mr-4">
                          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="5" width="20" height="14" rx="2" fill="#0F172A" />
                            <path d="M2 10H22" stroke="#F1F5F9" strokeWidth="2" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Visa ending in 4242</p>
                          <p className="text-sm text-gray-600">Expires 12/2025</p>
                        </div>
                      </div>
                      <Button variant="ghost" className="clay-button bg-white text-indigo-600">
                        Update
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Billing History</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="py-3 text-left font-semibold text-gray-600">Date</th>
                            <th className="py-3 text-left font-semibold text-gray-600">Description</th>
                            <th className="py-3 text-left font-semibold text-gray-600">Amount</th>
                            <th className="py-3 text-left font-semibold text-gray-600">Status</th>
                            <th className="py-3 text-left font-semibold text-gray-600"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { date: "Sep 15, 2023", description: "Professional Plan", amount: "$24.99", status: "Paid" },
                            { date: "Aug 15, 2023", description: "Professional Plan", amount: "$24.99", status: "Paid" },
                            { date: "Jul 15, 2023", description: "Professional Plan", amount: "$24.99", status: "Paid" },
                          ].map((invoice, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3">{invoice.date}</td>
                              <td className="py-3">{invoice.description}</td>
                              <td className="py-3">{invoice.amount}</td>
                              <td className="py-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {invoice.status}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <Button variant="ghost" className="text-gray-600 hover:text-indigo-600" size="sm">
                                  Download
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === "settings" && (
                <div className="clay-card">
                  <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                  <p className="text-gray-600 mb-6">
                    Manage your account preferences and personal information.
                  </p>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <Input className="clay-input" defaultValue="John Doe" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <Input className="clay-input" defaultValue="john@example.com" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Password</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <Input className="clay-input" type="password" placeholder="••••••••" />
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              New Password
                            </label>
                            <Input className="clay-input" type="password" placeholder="••••••••" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Confirm New Password
                            </label>
                            <Input className="clay-input" type="password" placeholder="••••••••" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                      <div className="space-y-3">
                        {[
                          { id: "email-marketing", label: "Marketing emails" },
                          { id: "email-system", label: "System notifications" },
                          { id: "email-billing", label: "Billing updates" },
                          { id: "email-security", label: "Security alerts" },
                        ].map((pref) => (
                          <div key={pref.id} className="flex items-center">
                            <input
                              id={pref.id}
                              type="checkbox"
                              defaultChecked={pref.id !== "email-marketing"}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor={pref.id} className="ml-2 block text-sm text-gray-700">
                              {pref.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-200 flex justify-end space-x-4">
                      <Button variant="ghost" className="clay-button bg-white text-gray-700">
                        Cancel
                      </Button>
                      <Button className="clay-button-primary">
                        Save Changes
                      </Button>
                    </div>
                  </div>
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

export default DashboardPage;
