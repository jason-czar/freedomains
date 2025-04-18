
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const PricingPlans = () => {
  return (
    <div className="clay-container py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Register your subdomain for free and only pay when you need more. No hidden fees.
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Domain Registration Card */}
        <div className="clay-card">
          <div className="bg-clay-mint -mx-6 -mt-6 p-6 rounded-t-clay-lg">
            <h3 className="text-2xl font-bold">Domain Registration</h3>
            <p className="text-gray-700 mt-1">Perfect for getting started</p>
            
            <div className="mt-4">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-700 ml-2">first year</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Then $19.99/year
              </div>
            </div>
          </div>
          
          <ul className="mt-6 space-y-3">
            <li className="flex items-center">
              <Check className="text-green-500 mr-2 h-5 w-5" />
              <span>Free SSL certificate</span>
            </li>
            <li className="flex items-center">
              <Check className="text-green-500 mr-2 h-5 w-5" />
              <span>DNS management</span>
            </li>
            <li className="flex items-center">
              <Check className="text-green-500 mr-2 h-5 w-5" />
              <span>Domain forwarding</span>
            </li>
            <li className="flex items-center">
              <Check className="text-green-500 mr-2 h-5 w-5" />
              <span>Simple redirects</span>
            </li>
            <li className="flex items-center">
              <Check className="text-green-500 mr-2 h-5 w-5" />
              <span>Basic analytics</span>
            </li>
          </ul>
          
          <Button className="mt-8 w-full clay-button bg-clay-mint text-green-700">
            Register Domain
          </Button>
        </div>

        {/* Email Add-on Card */}
        <div className="clay-card">
          <div className="bg-clay-lavender -mx-6 -mt-6 p-6 rounded-t-clay-lg">
            <h3 className="text-2xl font-bold">Email Add-on</h3>
            <p className="text-gray-700 mt-1">Professional email hosting</p>
            
            <div className="mt-4">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">$4.99</span>
                <span className="text-gray-700 ml-2">/month</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Per domain
              </div>
            </div>
          </div>
          
          <ul className="mt-6 space-y-3">
            <li className="flex items-center">
              <Check className="text-green-500 mr-2 h-5 w-5" />
              <span>Custom email addresses</span>
            </li>
            <li className="flex items-center">
              <Check className="text-green-500 mr-2 h-5 w-5" />
              <span>Up to 5 mailboxes</span>
            </li>
            <li className="flex items-center">
              <Check className="text-green-500 mr-2 h-5 w-5" />
              <span>Spam protection</span>
            </li>
            <li className="flex items-center">
              <Check className="text-green-500 mr-2 h-5 w-5" />
              <span>IMAP/SMTP access</span>
            </li>
            <li className="flex items-center">
              <Check className="text-green-500 mr-2 h-5 w-5" />
              <span>24/7 email support</span>
            </li>
          </ul>
          
          <Button className="mt-8 w-full clay-button bg-clay-lavender text-indigo-700">
            Add Email Service
          </Button>
        </div>
      </div>

      {/* FAQ Section - simplified version */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
        <div className="max-w-3xl mx-auto grid gap-6">
          <div className="clay-card text-left">
            <h4 className="font-semibold mb-2">How does the free first year work?</h4>
            <p className="text-gray-600">Your domain registration is completely free for the first year. After that, it's just $19.99/year to keep your domain active.</p>
          </div>
          <div className="clay-card text-left">
            <h4 className="font-semibold mb-2">Can I add email service later?</h4>
            <p className="text-gray-600">Yes! You can add the email service to your domain at any time. It's $4.99/month and can be cancelled anytime.</p>
          </div>
          <div className="clay-card text-left">
            <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
            <p className="text-gray-600">We accept all major credit cards (Visa, Mastercard, American Express) and process payments securely through Stripe.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;
