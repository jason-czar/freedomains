
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LineChart, CreditCard, Settings, LogOut } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { useAuth } from "@/contexts/AuthContext";

interface AuthenticatedMenuItemsProps {
  onClose: () => void;
}

const AuthenticatedMenuItems = ({ onClose }: AuthenticatedMenuItemsProps) => {
  const { profile, user, signOut } = useAuth();

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="flex items-center px-3 py-2">
        <div className="mr-2">
          <UserAvatar profile={profile} size="sm" />
        </div>
        <span className="font-medium">{profile?.full_name || user?.email}</span>
      </div>
      <Link to="/dashboard" onClick={onClose}>
        <Button variant="ghost" className="clay-button bg-white text-indigo-600 w-full justify-start mt-2">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
      </Link>
      <Link to="/analytics" onClick={onClose}>
        <Button variant="ghost" className="clay-button bg-white text-indigo-600 w-full justify-start mt-2">
          <LineChart className="mr-2 h-4 w-4" />
          Analytics
        </Button>
      </Link>
      <Link to="/billing" onClick={onClose}>
        <Button variant="ghost" className="clay-button bg-white text-indigo-600 w-full justify-start mt-2">
          <CreditCard className="mr-2 h-4 w-4" />
          Billing
        </Button>
      </Link>
      <Link to="/settings" onClick={onClose}>
        <Button variant="ghost" className="clay-button bg-white text-indigo-600 w-full justify-start mt-2">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </Link>
      <Button 
        variant="ghost" 
        className="clay-button bg-white text-red-600 w-full justify-start mt-2" 
        onClick={() => {
          signOut();
          onClose();
        }}
      >
        <LogOut className="h-4 w-4 mr-2" />
        <span>Log out</span>
      </Button>
    </div>
  );
};

export default AuthenticatedMenuItems;
