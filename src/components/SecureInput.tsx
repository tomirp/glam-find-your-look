
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { sanitizeInput, validateCreditCard, validateCVV, validateExpiryDate, formatCardNumber } from '@/utils/paymentSecurity';

interface SecureInputProps {
  type: 'card' | 'cvv' | 'expiry' | 'text';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  required?: boolean;
}

const SecureInput: React.FC<SecureInputProps> = ({
  type,
  value,
  onChange,
  placeholder,
  className,
  error,
  required = false
}) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Sanitize input
    if (type === 'text') {
      newValue = sanitizeInput(newValue);
    }
    
    // Format and validate based on type
    switch (type) {
      case 'card':
        newValue = newValue.replace(/\D/g, '');
        if (newValue.length <= 19) {
          const formatted = formatCardNumber(newValue);
          const validation = validateCreditCard(newValue);
          setIsValid(validation.isValid);
          onChange(formatted);
        }
        break;
        
      case 'cvv':
        newValue = newValue.replace(/\D/g, '');
        if (newValue.length <= 4) {
          // We can't validate CVV without card type, so just check length
          setIsValid(newValue.length >= 3);
          onChange(newValue);
        }
        break;
        
      case 'expiry':
        newValue = newValue.replace(/\D/g, '');
        if (newValue.length <= 4) {
          let formatted = newValue;
          if (newValue.length >= 2) {
            formatted = newValue.substring(0, 2) + '/' + newValue.substring(2, 4);
          }
          setIsValid(validateExpiryDate(newValue));
          onChange(formatted);
        }
        break;
        
      default:
        onChange(newValue);
    }
  };

  return (
    <div className="space-y-1">
      <Input
        type={type === 'cvv' ? 'password' : 'text'}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          className,
          error && 'border-destructive',
          isValid === true && 'border-green-500',
          isValid === false && 'border-red-500'
        )}
        required={required}
        autoComplete="off"
        spellCheck={false}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default SecureInput;
