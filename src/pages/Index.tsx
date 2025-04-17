import React from "react";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import HeroSection from "@/components/ui/hero-section";
import FeaturesSection from "@/components/ui/features-section";
import PricingPlans from "@/components/ui/pricing-plans";
const Index = () => {
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <div className="py-12 bg-clay-mint/0 backdrop-blur-3xl animate-float">
          <FeaturesSection />
        </div>
        <PricingPlans className="py-16" />
        
        {/* Testimonials Section */}
        <section className="py-20 bg-clay-blue/10">
          <div className="clay-container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Trusted by thousands of businesses and developers worldwide.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[{
              name: "Sarah Johnson",
              role: "Web Developer",
              quote: "Domain Channel made it incredibly easy to set up and manage subdomains for all my client projects. The landing page builder is a game-changer!",
              avatar: "SJ",
              color: "bg-clay-lavender"
            }, {
              name: "Michael Chen",
              role: "Startup Founder",
              quote: "We use Domain Channel for all our product subdomains. The SSL certificates and redirect functionality work flawlessly. Highly recommended!",
              avatar: "MC",
              color: "bg-clay-mint"
            }, {
              name: "Emily Rodriguez",
              role: "Marketing Director",
              quote: "The analytics features have been invaluable for our marketing campaigns. Setting up new domains takes seconds, not hours.",
              avatar: "ER",
              color: "bg-clay-peach"
            }].map((testimonial, index) => <div key={index} className="clay-card">
                  <div className="flex items-start mb-4">
                    <div className={`${testimonial.color} h-12 w-12 rounded-full flex items-center justify-center mr-4 shadow-clay-sm`}>
                      <span className="font-semibold text-indigo-800">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                </div>)}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20">
          <div className="clay-container">
            <div className="clay-panel max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl">
                  <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                  <p className="text-gray-600 mb-6">
                    Join thousands of businesses and developers who trust Domain Channel for their subdomain needs.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a href="/signup" className="clay-button-primary">
                      Sign Up Now
                    </a>
                    <a href="/contact" className="clay-button bg-white text-indigo-600">
                      Contact Sales
                    </a>
                  </div>
                </div>
                <div className="h-64 w-64 rounded-clay-lg bg-gradient-to-br from-clay-lavender/80 to-clay-blue/80 shadow-clay-md flex items-center justify-center">
                  <span className="text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-indigo-700 to-blue-700">D</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
};
export default Index;