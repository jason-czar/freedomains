import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
interface PlanFeature {
  name: string;
  included: boolean;
}
interface PricingPlan {
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: PlanFeature[];
  color: string;
  popular?: boolean;
}
const plans: PricingPlan[] = [{
  name: "Starter",
  price: {
    monthly: 9.99,
    yearly: 99.99
  },
  description: "Perfect for personal projects",
  color: "bg-clay-mint",
  features: [{
    name: "1 Subdomain",
    included: true
  }, {
    name: "Basic SSL",
    included: true
  }, {
    name: "5GB Storage",
    included: true
  }, {
    name: "Simple Redirect",
    included: true
  }, {
    name: "Basic Analytics",
    included: true
  }, {
    name: "Email Support",
    included: true
  }, {
    name: "Custom Landing Page",
    included: false
  }, {
    name: "Wildcard DNS",
    included: false
  }]
}, {
  name: "Professional",
  price: {
    monthly: 24.99,
    yearly: 249.99
  },
  description: "Best for growing businesses",
  color: "bg-clay-lavender",
  popular: true,
  features: [{
    name: "5 Subdomains",
    included: true
  }, {
    name: "Advanced SSL",
    included: true
  }, {
    name: "25GB Storage",
    included: true
  }, {
    name: "Advanced Redirects",
    included: true
  }, {
    name: "Detailed Analytics",
    included: true
  }, {
    name: "Priority Support",
    included: true
  }, {
    name: "Custom Landing Page",
    included: true
  }, {
    name: "Wildcard DNS",
    included: false
  }]
}, {
  name: "Enterprise",
  price: {
    monthly: 49.99,
    yearly: 499.99
  },
  description: "For large scale operations",
  color: "bg-clay-blue",
  features: [{
    name: "Unlimited Subdomains",
    included: true
  }, {
    name: "Premium SSL",
    included: true
  }, {
    name: "100GB Storage",
    included: true
  }, {
    name: "Advanced Redirects",
    included: true
  }, {
    name: "Enterprise Analytics",
    included: true
  }, {
    name: "24/7 Support",
    included: true
  }, {
    name: "Custom Landing Page",
    included: true
  }, {
    name: "Wildcard DNS",
    included: true
  }]
}];
interface PricingPlansProps {
  className?: string;
}
const PricingPlans = ({
  className
}: PricingPlansProps) => {
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "yearly">("monthly");
  return <div className={`${className} clay-container py-16`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your subdomain needs. All plans include SSL and our powerful management dashboard.
        </p>
        
        <div className="flex items-center justify-center mt-8 rounded-clay-lg p-1.5 shadow-clay-sm inline-flex bg-[#b2b2b2]/[0.19] my-[40px]">
          <button onClick={() => setBillingCycle("monthly")} className={`px-6 py-2 rounded-clay transition-all ${billingCycle === "monthly" ? "clay-button-primary" : "text-gray-500 hover:bg-gray-800/50"}`}>
            Monthly
          </button>
          <button onClick={() => setBillingCycle("yearly")} className={`px-6 py-2 rounded-clay transition-all ${billingCycle === "yearly" ? "clay-button-primary" : "text-gray-500 hover:bg-gray-800/50"}`}>
            Yearly <span className="text-xs font-bold text-green-600 ml-1">Save 20%</span>
          </button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map(plan => <div key={plan.name} className={`clay-card relative ${plan.popular ? 'transform -translate-y-4' : ''}`}>
            {plan.popular && <div className="absolute -top-4 left-0 right-0 text-center">
                <span className="bg-gradient-to-r from-amber-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>}
            
            <div className={`${plan.color} -mx-6 -mt-6 p-6 rounded-t-clay-lg`}>
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-gray-700 mt-1">{plan.description}</p>
              
              <div className="mt-4">
                <span className="text-4xl font-bold">${billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly}</span>
                <span className="text-gray-700">/{billingCycle === "monthly" ? "month" : "year"}</span>
              </div>
            </div>
            
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature, index) => <li key={index} className="flex items-center">
                  {feature.included ? <Check className="text-green-500 mr-2 h-5 w-5" /> : <span className="text-gray-300 mr-2">✕</span>}
                  <span className={feature.included ? "" : "text-gray-400"}>{feature.name}</span>
                </li>)}
            </ul>
            
            <Button className={`mt-8 w-full clay-button ${plan.name === "Starter" ? "bg-clay-mint text-green-700" : plan.name === "Professional" ? "bg-clay-lavender text-indigo-700" : "bg-clay-blue text-blue-700"}`}>
              Get Started
            </Button>
          </div>)}
      </div>
    </div>;
};
export default PricingPlans;