import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DomainSearch from "@/components/ui/domain-search";
const HeroSection = () => {
  return <section className="pt-20 pb-32 relative overflow-hidden bg-gradient-to-b from-transparent to-[#08070e]">
      {/* Clay-like decorative blobs */}
      <div className="absolute top-20 right-[10%] h-64 w-64 rounded-full bg-clay-lavender/40 blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-[5%] h-40 w-40 rounded-full bg-clay-mint/30 blur-3xl animate-float" style={{
      animationDelay: "1s"
    }}></div>
      <div className="absolute top-40 left-[15%] h-72 w-72 rounded-full bg-clay-blue/20 blur-3xl animate-float" style={{
      animationDelay: "2s"
    }}></div>
      
      <div className="clay-container relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Find Your Perfect{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#11BA81] to-[#4ADE80]">
              Subdomain
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Search, register, and manage subdomains under com.channel with our easy-to-use platform.
            Get SSL certificates, landing pages, and more.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/signup">
              <Button className="clay-button-primary text-lg px-8 py-4">
                Get Started
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="ghost" className="clay-button text-lg px-8 py-4 bg-[#5c5c5c]/65 text-green-400">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
        
        <DomainSearch />
        
        
      </div>
    </section>;
};
export default HeroSection;