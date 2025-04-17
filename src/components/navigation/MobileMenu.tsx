
import NavLinks from "./NavLinks";
import AuthenticatedMenuItems from "./AuthenticatedMenuItems";
import GuestMenuItems from "./GuestMenuItems";
import { useAuth } from "@/contexts/AuthContext";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: Array<{
    title: string;
    href: string;
    authRequired?: boolean;
    guestOnly?: boolean;
  }>;
}

const MobileMenu = ({ isOpen, onClose, navLinks }: MobileMenuProps) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 clay-container">
        <NavLinks links={navLinks} user={user} mobile onClick={onClose} />
        
        {user ? (
          <AuthenticatedMenuItems onClose={onClose} />
        ) : (
          <GuestMenuItems onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
