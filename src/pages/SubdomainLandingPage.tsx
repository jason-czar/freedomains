
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import { DomainSettings } from "@/types/domain-types";

const SubdomainLandingPage = () => {
  const { subdomain } = useParams();
  const [loading, setLoading] = useState(true);
  const [domainInfo, setDomainInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDomainInfo = async () => {
      if (!subdomain) {
        setError("Invalid subdomain");
        setLoading(false);
        return;
      }

      try {
        // Attempt to fetch domain information from the database
        const { data, error } = await supabase
          .from("domains")
          .select("*")
          .eq("subdomain", subdomain)
          .single();

        if (error) throw error;
        
        if (!data) {
          setError("Domain not found");
        } else {
          setDomainInfo(data);
          
          // Handle domain forwarding if configured
          // Cast settings to DomainSettings type
          const settings = data.settings as DomainSettings;
          
          if (settings?.forwarding?.url) {
            console.log(`Forwarding to ${settings.forwarding.url}`);
            window.location.href = settings.forwarding.url;
            return;
          }
        }
      } catch (err: any) {
        console.error("Error fetching domain:", err);
        setError(err.message || "Failed to load domain information");
      } finally {
        setLoading(false);
      }
    };

    fetchDomainInfo();
  }, [subdomain, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-2" />
          <span>Loading domain information...</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !domainInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Domain Error</h1>
            <p className="text-gray-700 mb-4">
              {error || "This domain is not properly configured."}
            </p>
            <p className="text-sm text-gray-500">
              If you own this domain, please check your domain settings in the dashboard.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // When domain is found
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-10">
        <div className="clay-container">
          <div className="clay-card">
            <h1 className="text-3xl font-bold mb-4">{subdomain}.com.channel</h1>
            
            <div className="p-6 bg-indigo-50 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-2">Welcome to this domain!</h2>
              <p className="mb-4">
                This domain is registered and active. The owner can customize this page through the dashboard.
              </p>
              
              {domainInfo.settings?.forwarding?.url && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-indigo-100">
                  <p className="text-sm text-gray-600">
                    This domain is configured to forward to:
                  </p>
                  <a 
                    href={domainInfo.settings.forwarding.url}
                    className="text-indigo-600 font-medium hover:underline"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {domainInfo.settings.forwarding.url}
                  </a>
                </div>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Domain Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Registered On</p>
                  <p>{new Date(domainInfo.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      domainInfo.is_active 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {domainInfo.is_active ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">DNS Active</p>
                  <p>{domainInfo.settings?.dns_active ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expires On</p>
                  <p>{domainInfo.expires_at ? new Date(domainInfo.expires_at).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SubdomainLandingPage;
