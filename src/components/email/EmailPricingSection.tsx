
import React from "react";

const EmailPricingSection = () => {
  return (
    <div className="mt-4 pt-4 border-t border-indigo-800/30">
      <div className="flex items-baseline">
        <span className="text-2xl font-bold text-white">$4.99</span>
        <span className="text-gray-400 ml-1">/month</span>
      </div>
      <p className="text-gray-500 text-sm mt-1">Billed monthly, cancel anytime</p>
    </div>
  );
};

export default EmailPricingSection;
