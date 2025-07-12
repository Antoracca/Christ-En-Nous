// PhoneInputBlock.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import CountryPicker, {
  CountryCode,
  Country,
  DEFAULT_THEME,
  getCallingCode,
} from 'react-native-country-picker-modal';
import { PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

interface PhoneInputBlockProps {
  phone: string;
  error?: string;
  disabled?: boolean;
  country: string;
  onChange: (value: string) => void;
}


export default function PhoneInputBlock({ phone, error, disabled = false, onChange }: PhoneInputBlockProps) {
  const [countryCode, setCountryCode] = useState<CountryCode>('CF');
  const [withCountryModal, setWithCountryModal] = useState(false);
  const [callingCode, setCallingCode] = useState<string>('236');
  const [number, setNumber] = useState<string>('');

  useEffect(() => {
    if (phone.startsWith('+')) {
      try {
        const parsed = phoneUtil.parse(phone);
        const region = phoneUtil.getRegionCodeForNumber(parsed) as CountryCode;
        const code = parsed.getCountryCode()?.toString() ?? '';
        const nat = parsed.getNationalNumber()?.toString() ?? '';
        setCountryCode(region);
        setCallingCode(code);
        setNumber(nat);
        return;
      } catch {}
    }
    getCallingCode('CF')
      .then(code => setCallingCode(code))
      .catch(() => setCallingCode('236'));
  }, [phone]);

  const onSelect = (country: Country) => {
    if (disabled) return;
    const selected = country.callingCode[0];
    setCountryCode(country.cca2 as CountryCode);
    setCallingCode(selected);
    setNumber('');
    onChange(`+${selected}`);
  };

  const onChangeNumber = (text: string) => {
    if (disabled) return;
    const cleaned = text.replace(/[^0-9]/g, '');
    setNumber(cleaned);
    onChange(`+${callingCode}${cleaned}`);
  };

  const isValidNumber = (): boolean => {
    try {
      const parsed = phoneUtil.parse(`+${callingCode}${number}`);
      return phoneUtil.isValidNumber(parsed);
    } catch {
      return false;
    }
  };

  return (
    
    <View style={styles.container}>
       <Text style={styles.label}>Téléphone</Text>
      <View style={styles.phoneRow}>
        
        <TouchableOpacity
          style={styles.flagBox}
          onPress={() => !disabled && setWithCountryModal(true)}
        >
          <CountryPicker
            countryCode={countryCode}
            withFlag
            withFilter
            withCallingCode
            onSelect={onSelect}
            visible={withCountryModal}
            onClose={() => setWithCountryModal(false)}
            theme={DEFAULT_THEME}
          />
          <Text style={styles.callingCode}>+{callingCode}</Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Ex: 72421246"
          value={number}
          onChangeText={onChangeNumber}
          keyboardType="phone-pad"
          mode="flat"
          underlineColor="transparent"
          style={styles.numberBox}
          textColor="#000"
          disabled={disabled}
        />
      </View>

      {/* Erreur si invalide */}
      <HelperText
        type="error"
        visible={!!error || (number.length > 0 && !isValidNumber())}
        style={styles.errorText}
      >
        {error ?? 'Numéro de téléphone non valide au format national'}
      </HelperText>

      {/* Instruction supplémentaire */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
Votre numéro permet d’assurer la sécurité de votre compte, de recevoir des informations, annonces essentielles et d’accéder aux groupes WhatsApp de la communauté.{' '}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    marginTop: 55,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 25,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF1F5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 5,
    marginTop: -21,
  },
  flagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    borderRightWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 12,
  },
  callingCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 4,
  },
  numberBox: {
    flex: 1,
    fontSize: 18,
    height: 40,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginLeft : -8,
    marginBottom: 12,
  },
  instructionContainer: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 5,
    borderLeftColor: '#FACC15',
    marginBottom: 1,
    paddingVertical: 1,
    paddingHorizontal: 3,
    borderRadius: 6,
    
  },
  instructionText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,

  },
});
