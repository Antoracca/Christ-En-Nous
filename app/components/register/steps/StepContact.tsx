import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import EmailInputBlock from './EmailInputBlock';
import PhoneInputBlock from './PhoneInputBlock';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const phoneUtil = PhoneNumberUtil.getInstance();

interface StepContactProps {
  email: string;
  phone: string;
  country: string;
  disabled?: boolean;
  forceValidation: boolean;
  onChange: (field: 'email' | 'phone', value: string) => void;
  emailDuplicateError?: boolean;
  phoneDuplicateError?: boolean;
  emailAvailable?: boolean | null;
  phoneAvailable?: boolean | null;
  checkingEmail?: boolean;
  checkingPhone?: boolean;
}

export default function StepContact({
  email,
  phone,
  country,
  disabled = false,
  forceValidation,
  onChange,
  emailDuplicateError = false,
  phoneDuplicateError = false,
  emailAvailable = null,
  phoneAvailable = null,
  checkingEmail = false,
  checkingPhone = false,
}: StepContactProps) {
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  const isValidEmail = (e: string) =>
    /^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(e.trim());
  
  const [emailFadeAnim] = useState(new Animated.Value(0));
  const [phoneFadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (emailDuplicateError) {
      Animated.timing(emailFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      emailFadeAnim.setValue(0);
    }
  }, [emailDuplicateError, emailFadeAnim]);

  useEffect(() => {
    if (phoneDuplicateError) {
      Animated.timing(phoneFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      phoneFadeAnim.setValue(0);
    }
  }, [phoneDuplicateError, phoneFadeAnim]);

  useEffect(() => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Étape 3 : Contact</Text>
      <Text style={styles.stepDescription}>
        Merci d&apos;indiquer une adresse e-mail valide et un numéro joignable.
      </Text>

      {emailDuplicateError && (
        <Animated.View 
          style={[styles.globalErrorContainer, { opacity: emailFadeAnim }]}
        >
          <MaterialCommunityIcons 
            name="email-alert" 
            size={20} 
            color="#DC2626" 
            style={styles.errorIcon}
          />
          <Text style={styles.globalErrorText}>
            Cette adresse e-mail est déjà utilisée par un autre membre. 
            Vérifiez votre saisie ou contactez l&apos;administrateur.
          </Text>
        </Animated.View>
      )}

      {phoneDuplicateError && (
        <Animated.View 
          style={[styles.globalErrorContainer, { opacity: phoneFadeAnim }]}
        >
          <MaterialCommunityIcons 
            name="phone-alert" 
            size={20} 
            color="#DC2626" 
            style={styles.errorIcon}
          />
          <Text style={styles.globalErrorText}>
            Ce numéro de téléphone est déjà enregistré. 
            Vérifiez votre numéro ou utilisez un autre numéro.
          </Text>
        </Animated.View>
      )}

      <EmailInputBlock
        email={email}
        error={errors.email}
        onChange={(value) => onChange('email', value)}
        checking={checkingEmail}
        available={emailAvailable}
      />

      <PhoneInputBlock
        phone={phone}
        error={errors.phone}
        disabled={disabled}
        onChange={(value) => onChange('phone', value)}
        checking={checkingPhone}
        available={phoneAvailable}
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
  globalErrorContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  globalErrorText: {
    color: '#B91C1C',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    flex: 1,
  },
  errorIcon: {
    marginRight: 10,
    marginTop: 2,
  },
});