import React from "react";
import { Button } from "@/components/ui/button";
import { Globe, Settings, CreditCard, LineChart } from "lucide-react";
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
  label
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => <button className={`w-full py-2 px-3 rounded-lg flex items-center transition-all duration-300 ${active ? "bg-gray-800/70 text-green-400 font-medium border-l-2 border-green-400" : "text-gray-300 hover:bg-gray-800/30 hover:text-gray-100"}`} onClick={onClick}>
    {React.cloneElement(icon as React.ReactElement, {
    className: `h-5 w-5 mr-3 ${active ? "text-green-400" : "text-gray-400"}`
  })}
    {label}
  </button>;
const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
  selectedDomain,
  domains,
  navigate
}) => {
  const {
    user
  } = useAuth();
  return <aside className="w-full md:w-64 space-y-4">
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
          <SidebarButton active={activeTab === "domains"} onClick={() => setActiveTab("domains")} icon={<Globe />} label="Domains" />
          <SidebarButton active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} icon={<LineChart />} label="Analytics" />
          <SidebarButton active={activeTab === "billing"} onClick={() => setActiveTab("billing")} icon={<CreditCard />} label="Billing" />
          <SidebarButton active={activeTab === "settings"} onClick={() => setActiveTab("settings")} icon={<Settings />} label="Settings" />
        </nav>
      </div>
      
      
    </aside>;
};
export default DashboardSidebar;