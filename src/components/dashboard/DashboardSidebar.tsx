
import React from "react";
import { Button } from "@/components/ui/button";
import { Globe, Shield, Settings, CreditCard, Edit, LineChart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedDomain: string | null;
  domains: any[];
  navigate: (path: string) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
  selectedDomain,
  domains,
  navigate
}) => {
  const { user } = useAuth();

  return (
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
                  setActiveTab("editor");
                }
              } else {
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
  );
};

export default DashboardSidebar;
