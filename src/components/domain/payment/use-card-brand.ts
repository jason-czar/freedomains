
export const useCardBrand = () => {
  const detectCardBrand = (cardNumber: string): string => {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
    };

    if (patterns.visa.test(cardNumber)) return "visa";
    if (patterns.mastercard.test(cardNumber)) return "mastercard";
    if (patterns.amex.test(cardNumber)) return "amex";
    if (patterns.discover.test(cardNumber)) return "discover";
    return "unknown";
  };

  return { detectCardBrand };
};
