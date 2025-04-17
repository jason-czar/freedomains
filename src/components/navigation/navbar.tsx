import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, Menu, User, LogOut, LayoutDashboard, LineChart, CreditCard, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface NavLink {
  title: string;
  href: string;
  authRequired?: boolean;
  guestOnly?: boolean;
}

const navLinks: NavLink[] = [{
  title: "Home",
  href: "/"
}, {
  title: "Features",
  href: "/features"
}, {
  title: "Pricing",
  href: "/pricing"
}, {
  title: "Dashboard",
  href: "/dashboard",
  authRequired: true
}];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, profile } = useAuth();

  const filteredLinks = navLinks.filter(link => {
    if (link.authRequired && !user) return false;
    if (link.guestOnly && user) return false;
    return true;
  });

  return <nav className="backdrop-blur-sm sticky top-0 z-50 bg-black/[0.64]">
      <div className="clay-container">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-[#11BA81] to-[#4ADE80]">GetMy.com.channel</span>
          </Link>
          <div className="hidden md:flex items-center space-x-1">
            {filteredLinks.map(link => <Link key={link.title} to={link.href} className="clay-nav-item">
                {link.title}
              </Link>)}
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="clay-button bg-white relative h-10 w-10 rounded-full">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.full_name} 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-indigo-100/50 flex items-center justify-center">
                        <User className="h-4 w-4 text-indigo-600" />
                      </div>
                    )}
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
                    <Link to="/dashboard?tab=analytics">
                      <LineChart className="mr-2 h-4 w-4" />
                      <span>Analytics</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard?tab=billing">
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
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost" className="clay-button bg-white text-indigo-600">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="clay-button-primary">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
          <Button variant="ghost" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 clay-container">
            {filteredLinks.map(link => (
              <Link key={link.title} to={link.href} className="block px-3 py-2 rounded-clay text-indigo-600 hover:bg-clay-lavender/50" onClick={() => setMobileMenuOpen(false)}>
                {link.title}
              </Link>
            ))}
            
            {user ? (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center px-3 py-2">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name} 
                      className="h-8 w-8 rounded-full object-cover mr-2" 
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-100/50 flex items-center justify-center mr-2">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                  )}
                  <span className="font-medium">{profile?.full_name || user.email}</span>
                </div>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="clay-button bg-white text-indigo-600 w-full justify-start mt-2">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/dashboard?tab=analytics" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="clay-button bg-white text-indigo-600 w-full justify-start mt-2">
                    <LineChart className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                </Link>
                <Link to="/dashboard?tab=billing" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="clay-button bg-white text-indigo-600 w-full justify-start mt-2">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </Button>
                </Link>
                <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="clay-button bg-white text-indigo-600 w-full justify-start mt-2">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Button>
                </Link>
                <Button variant="ghost" className="clay-button bg-white text-red-600 w-full justify-start mt-2" onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log out</span>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 mt-4 border-t border-gray-200 pt-4">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="clay-button bg-white text-indigo-600 w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="clay-button-primary w-full">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>;
};

export default Navbar;
