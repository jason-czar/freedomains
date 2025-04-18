
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useDomainRegistration = (fetchDomains: () => Promise<void>) => {
  const [creatingDomain, setCreatingDomain] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const [domainSuffix] = useState("com.channel");
  const [registrationType, setRegistrationType] = useState("standard");
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [includeEmail, setIncludeEmail] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const validateDomainName = (domain: string) => {
    const isValid = /^[a-z0-9-]{3,63}$/.test(domain) && !domain.startsWith('-') && !domain.endsWith('-');
    return isValid;
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

  const redirectToStripeCheckout = async (service: 'domain' | 'email') => {
    if (!user) {
      toast.error("You must be logged in to make a purchase");
      navigate("/login");
      return;
    }

    try {
      console.log(`Creating checkout for ${service} service...`);
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          service,
          domainName: `${newDomain}.${domainSuffix}`
        }
      });

      if (error) {
        console.error("Error creating checkout:", error);
        throw error;
      }

      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }

      console.log("Redirecting to checkout:", data.url);
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Error during checkout:", error);
      toast.error(`Checkout error: ${error.message}`);
    }
  };

  const handlePaymentSuccess = () => {
    setHasPaymentMethod(true);
    setShowPaymentForm(false);
    registerDomain();
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

    if (!hasPaymentMethod) {
      // If no payment method, redirect to Stripe checkout for domain registration
      redirectToStripeCheckout('domain');
      return;
    }

    setCreatingDomain(true);
    try {
      // Create DNS records directly through Cloudflare
      const { data: cfData, error: cfError } = await supabase.functions.invoke("domain-dns", {
        body: {
          action: "create",
          subdomain: newDomain.trim(),
          domain: domainSuffix,
          records: [{
            type: "A",
            name: newDomain.trim(),
            content: "76.76.21.21",
            ttl: 1,
            proxied: true
          }, {
            type: "CNAME",
            name: `_vercel.${newDomain.trim()}`,
            content: "cname.vercel-dns.com",
            ttl: 1,
            proxied: false
          }]
        }
      });

      if (cfError) throw cfError;
      if (!cfData.success) {
        throw new Error("Failed to create DNS records: " + JSON.stringify(cfData.cloudflareResponse?.errors));
      }

      // Handle email MX records if email option is selected
      if (includeEmail) {
        const { error: emailError } = await supabase.functions.invoke("domain-dns", {
          body: {
            action: "create",
            subdomain: newDomain.trim(),
            domain: domainSuffix,
            records: [
              {
                type: "MX",
                name: newDomain.trim(),
                content: "mx.zoho.com",
                priority: 10,
                ttl: 1,
                proxied: false
              },
              {
                type: "MX",
                name: newDomain.trim(),
                content: "mx2.zoho.com",
                priority: 20,
                ttl: 1,
                proxied: false
              },
              {
                type: "TXT",
                name: newDomain.trim(),
                content: "v=spf1 include:zoho.com ~all",
                ttl: 1,
                proxied: false
              }
            ]
          }
        });

        if (emailError) {
          console.error("Warning: Email DNS setup had issues:", emailError);
        }
      }

      // Determine expiration date (1 year from now)
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);

      // Register in database
      const { error: dbError } = await supabase.from("domains").insert({
        user_id: user.id,
        subdomain: newDomain.trim(),
        is_active: true,
        expires_at: expirationDate.toISOString(),
        settings: {
          domain_suffix: domainSuffix,
          delegation_type: "standard",
          dns_active: true,
          vercel_cname_added: true,
          email_enabled: includeEmail,
          free_first_year: true,
          renewal_price: 19.99
        }
      });

      if (dbError) {
        await supabase.functions.invoke("domain-dns", {
          body: {
            action: "delete",
            subdomain: newDomain.trim(),
            domain: domainSuffix
          }
        });
        throw dbError;
      }

      if (includeEmail) {
        // Redirect to Stripe checkout for email service
        redirectToStripeCheckout('email');
        return;
      }

      toast.success("Domain registered successfully!");
      
      const freeMessage = "Your domain is free for the first year.";
      const renewalMessage = "It will renew at $19.99/year after the first year.";
      const emailMessage = includeEmail ? "Email service ($4.99/month) has been activated." : "";
      
      toast.info(`${freeMessage} ${renewalMessage} ${emailMessage}`, {
        duration: 10000
      });
      
      setNewDomain("");
      setIsAvailable(null);
      setIncludeEmail(false);
      fetchDomains();
      
      // Navigate to dashboard after successful registration
      navigate('/dashboard?tab=domains');

    } catch (error: any) {
      console.error("Error registering domain:", error.message);
      toast.error("Failed to register domain: " + error.message);
    } finally {
      setCreatingDomain(false);
    }
  };

  return {
    creatingDomain,
    isAvailable,
    setIsAvailable,
    newDomain,
    setNewDomain,
    domainSuffix,
    registrationType,
    setRegistrationType,
    hasPaymentMethod,
    includeEmail,
    setIncludeEmail,
    showPaymentForm,
    setShowPaymentForm,
    validateDomainName,
    checkPaymentMethod,
    handlePaymentSuccess,
    registerDomain
  };
};
