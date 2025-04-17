
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import NavLinks from "./NavLinks";
import UserDropdown from "./UserDropdown";
import MobileMenu from "./MobileMenu";

const navLinks = [{
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
  const { user } = useAuth();

  return (
    <nav className="backdrop-blur-sm sticky top-0 z-50 bg-black/[0.64]">
      <div className="clay-container">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-[#11BA81] to-[#4ADE80]">
              GetMy.com.channel
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            <NavLinks links={navLinks} user={user} />
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <UserDropdown />
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
          
          <Button 
            variant="ghost" 
            className="md:hidden" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      <MobileMenu 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navLinks={navLinks}
      />
    </nav>
  );
};

export default Navbar;
