
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DomainSettings } from "@/types/domain-types";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkForSubdomain = async () => {
      // Log the 404 error for debugging
      console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname,
        "Full URL:",
        window.location.href
      );

      // Dashboard redirect special case
      if (location.pathname === "/dashboard") {
        console.log("Detected dashboard access attempt, redirecting to /dashboard");
        navigate("/dashboard");
        return;
      }

      // Check if this is a root path access that might be from a subdomain
      if (location.pathname === "/" || location.pathname === "") {
        // Get the hostname from the browser
        const hostname = window.location.hostname;
        
        console.log("Checking hostname:", hostname);
        
        // Handle apex domain with or without www
        if (hostname === "com.channel" || hostname === "www.com.channel") {
          console.log("Detected apex domain access");
          // This is the main site - allow it to render normally
          setChecking(false);
          return;
        }
        
        // Extract potential subdomain - handle both .com.channel and direct subdomain access
        let subdomain = null;
        
        if (hostname.endsWith(".com.channel")) {
          // Format: subdomain.com.channel
          const parts = hostname.split(".");
          // If it's www.com.channel, we've already handled it above
          if (parts[0] === "www" && parts.length === 3) {
            setChecking(false);
            return;
          }
          subdomain = parts[0];
        } else if (hostname.includes(".")) {
          // Format could be subdomain.yourdomain.com
          subdomain = hostname.split(".")[0];
          // If it's www, treat it as the main domain
          if (subdomain === "www") {
            setChecking(false);
            return;
          }
        }
        
        if (subdomain) {
          console.log("Detected potential subdomain:", subdomain);
          
          try {
            // Check if this subdomain exists in our database
            const { data, error } = await supabase
              .from("domains")
              .select("id, settings, is_active")
              .eq("subdomain", subdomain)
              .maybeSingle();
            
            if (error) throw error;
            
            if (data) {
              console.log("Found domain data:", data);
              
              // Safely access settings as DomainSettings object
              const settings = data.settings as DomainSettings;
              
              // Check if domain has forwarding settings
              if (settings?.forwarding?.url) {
                console.log("Forwarding to:", settings.forwarding.url);
                window.location.href = settings.forwarding.url;
                return;
              }
              
              // Redirect to the subdomain landing page
              navigate(`/domain/${subdomain}`);
              return;
            } else {
              console.log("Subdomain not found in database");
            }
          } catch (err) {
            console.error("Error checking subdomain:", err);
          }
        }
      }
      
      setChecking(false);
    };

    checkForSubdomain();
  }, [location.pathname, navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mr-2" />
        <span>Checking page...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
