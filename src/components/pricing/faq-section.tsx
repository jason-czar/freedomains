
import React from "react";

interface FaqItemProps {
  question: string;
  answer: string;
}

export const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
  return (
    <div className="clay-card text-left">
      <h4 className="font-semibold mb-2">{question}</h4>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
};

interface FaqSectionProps {
  faqs: FaqItemProps[];
}

export const FaqSection: React.FC<FaqSectionProps> = ({ faqs }) => {
  return (
    <div className="mt-16 text-center">
      <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
      <div className="max-w-3xl mx-auto grid gap-6">
        {faqs.map((faq, index) => (
          <FaqItem key={index} {...faq} />
        ))}
      </div>
    </div>
  );
};
