import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import EmailServiceStatus from "@/components/email/EmailServiceStatus";
import EmailServiceActivation from "@/components/email/EmailServiceActivation";

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
              <EmailServiceStatus domainDisplay={domainDisplay} />
            ) : (
              <EmailServiceActivation
                domainDisplay={domainDisplay}
                showPaymentForm={showPaymentForm}
                activating={activating}
                hasPaymentMethod={hasPaymentMethod}
                onActivate={activateEmailService}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentCancel={() => setShowPaymentForm(false)}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmailAddonPage;
