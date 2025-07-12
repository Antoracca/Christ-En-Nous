import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EmailInputBlock from './EmailInputBlock';
import PhoneInputBlock from './PhoneInputBlock';
import { PhoneNumberUtil } from 'google-libphonenumber';

interface StepContactProps {
  email: string;
  phone: string;
  country: string; // code pays ISO ex: 'FR', 'CM', 'CF'
  disabled?: boolean;
  forceValidation: boolean;
  onChange: (field: 'email' | 'phone', value: string) => void;
}

export default function StepContact({
  email,
  phone,
  country,
  disabled = false,
  forceValidation,
  onChange,
}: StepContactProps) {
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  const isValidEmail = (e: string) =>
    /^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(e.trim());

  // Validation déclenchée automatiquement si forceValidation = true
  useEffect(() => {
    const phoneUtil = PhoneNumberUtil.getInstance();
    if (forceValidation) {
      const newErrors: typeof errors = {};

      if (!isValidEmail(email)) {
        newErrors.email = "Adresse e-mail invalide";
      }

      try {
        const parsed = phoneUtil.parse(phone, country);
        if (!phoneUtil.isValidNumber(parsed)) {
          newErrors.phone = "Numéro invalide pour ce pays";
        }
      } catch {
        newErrors.phone = "Numéro invalide";
      }

      setErrors(newErrors);
    }
  }, [forceValidation, email, phone, country]);

  const handleEmailChange = (value: string) => {
    onChange('email', value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePhoneChange = (value: string) => {
    onChange('phone', value);
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Étape 3 : Contact</Text>
      <Text style={styles.stepDescription}>
        Merci d’indiquer une adresse e-mail valide et un numéro joignable.
      </Text>

      <EmailInputBlock
        email={email}
        error={errors.email}
        onChange={handleEmailChange}
      />

      <PhoneInputBlock
        phone={phone}
        error={errors.phone}
        disabled={disabled}
        onChange={handlePhoneChange}
        country={country}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 20,
    lineHeight: 22,
  
    padding: 10,
    borderRadius: 8,
  },
});
