
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingFeature {
  text: string;
}

interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string;
  priceSubtext: string;
  priceNote?: string;
  features: PricingFeature[];
  buttonText: string;
  buttonVariant?: "mint" | "lavender";
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  subtitle,
  price,
  priceSubtext,
  priceNote,
  features,
  buttonText,
  buttonVariant = "mint"
}) => {
  return (
    <div className="clay-card">
      <div className={`bg-clay-${buttonVariant} -mx-6 -mt-6 p-6 rounded-t-clay-lg`}>
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-gray-700 mt-1">{subtitle}</p>
        
        <div className="mt-4">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold">{price}</span>
            <span className="text-gray-700 ml-2">{priceSubtext}</span>
          </div>
          {priceNote && (
            <div className="text-sm text-gray-600 mt-1">
              {priceNote}
            </div>
          )}
        </div>
      </div>
      
      <ul className="mt-6 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="text-green-500 mr-2 h-5 w-5" />
            <span>{feature.text}</span>
          </li>
        ))}
      </ul>
      
      <Button 
        className={`mt-8 w-full clay-button bg-clay-${buttonVariant} ${
          buttonVariant === 'mint' ? 'text-green-700' : 'text-indigo-700'
        }`}
      >
        {buttonText}
      </Button>
    </div>
  );
};
