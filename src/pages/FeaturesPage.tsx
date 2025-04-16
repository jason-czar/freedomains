
import React from "react";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import FeaturesSection from "@/components/ui/features-section";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Globe, Shield, Zap, Box, LineChart, UserPlus } from "lucide-react";

const FeatureDetail = ({ title, description, icon, color, imageRight = false }) => {
  return (
    <div className="py-16">
      <div className="clay-container">
        <div className={`flex flex-col ${imageRight ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12`}>
          <div className="flex-1">
            <div className={`${color} inline-block p-3 rounded-clay-lg shadow-clay-sm mb-6`}>
              {icon}
            </div>
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            <p className="text-gray-600 mb-6 text-lg">{description}</p>
            
            <ul className="space-y-3 mb-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi.</span>
                </li>
              ))}
            </ul>
            
            <Link to="/pricing">
              <Button className="clay-button-primary">
                Get Started
              </Button>
            </Link>
          </div>
          
          <div className="flex-1">
            <div className="clay-card h-64 flex items-center justify-center">
              <div className="text-8xl text-gray-300">Image</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturesPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 bg-clay-lavender/10">
          <div className="clay-container">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Powerful Features for Your Subdomains
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Everything you need to register, manage, and optimize your subdomains in one platform.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/signup">
                  <Button className="clay-button-primary">
                    Sign Up Free
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="ghost" className="clay-button bg-white text-indigo-600">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Detailed Features */}
        <FeatureDetail 
          title="Simple Subdomain Management"
          description="Register and manage all your subdomains from one intuitive dashboard. Search, register, and configure with just a few clicks."
          icon={<Globe className="h-8 w-8 text-indigo-600" />}
          color="bg-clay-lavender"
        />
        
        <FeatureDetail 
          title="Automatic SSL Certificates"
          description="Secure your subdomains automatically with Let's Encrypt SSL certificates. No technical configuration required."
          icon={<Shield className="h-8 w-8 text-green-600" />}
          color="bg-clay-mint"
          imageRight={true}
        />
        
        <FeatureDetail 
          title="Instant Propagation"
          description="All your subdomain changes propagate instantly across our global network. No more waiting for DNS updates."
          icon={<Zap className="h-8 w-8 text-amber-600" />}
          color="bg-clay-peach"
        />
        
        <FeatureDetail 
          title="Landing Page Builder"
          description="Create beautiful landing pages for your subdomains without any coding using our drag-and-drop builder."
          icon={<Box className="h-8 w-8 text-blue-600" />}
          color="bg-clay-blue"
          imageRight={true}
        />
        
        <FeatureDetail 
          title="Advanced Analytics"
          description="Get detailed insights on traffic and performance for all your subdomains with our built-in analytics."
          icon={<LineChart className="h-8 w-8 text-pink-600" />}
          color="bg-clay-pink"
        />
        
        <FeatureDetail 
          title="Team Collaboration"
          description="Invite team members and collaborate on subdomain management with role-based permissions."
          icon={<UserPlus className="h-8 w-8 text-indigo-600" />}
          color="bg-clay-lavender"
          imageRight={true}
        />
        
        {/* All Features Section */}
        <section className="py-20 bg-clay-blue/10">
          <div className="clay-container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">All Features</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                A comprehensive overview of everything Domain Channel has to offer.
              </p>
            </div>
            
            <FeaturesSection />
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20">
          <div className="clay-container">
            <div className="clay-panel max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of customers who trust Domain Channel for their subdomain needs.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/signup">
                  <Button className="clay-button-primary text-lg px-8 py-4">
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="ghost" className="clay-button bg-white text-indigo-600 text-lg px-8 py-4">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
