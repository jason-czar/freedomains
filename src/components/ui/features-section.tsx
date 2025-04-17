import React from "react";
import { Globe, Shield, Cpu, Compass, Zap, PenTool } from "lucide-react";
interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}
const features: Feature[] = [{
  title: "Easy Subdomain Management",
  description: "Search, register, and manage your subdomains in one intuitive dashboard.",
  icon: <Globe className="h-8 w-8" />,
  color: "bg-indigo-900/30 text-indigo-400 border-indigo-500/20"
}, {
  title: "SSL Certificates",
  description: "Automatic SSL certificates via Let's Encrypt for all your subdomains.",
  icon: <Shield className="h-8 w-8" />,
  color: "bg-emerald-900/30 text-emerald-400 border-emerald-500/20"
}, {
  title: "Wildcard DNS Support",
  description: "Full wildcard DNS support for maximum flexibility with your subdomains.",
  icon: <Cpu className="h-8 w-8" />,
  color: "bg-blue-900/30 text-blue-400 border-blue-500/20"
}, {
  title: "Custom Redirects",
  description: "Set up redirects to point your subdomain to any URL with custom rules.",
  icon: <Compass className="h-8 w-8" />,
  color: "bg-orange-900/30 text-orange-400 border-orange-500/20"
}, {
  title: "Instant Deployment",
  description: "All changes to your subdomains propagate instantly across our global network.",
  icon: <Zap className="h-8 w-8" />,
  color: "bg-yellow-900/30 text-yellow-400 border-yellow-500/20"
}, {
  title: "Landing Page Builder",
  description: "Create beautiful landing pages for your subdomains without any coding.",
  icon: <PenTool className="h-8 w-8" />,
  color: "bg-purple-900/30 text-purple-400 border-purple-500/20"
}];
const FeaturesSection = () => {
  return <section className="py-[33px]">
      <div className="clay-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-white">Powerful Features</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Everything you need to manage your subdomains efficiently and securely.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => <div key={index} className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,255,165,0.08)] hover:-translate-y-1 h-full">
              <div className={`${feature.color} h-16 w-16 rounded-2xl flex items-center justify-center mb-6 shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-opacity-20`}>
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>)}
        </div>
      </div>
    </section>;
};
export default FeaturesSection;