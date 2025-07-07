
// Credit card validation utilities with security measures
export const validateCreditCard = (cardNumber: string): { isValid: boolean; cardType: string } => {
  // Remove spaces and non-numeric characters
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  // Check length
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return { isValid: false, cardType: 'unknown' };
  }
  
  // Luhn algorithm for validation
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  const isValid = sum % 10 === 0;
  const cardType = detectCardType(cleanNumber);
  
  return { isValid, cardType };
};

const detectCardType = (cardNumber: string): string => {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    jcb: /^(?:2131|1800|35\d{3})/
  };
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNumber)) {
      return type;
    }
  }
  
  return 'unknown';
};

export const validateCVV = (cvv: string, cardType: string): boolean => {
  const cleanCVV = cvv.replace(/\D/g, '');
  
  if (cardType === 'amex') {
    return cleanCVV.length === 4;
  }
  
  return cleanCVV.length === 3;
};

export const validateExpiryDate = (expiry: string): boolean => {
  const cleanExpiry = expiry.replace(/\D/g, '');
  
  if (cleanExpiry.length !== 4) {
    return false;
  }
  
  const month = parseInt(cleanExpiry.substring(0, 2), 10);
  const year = parseInt('20' + cleanExpiry.substring(2, 4), 10);
  
  if (month < 1 || month > 12) {
    return false;
  }
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }
  
  return true;
};

// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Format card number for display
export const formatCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  const match = cleaned.match(/(\d{1,4})(\d{1,4})?(\d{1,4})?(\d{1,4})?/);
  
  if (!match) return cleaned;
  
  return [match[1], match[2], match[3], match[4]]
    .filter(Boolean)
    .join(' ');
};

// Mask card number for security
export const maskCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return cleaned;
  
  const lastFour = cleaned.slice(-4);
  const masked = '*'.repeat(cleaned.length - 4);
  
  return formatCardNumber(masked + lastFour);
};
