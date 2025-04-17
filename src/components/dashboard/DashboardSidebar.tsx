
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

const SidebarButton = ({ 
  active, 
  onClick, 
  icon, 
  label,
  hidden = false  // Add a new prop to control visibility
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
  hidden?: boolean;  // Optional prop with default false
}) => (
  <button 
    className={`w-full py-2 px-3 rounded-lg flex items-center transition-all duration-300 ${
      active 
        ? "bg-gray-800/70 text-green-400 font-medium border-l-2 border-green-400" 
        : "text-gray-300 hover:bg-gray-800/30 hover:text-gray-100"
    } ${hidden ? "opacity-0 pointer-events-none" : ""}`}  // Add conditional classes for hiding
    onClick={onClick}
  >
    {React.cloneElement(icon as React.ReactElement, { 
      className: `h-5 w-5 mr-3 ${active ? "text-green-400" : "text-gray-400"}` 
    })}
    {label}
  </button>
);

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
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
            <span className="text-lg font-bold text-white">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-white">{user?.email?.split('@')[0] || "User"}</h3>
            <p className="text-sm text-gray-400">Professional Plan</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          <SidebarButton
            hidden={true}  // Hide this specific button
            active={activeTab === "domains"}
            onClick={() => setActiveTab("domains")}
            icon={<Globe />}
            label="Domains"
          />
          <SidebarButton
            active={activeTab === "editor"}
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
            icon={<Edit />}
            label="Page Editor"
          />
          <SidebarButton
            active={activeTab === "ssl"}
            onClick={() => setActiveTab("ssl")}
            icon={<Shield />}
            label="SSL Certificates"
          />
          <SidebarButton
            active={activeTab === "analytics"}
            onClick={() => setActiveTab("analytics")}
            icon={<LineChart />}
            label="Analytics"
          />
          <SidebarButton
            active={activeTab === "billing"}
            onClick={() => setActiveTab("billing")}
            icon={<CreditCard />}
            label="Billing"
          />
          <SidebarButton
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
            icon={<Settings />}
            label="Settings"
          />
        </nav>
      </div>
      
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <h3 className="font-semibold mb-2 text-white">Plan Usage</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Domains</span>
              <span className="font-medium text-gray-300">{domains.length}/5</span>
            </div>
            <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" 
                style={{ width: `${Math.min((domains.length / 5) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Storage</span>
              <span className="font-medium text-gray-300">8.2/25 GB</span>
            </div>
            <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: "33%" }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Bandwidth</span>
              <span className="font-medium text-gray-300">156/500 GB</span>
            </div>
            <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: "31%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
