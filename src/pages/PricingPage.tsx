import React from "react";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import PricingPlans from "@/components/ui/pricing-plans";
import { CheckCircle, XCircle } from "lucide-react";
const PricingPage = () => {
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 bg-[#08070e]">
          <div className="clay-container">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Choose the plan that's right for your needs. All plans include core features.
              </p>
            </div>
          </div>
        </section>
        
        {/* Pricing Plans */}
        <PricingPlans />
        
        {/* FAQ Section */}
        <section className="py-20 bg-clay-blue/10">
          <div className="clay-container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Find answers to common questions about our platform and pricing.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              {[{
              question: "Can I upgrade or downgrade my plan later?",
              answer: "Yes, you can upgrade or downgrade your plan at any time. When you upgrade, you'll be charged the prorated difference between plans. When downgrading, the new rate will apply at the start of your next billing cycle."
            }, {
              question: "What payment methods do you accept?",
              answer: "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. All payments are processed securely through Stripe."
            }, {
              question: "Is there a free trial available?",
              answer: "Yes, we offer a 14-day free trial on all plans. No credit card is required to start your trial."
            }, {
              question: "How does subdomain registration work?",
              answer: "Once you've created an account, you can immediately search for and register available subdomains under com.channel. All registered subdomains are automatically set up with SSL certificates."
            }, {
              question: "Can I transfer my existing subdomain?",
              answer: "Currently, we only support registering new subdomains directly through our platform. If you have an existing subdomain you'd like to use, please contact our support team."
            }, {
              question: "Do you offer refunds?",
              answer: "We offer a 30-day money-back guarantee on all plans. If you're not satisfied with our service within the first 30 days, you can request a full refund by contacting our support team."
            }].map((faq, index) => <div key={index} className="clay-card">
                  <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>)}
            </div>
          </div>
        </section>
        
        {/* Compare Plans Section */}
        <section className="py-20">
          <div className="clay-container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Compare Plans</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                A detailed comparison of features across all plans.
              </p>
            </div>
            
            <div className="clay-panel overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-4 px-6 text-gray-500 font-medium">Features</th>
                    <th className="py-4 px-6 text-center">
                      <div className="font-semibold text-xl">Starter</div>
                      <div className="text-indigo-600 font-bold">$9.99/mo</div>
                    </th>
                    <th className="py-4 px-6 text-center bg-clay-lavender/20 rounded-t-lg">
                      <div className="font-semibold text-xl">Professional</div>
                      <div className="text-indigo-600 font-bold">$24.99/mo</div>
                      <div className="text-xs font-bold text-indigo-600 mt-1">MOST POPULAR</div>
                    </th>
                    <th className="py-4 px-6 text-center">
                      <div className="font-semibold text-xl">Enterprise</div>
                      <div className="text-indigo-600 font-bold">$49.99/mo</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[{
                  feature: "Number of Subdomains",
                  starter: "1",
                  pro: "5",
                  enterprise: "Unlimited"
                }, {
                  feature: "Storage",
                  starter: "5GB",
                  pro: "25GB",
                  enterprise: "100GB"
                }, {
                  feature: "SSL Certificates",
                  starter: "Basic",
                  pro: "Advanced",
                  enterprise: "Premium"
                }, {
                  feature: "Redirects",
                  starter: "Simple",
                  pro: "Advanced",
                  enterprise: "Advanced"
                }, {
                  feature: "Custom Landing Pages",
                  starter: false,
                  pro: true,
                  enterprise: true
                }, {
                  feature: "Analytics",
                  starter: "Basic",
                  pro: "Detailed",
                  enterprise: "Enterprise"
                }, {
                  feature: "Wildcard DNS",
                  starter: false,
                  pro: false,
                  enterprise: true
                }, {
                  feature: "Team Members",
                  starter: "1",
                  pro: "3",
                  enterprise: "Unlimited"
                }, {
                  feature: "Custom Domains",
                  starter: false,
                  pro: true,
                  enterprise: true
                }, {
                  feature: "Priority Support",
                  starter: false,
                  pro: true,
                  enterprise: true
                }, {
                  feature: "API Access",
                  starter: false,
                  pro: true,
                  enterprise: true
                }, {
                  feature: "Uptime SLA",
                  starter: "99.9%",
                  pro: "99.95%",
                  enterprise: "99.99%"
                }].map((row, index) => <tr key={index} className={`border-b border-gray-200 ${index % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                      <td className="py-4 px-6 font-medium">{row.feature}</td>
                      <td className="py-4 px-6 text-center">
                        {typeof row.starter === 'boolean' ? row.starter ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <XCircle className="h-5 w-5 text-gray-300 mx-auto" /> : row.starter}
                      </td>
                      <td className="py-4 px-6 text-center bg-clay-lavender/10">
                        {typeof row.pro === 'boolean' ? row.pro ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <XCircle className="h-5 w-5 text-gray-300 mx-auto" /> : row.pro}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {typeof row.enterprise === 'boolean' ? row.enterprise ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <XCircle className="h-5 w-5 text-gray-300 mx-auto" /> : row.enterprise}
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        
        {/* Enterprise Section */}
        <section className="py-20 bg-clay-lavender/10">
          <div className="clay-container">
            <div className="clay-panel max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">Need a Custom Solution?</h2>
                  <p className="text-gray-600 mb-6">
                    Contact our sales team to discuss custom solutions for enterprise needs, including:
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">Custom SLAs and dedicated support</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">Volume discounts for large deployments</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">Enhanced security features</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">Custom integrations with your existing tools</span>
                    </li>
                  </ul>
                  
                  <a href="/contact" className="clay-button-primary inline-block">
                    Contact Sales
                  </a>
                </div>
                
                <div className="flex-1">
                  <div className="clay-card h-64 flex items-center justify-center">
                    <div className="text-8xl text-gray-300">Image</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
};
export default PricingPage;