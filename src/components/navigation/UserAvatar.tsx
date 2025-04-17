
import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface UserAvatarProps {
  profile?: {
    full_name: string;
    avatar_url?: string;
  };
  size?: "sm" | "default";
}

const UserAvatar = ({ profile, size = "default" }: UserAvatarProps) => {
  const dimensions = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  
  if (profile?.avatar_url) {
    return (
      <img 
        src={profile.avatar_url} 
        alt={profile.full_name} 
        className={`${dimensions} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${dimensions} rounded-full bg-indigo-100/50 flex items-center justify-center`}>
      <User className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
    </div>
  );
};

export default UserAvatar;
