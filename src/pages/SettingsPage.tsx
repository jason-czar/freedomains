
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, User as UserIcon } from "lucide-react";

const SettingsPage = () => {
  const { user, profile, profileLoading, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    // Update form when profile data loads
    if (profile) {
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await updateProfile({
        full_name: fullName,
        avatar_url: avatarUrl
      });

      if (error) {
        toast.error("Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2">Loading profile...</span>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-10 bg-clay-base/30">
        <div className="clay-container">
          <div className="clay-card">
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
            <p className="text-gray-600 mb-6">
              Manage your account preferences and personal information.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Profile</h3>
                <div className="flex items-center mb-6">
                  <div className="mr-4">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt={fullName} 
                        className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                        <UserIcon className="h-10 w-10 text-indigo-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Profile Picture</p>
                    <p className="text-xs text-gray-500 mb-2">
                      For best results, use an image at least 128px by 128px in .jpg or .png format
                    </p>
                    <Input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="Enter image URL"
                      className="clay-input max-w-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <Input 
                      className="clay-input" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input 
                      className="clay-input bg-gray-50" 
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
                <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                <div className="space-y-3">
                  {[
                    { id: "email-marketing", label: "Marketing emails" },
                    { id: "email-system", label: "System notifications" },
                    { id: "email-billing", label: "Billing updates" },
                    { id: "email-security", label: "Security alerts" },
                  ].map((pref) => (
                    <div key={pref.id} className="flex items-center">
                      <input
                        id={pref.id}
                        type="checkbox"
                        defaultChecked={pref.id !== "email-marketing"}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={pref.id} className="ml-2 block text-sm text-gray-700">
                        {pref.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200 flex justify-end space-x-4">
                <Button type="button" variant="ghost" className="clay-button bg-white text-gray-700">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="clay-button-primary"
                  disabled={saving}
                >
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
    </div>
  );
};

// Wrap the component with ProtectedRoute to prevent unauthorized access
const ProtectedSettingsPage = () => (
  <ProtectedRoute>
    <SettingsPage />
  </ProtectedRoute>
);

export default ProtectedSettingsPage;
