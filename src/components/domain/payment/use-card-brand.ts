
type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'unionpay' | 'unknown';

export const useCardBrand = () => {
  const detectCardBrand = (cardNumber: string): CardBrand => {
    // Remove spaces and non-digit characters
    const cleanNumber = cardNumber.replace(/\D/g, '');
    
    // Card detection logic
    if (/^4/.test(cleanNumber)) {
      return 'visa';
    } else if (/^(5[1-5]|2[2-7])/.test(cleanNumber)) {
      return 'mastercard';
    } else if (/^3[47]/.test(cleanNumber)) {
      return 'amex';
    } else if (/^(6011|65|64[4-9]|622)/.test(cleanNumber)) {
      return 'discover';
    } else if (/^(36|38|39|30[0-5])/.test(cleanNumber)) {
      return 'diners';
    } else if (/^35/.test(cleanNumber)) {
      return 'jcb';
    } else if (/^(62|81)/.test(cleanNumber)) {
      return 'unionpay';
    } else {
      return 'unknown';
    }
  };

  return { detectCardBrand };
};
