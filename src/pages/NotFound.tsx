
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkForSubdomain = async () => {
      // Log the 404 error for debugging
      console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname
      );

      // Check if this is a root path access that might be from a subdomain
      if (location.pathname === "/" || location.pathname === "") {
        // Get the hostname from the browser
        const hostname = window.location.hostname;
        
        // Check if it's a potential subdomain.com.channel format
        if (hostname.endsWith(".com.channel")) {
          // Extract the subdomain part
          const subdomain = hostname.split(".")[0];
          
          if (subdomain) {
            try {
              // Check if this subdomain exists in our database
              const { data, error } = await supabase
                .from("domains")
                .select("id")
                .eq("subdomain", subdomain)
                .maybeSingle();
              
              if (data) {
                // Redirect to the subdomain landing page
                navigate(`/domain/${subdomain}`);
                return;
              }
            } catch (err) {
              console.error("Error checking subdomain:", err);
            }
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
