// components/register/steps/PhoneInputBlock.tsx — v2.2 (fix Typescript)
//  ✓  utilise AsYouTypeFormatter (classe) au lieu de getAsYouTypeFormatter()
//  ✓  restaure le state withCountryModal
//  ✓  tous les imports explicitement typés

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CountryCode, Country } from '@/types/country';
import CountryPickerWrapper from '../CountryPickerWrapper';
import { getCallingCode } from '@/utils/countryHelpers';
import {
  PhoneNumberUtil,
  PhoneNumberType,
  AsYouTypeFormatter,
} from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

interface PhoneInputBlockProps {
  phone: string;
  error?: string;
  disabled?: boolean;
  initialCountry?: CountryCode; // "FR", "CF", etc.
  onChange: (value: string) => void;
  checking?: boolean;
  available?: boolean | null;
}

export default function PhoneInputBlock({
  phone,
  error,
  disabled = false,
  onChange,
  checking = false,
  available = null,
  initialCountry = 'CF',
}: PhoneInputBlockProps) {
  /* ----- état principal ----- */
  const [countryCode, setCountryCode] = useState<CountryCode>(initialCountry);
  const [callingCode, setCallingCode] = useState<string>('');
  const [number, setNumber] = useState<string>(''); // national digits only
  const [formatted, setFormatted] = useState<string>(''); // rendu utilisateur
  const [example, setExample] = useState<string>('');
  const [withCountryModal, setWithCountryModal] = useState(false);

  /* ----- formatter as‑you‑type (ref) ----- */
  const formatterRef = useRef<AsYouTypeFormatter>(
    new AsYouTypeFormatter(initialCountry)
  );

  /* ----- chargement indicatif + placeholder au changement de pays ----- */
  const applyCountry = useCallback(
    (cc: CountryCode) => {
      setCountryCode(cc);
      formatterRef.current = new AsYouTypeFormatter(cc);
      getCallingCode(cc)
        .then(setCallingCode)
        .catch(() => setCallingCode(''));
      // placeholder d'exemple
      try {
        const ex = phoneUtil
          .getExampleNumberForType(cc, PhoneNumberType.MOBILE)
          ?.getNationalNumber()
          ?.toString();
        ex && setExample(ex);
      } catch {
        setExample('');
      }
    },
    []
  );

  /* ----- init (componentDidMount) ----- */
  useEffect(() => {
    applyCountry(initialCountry);
  }, [applyCountry, initialCountry]);

  /* ----- sélection de pays depuis le picker ----- */
  const onSelect = (c: Country) => {
    if (disabled) return;
    applyCountry(c.cca2 as CountryCode);
    setNumber('');
    setFormatted('');
    onChange(`+${c.callingCode[0]}`);
  };

  /* ----- saisie du numéro national ----- */
  const onChangeNumber = (txt: string) => {
    if (disabled) return;
    const digits = txt.replace(/\D/g, '');
    formatterRef.current.clear();
    let pretty = '';
    digits.split('').forEach((d) => {
      pretty = formatterRef.current.inputDigit(d);
    });
    setNumber(digits);
    setFormatted(pretty);
    onChange(`+${callingCode}${digits}`);
  };

  /* ----- validation ----- */
  const isValidNumber = (): boolean => {
    try {
      const parsed = phoneUtil.parse(`+${callingCode}${number}`);
      return phoneUtil.isValidNumber(parsed);
    } catch {
      return false;
    }
  };

  /* ----- helpers UI ----- */
  const getPhoneStatusIcon = () => {
    if (checking) {
      return (
        <View style={styles.statusIconContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      );
    }
    if (number.length >= 6 && isValidNumber() && available === true) {
      return (
        <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
      );
    }
    return null;
  };

  const getPhoneHelperText = () => {
    if (checking) {
      return (
        <HelperText type="info" visible style={styles.infoText}>
          Vérification de la disponibilité...
        </HelperText>
      );
    }
    if (!checking && available === false && isValidNumber()) {
      return (
        <HelperText type="error" visible style={styles.errorText}>
          <MaterialCommunityIcons name="close" size={14} /> Ce numéro est déjà
          enregistré
        </HelperText>
      );
    }
    if (number.length > 0 && !isValidNumber()) {
      return (
        <HelperText type="error" visible style={styles.errorText}>
          Numéro de téléphone invalide pour ce pays
        </HelperText>
      );
    }
    if (error) {
      return (
        <HelperText type="error" visible style={styles.errorText}>
          {error}
        </HelperText>
      );
    }
    return null;
  };

  /* ----- rendu ----- */
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Téléphone</Text>

      <View
        style={[
          styles.phoneRow,
          isValidNumber() && available === true && styles.phoneRowSuccess,
        ]}
      >
        {/* 🇨🇫  Sélecteur de pays */}
        <TouchableOpacity
          style={styles.flagBox}
          onPress={() => !disabled && setWithCountryModal(true)}
        >
          <CountryPickerWrapper
            countryCode={countryCode}
            withFlag
            withFilter
            onSelect={onSelect}
          />
          <Text style={styles.callingCode}>+{callingCode}</Text>
        </TouchableOpacity>

        {/* Champ numéro */}
        <TextInput
          placeholder={example ? `Ex: ${example}` : 'Numéro'}
          value={formatted}
          onChangeText={onChangeNumber}
          keyboardType="phone-pad"
          mode="flat"
          underlineColor="transparent"
          style={styles.numberBox}
          textColor="#000"
          disabled={disabled}
          right={
            getPhoneStatusIcon() ? (
              <TextInput.Icon icon={() => getPhoneStatusIcon()} />
            ) : undefined
          }
        />
      </View>

      <View style={styles.phoneErrorBox}>{getPhoneHelperText()}</View>

      {/* Information */}
      <View style={styles.instructionContainer}>
        <MaterialCommunityIcons
          name="information"
          size={16}
          color="#3B82F6"
          style={styles.infoIcon}
        />
        <Text style={styles.instructionText}>
          Votre numéro permet d&apos;assurer la sécurité de votre compte, de recevoir
          des informations importantes et d&apos;accéder aux groupes WhatsApp de la
          communauté.
        </Text>
      </View>
    </View>
  );
}

/* ----- styles ----- */
const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  label: {
    fontSize: 15,
    marginTop: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF1F5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  phoneRowSuccess: {
    borderColor: '#10B981',
    borderWidth: 2,
    backgroundColor: '#F6FFFA',
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
  numberBox: { flex: 1, fontSize: 18, height: 40, backgroundColor: 'transparent' },
  statusIconContainer: { justifyContent: 'center', paddingRight: 8 },
  phoneErrorBox: { marginTop: 2, marginLeft: 8 },
  errorText: { color: '#DC2626', fontSize: 13, marginLeft: -8, marginBottom: 8 },
  infoText: { color: '#3B82F6', fontSize: 12, marginLeft: -8, marginBottom: 8 },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 19,
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 5,
    borderLeftColor: '#3B82F6',
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    flex: 1,
    marginLeft: -5,
  },
  infoIcon: { marginRight: 20, marginTop: -65 },
});