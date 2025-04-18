
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import { Button } from "@/components/ui/button";
import { Mail, Server, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import PaymentMethodForm from "@/components/domain/PaymentMethodForm";

const EmailAddonPage = () => {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [domain, setDomain] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    if (!domainId) {
      navigate("/domains");
      return;
    }
    
    fetchDomain();
    checkPaymentMethod();
  }, [domainId]);

  const fetchDomain = async () => {
    try {
      const { data, error } = await supabase
        .from("domains")
        .select("*")
        .eq("id", domainId)
        .single();
      
      if (error) throw error;
      if (!data) {
        toast.error("Domain not found");
        navigate("/domains");
        return;
      }
      
      setDomain(data);
    } catch (error: any) {
      console.error("Error fetching domain:", error.message);
      toast.error("Error loading domain information");
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentMethod = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);
      
      if (error) throw error;
      setHasPaymentMethod(data && data.length > 0);
    } catch (error) {
      console.error("Error checking payment method:", error);
    }
  };

  const activateEmailService = async () => {
    if (!domain) return;
    
    if (!hasPaymentMethod) {
      setShowPaymentForm(true);
      return;
    }
    
    setActivating(true);
    try {
      // Create MX records for Zoho Mail
      const { error: dnsError } = await supabase.functions.invoke("domain-dns", {
        body: {
          action: "create",
          subdomain: domain.subdomain,
          domain: domain.settings?.domain_suffix || "com.channel",
          records: [
            {
              type: "MX",
              name: domain.subdomain,
              content: "mx.zoho.com",
              priority: 10,
              ttl: 1,
              proxied: false
            },
            {
              type: "MX",
              name: domain.subdomain,
              content: "mx2.zoho.com",
              priority: 20,
              ttl: 1,
              proxied: false
            },
            {
              type: "TXT",
              name: domain.subdomain,
              content: "v=spf1 include:zoho.com ~all",
              ttl: 1,
              proxied: false
            }
          ]
        }
      });
      
      if (dnsError) throw dnsError;
      
      // Update domain settings
      const updatedSettings = {
        ...domain.settings,
        email_enabled: true
      };
      
      const { error: updateError } = await supabase
        .from("domains")
        .update({ settings: updatedSettings })
        .eq("id", domain.id);
      
      if (updateError) throw updateError;
      
      // Create subscription record
      const domainFull = `${domain.subdomain}.${domain.settings?.domain_suffix || "com.channel"}`;
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user?.id,
          domain: domainFull,
          service: "email",
          status: "active",
          amount: 4.99,
          interval: "month",
          next_billing_date: new Date().toISOString(), // Bill immediately
          created_at: new Date().toISOString()
        });
      
      if (subscriptionError) throw subscriptionError;
      
      toast.success("Email service activated successfully!");
      toast.info("You will be billed $4.99/month starting today. You can now create email addresses on your domain.");
      
      // Refresh domain data
      fetchDomain();
    } catch (error: any) {
      console.error("Error activating email service:", error);
      toast.error("Failed to activate email service: " + error.message);
    } finally {
      setActivating(false);
    }
  };

  const handlePaymentSuccess = () => {
    setHasPaymentMethod(true);
    setShowPaymentForm(false);
    activateEmailService();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-clay-base/30 py-10 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </main>
        <Footer />
      </div>
    );
  }

  const domainDisplay = domain ? `${domain.subdomain}.${domain.settings?.domain_suffix || "com.channel"}` : "";
  const isEmailEnabled = domain?.settings?.email_enabled === true;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-clay-base/30 py-10">
        <div className="clay-container">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/domains")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Domains
          </Button>
          
          <div className="clay-card">
            <h2 className="text-2xl font-bold mb-6">Email Service for {domainDisplay}</h2>
            
            {isEmailEnabled ? (
              <div className="bg-indigo-900/30 rounded-xl p-6 border border-indigo-500/20">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-indigo-800/50 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Email Service is Active</h3>
                    <p className="text-gray-400">You're currently being billed $4.99/month for email service.</p>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-indigo-800/50 pt-6">
                  <h4 className="text-lg font-medium text-white mb-4">Email Management</h4>
                  
                  <div className="bg-black/40 rounded-lg p-4 mb-4">
                    <h5 className="font-medium text-white mb-2">Login to Zoho Mail</h5>
                    <p className="text-gray-400 mb-3">Manage your email accounts, create mailboxes, and access your email.</p>
                    <Button variant="outline" className="border-indigo-500/30 text-indigo-400">
                      Access Zoho Mail Control Panel
                    </Button>
                  </div>
                  
                  <div className="bg-black/40 rounded-lg p-4">
                    <h5 className="font-medium text-white mb-2">DNS Records</h5>
                    <p className="text-gray-400 mb-3">Your email DNS records have been set up automatically.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-900/50 p-3 rounded border border-gray-800/50">
                        <div className="text-xs text-gray-500 mb-1">MX Record 1</div>
                        <div className="text-gray-300 font-mono text-sm break-all">
                          mx.zoho.com (Priority: 10)
                        </div>
                      </div>
                      <div className="bg-gray-900/50 p-3 rounded border border-gray-800/50">
                        <div className="text-xs text-gray-500 mb-1">MX Record 2</div>
                        <div className="text-gray-300 font-mono text-sm break-all">
                          mx2.zoho.com (Priority: 20)
                        </div>
                      </div>
                      <div className="bg-gray-900/50 p-3 rounded border border-gray-800/50 md:col-span-2">
                        <div className="text-xs text-gray-500 mb-1">SPF Record (TXT)</div>
                        <div className="text-gray-300 font-mono text-sm break-all">
                          v=spf1 include:zoho.com ~all
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : showPaymentForm ? (
              <PaymentMethodForm
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPaymentForm(false)}
              />
            ) : (
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
                  <div className="bg-indigo-900/30 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Add Email Service to Your Domain</h3>
                    <p className="text-gray-400">Create professional email addresses like you@{domainDisplay}</p>
                  </div>
                </div>
                
                <div className="bg-indigo-900/20 rounded-lg p-5 mb-6">
                  <h4 className="text-lg font-medium text-white mb-3">Email Service Features</h4>
                  <ul className="space-y-2">
                    {[
                      "Professional email addresses on your domain",
                      "5 mailboxes included",
                      "25GB storage per mailbox",
                      "Webmail access",
                      "Mobile app access",
                      "IMAP/POP support",
                      "Spam and virus protection"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="text-indigo-400 mr-2">✓</div>
                        <div className="text-gray-300">{feature}</div>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 pt-4 border-t border-indigo-800/30">
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-white">$4.99</span>
                      <span className="text-gray-400 ml-1">/month</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">Billed monthly, cancel anytime</p>
                  </div>
                </div>
                
                <Button
                  className="w-full py-6 bg-gradient-to-r from-indigo-500 to-blue-400 text-white font-semibold hover:brightness-110"
                  onClick={activateEmailService}
                  disabled={activating}
                >
                  {activating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Activating Email Service...
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5 mr-2" />
                      {hasPaymentMethod ? "Activate Email Service" : "Add Payment Method & Activate"}
                    </>
                  )}
                </Button>
                
                <p className="text-gray-400 text-sm mt-4 text-center">
                  Email service will be billed immediately at $4.99/month.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmailAddonPage;
