
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SettingsTab: React.FC = () => {
  return (
    <div className="clay-card">
      <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
      <p className="text-gray-600 mb-6">
        Manage your account preferences and personal information.
      </p>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input className="clay-input" defaultValue="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input className="clay-input" defaultValue="john@example.com" />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Password</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <Input className="clay-input" type="password" placeholder="••••••••" />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <Input className="clay-input" type="password" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <Input className="clay-input" type="password" placeholder="••••••••" />
              </div>
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
          <Button variant="ghost" className="clay-button bg-white text-gray-700">
            Cancel
          </Button>
          <Button className="clay-button-primary">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
