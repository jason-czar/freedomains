
import React from "react";
import { cn } from "@/lib/utils";
import { PricingCard } from "@/components/pricing/pricing-card";
import { FaqSection } from "@/components/pricing/faq-section";

interface PricingPlansProps extends React.HTMLAttributes<HTMLDivElement> {}

const PricingPlans: React.FC<PricingPlansProps> = ({ className, ...props }) => {
  const domainFeatures = [
    { text: "Free SSL certificate" },
    { text: "DNS management" },
    { text: "Domain forwarding" },
    { text: "Simple redirects" },
    { text: "Basic analytics" }
  ];

  const emailFeatures = [
    { text: "Custom email addresses" },
    { text: "Up to 5 mailboxes" },
    { text: "Spam protection" },
    { text: "IMAP/SMTP access" },
    { text: "24/7 email support" }
  ];

  const faqs = [
    {
      question: "How does the free first year work?",
      answer: "Your domain registration is completely free for the first year. After that, it's just $19.99/year to keep your domain active."
    },
    {
      question: "Can I add email service later?",
      answer: "Yes! You can add the email service to your domain at any time. It's $4.99/month and can be cancelled anytime."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express) and process payments securely through Stripe."
    }
  ];

  return (
    <div className={cn("clay-container py-16", className)} {...props}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Register your subdomain for free and only pay when you need more. No hidden fees.
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        <PricingCard
          title="Domain Registration"
          subtitle="Perfect for getting started"
          price="$0"
          priceSubtext="first year"
          priceNote="Then $19.99/year"
          features={domainFeatures}
          buttonText="Register Domain"
          buttonVariant="mint"
        />

        <PricingCard
          title="Email Add-on"
          subtitle="Professional email hosting"
          price="$4.99"
          priceSubtext="/month"
          priceNote="Per domain"
          features={emailFeatures}
          buttonText="Add Email Service"
          buttonVariant="lavender"
        />
      </div>

      <FaqSection faqs={faqs} />
    </div>
  );
};

export default PricingPlans;
