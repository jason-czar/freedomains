
import React from "react";
import { Globe, Shield, Cpu, Compass, Zap, PenTool } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const features: Feature[] = [
  {
    title: "Easy Subdomain Management",
    description: "Search, register, and manage your subdomains in one intuitive dashboard.",
    icon: <Globe className="h-8 w-8" />,
    color: "bg-clay-lavender",
  },
  {
    title: "SSL Certificates",
    description: "Automatic SSL certificates via Let's Encrypt for all your subdomains.",
    icon: <Shield className="h-8 w-8" />,
    color: "bg-clay-mint",
  },
  {
    title: "Wildcard DNS Support",
    description: "Full wildcard DNS support for maximum flexibility with your subdomains.",
    icon: <Cpu className="h-8 w-8" />,
    color: "bg-clay-blue",
  },
  {
    title: "Custom Redirects",
    description: "Set up redirects to point your subdomain to any URL with custom rules.",
    icon: <Compass className="h-8 w-8" />,
    color: "bg-clay-peach",
  },
  {
    title: "Instant Deployment",
    description: "All changes to your subdomains propagate instantly across our global network.",
    icon: <Zap className="h-8 w-8" />,
    color: "bg-clay-pink",
  },
  {
    title: "Landing Page Builder",
    description: "Create beautiful landing pages for your subdomains without any coding.",
    icon: <PenTool className="h-8 w-8" />,
    color: "bg-clay-lavender",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20">
      <div className="clay-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your subdomains efficiently and securely.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="clay-card h-full transition-all duration-300 hover:translate-y-[-5px]"
            >
              <div className={`${feature.color} h-16 w-16 rounded-2xl flex items-center justify-center mb-6 shadow-clay-sm`}>
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
