
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LineChart, CreditCard, Settings, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import UserAvatar from "./UserAvatar";
import { useAuth } from "@/contexts/AuthContext";

const UserDropdown = () => {
  const { profile, signOut } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="clay-button bg-white relative h-10 w-10 rounded-full">
          <UserAvatar profile={profile} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {profile?.full_name || "My Account"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/analytics">
            <LineChart className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/billing">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
