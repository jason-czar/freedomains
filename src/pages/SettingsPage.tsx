import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, User as UserIcon } from "lucide-react";
import AvatarUpload from "@/components/profile/AvatarUpload";

const SettingsPage = () => {
  const {
    user,
    profile,
    profileLoading,
    updateProfile
  } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const {
        error
      } = await updateProfile({
        full_name: fullName
      });
      if (error) {
        toast.error("Failed to update profile");
      } else {
        toast.success("Profile updated successfully");
      }
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
    return <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2">Loading profile...</span>
        </main>
        <Footer />
      </div>;
  }

  return <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-10 bg-black">
        <div className="clay-container">
          <div className="bg-black/90 rounded-lg p-8 shadow-xl border border-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-white">Account Settings</h2>
            <p className="text-gray-400 mb-6">
              Manage your account preferences and personal information.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Profile</h3>
                <div className="flex items-center mb-6">
                  <div className="mr-4">
                    {profile?.avatar_url ? 
                      <img src={profile.avatar_url} alt={fullName} className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100" /> : 
                      <div className="w-20 h-20 rounded-full bg-indigo-100/50 flex items-center justify-center">
                        <UserIcon className="h-10 w-10 text-green-500" />
                      </div>}
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Profile Picture</p>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload a new profile picture in JPG or PNG format
                    </p>
                    <AvatarUpload userId={user?.id || ""} currentAvatarUrl={profile?.avatar_url || null} onAvatarChange={url => {
                    updateProfile({
                      avatar_url: url
                    });
                  }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Full Name
                    </label>
                    <Input 
                      className="clay-input bg-black/50 border-gray-800 text-white" 
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)} 
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Email Address
                    </label>
                    <Input 
                      className="clay-input bg-black/50 border-gray-800 text-gray-400" 
                      value={user?.email || ""} 
                      disabled 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email address cannot be changed
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Current Password
                    </label>
                    <Input 
                      className="clay-input bg-black/50 border-gray-800 text-white" 
                      type="password" 
                      placeholder="••••••••" 
                    />
                  </div>
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        New Password
                      </label>
                      <Input 
                        className="clay-input bg-black/50 border-gray-800 text-white" 
                        type="password" 
                        placeholder="••••••••" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Confirm New Password
                      </label>
                      <Input 
                        className="clay-input bg-black/50 border-gray-800 text-white" 
                        type="password" 
                        placeholder="••••••••" 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Notification Preferences</h3>
                <div className="space-y-3">
                  {[
                    { id: "email-marketing", label: "Marketing emails" },
                    { id: "email-system", label: "System notifications" },
                    { id: "email-billing", label: "Billing updates" },
                    { id: "email-security", label: "Security alerts" },
                  ].map(pref => (
                    <div key={pref.id} className="flex items-center">
                      <input
                        id={pref.id}
                        type="checkbox"
                        defaultChecked={pref.id !== "email-marketing"}
                        className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-700 rounded bg-black/50"
                      />
                      <label htmlFor={pref.id} className="ml-2 block text-sm text-gray-400">
                        {pref.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-800 flex justify-end space-x-4">
                <Button type="button" variant="ghost" className="clay-button bg-gray-900 text-gray-400 hover:bg-gray-800">
                  Cancel
                </Button>
                <Button type="submit" className="clay-button-primary bg-green-500 hover:bg-green-600 text-white" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>;
};

export default SettingsPage;
