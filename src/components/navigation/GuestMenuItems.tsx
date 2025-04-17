
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface GuestMenuItemsProps {
  onClose: () => void;
}

const GuestMenuItems = ({ onClose }: GuestMenuItemsProps) => {
  return (
    <div className="flex flex-col space-y-2 mt-4 border-t border-gray-200 pt-4">
      <Link to="/login" onClick={onClose}>
        <Button variant="ghost" className="clay-button bg-white text-indigo-600 w-full">
          Log in
        </Button>
      </Link>
      <Link to="/signup" onClick={onClose}>
        <Button className="clay-button-primary w-full">
          Sign up
        </Button>
      </Link>
    </div>
  );
};

export default GuestMenuItems;
