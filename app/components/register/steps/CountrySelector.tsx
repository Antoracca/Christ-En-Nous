import React, { useState, useEffect } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  
} from 'react-native';
// Use a runtime require and local type aliases because the package doesn't provide TypeScript declarations
// @ts-ignore - module may not have type declarations
const CountryPickerModule: any = require('react-native-country-picker-modal');
const CountryPicker: any = CountryPickerModule && CountryPickerModule.default ? CountryPickerModule.default : CountryPickerModule;
type Country = any;
type CountryCode = string;
const DEFAULT_THEME: any = (CountryPickerModule && CountryPickerModule.DEFAULT_THEME) || {};
import { HelperText } from 'react-native-paper';
import * as Localization from 'expo-localization';
import LeftInputIcon from '../../LeftInputIcon';
import { countryNames } from '@assets/data/countries.utils';


interface CountrySelectorProps {
  country: string;
  error?: string;
  disabled?: boolean;
  onChange: (countryName: string, countryCode: CountryCode) => void;
}

export default function CountrySelector({
  country,
  error,
  disabled = false,
  onChange,
}: CountrySelectorProps) {
  const [code, setCode] = useState<CountryCode>('CF');
  const [name, setName] = useState<string>(country || countryNames['CF']);
  const [visible, setVisible] = useState(false);
  const isDark = useColorScheme() === 'dark';

  const theme = {
    ...DEFAULT_THEME,
    colors: {
      primary: isDark ? '#BB86FC' : '#6200EE',
      background: isDark ? '#121212' : '#FFFFFF',
      surface: isDark ? '#1E1E1E' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#000000',
    },
  };

  useEffect(() => {
    if (!country) {
      const region = (Localization.getLocales()[0].regionCode as CountryCode) || 'CF';
      const valid = region in countryNames ? region : 'CF';
      setCode(valid);
      setName(countryNames[valid as keyof typeof countryNames]);
      onChange(countryNames[valid as keyof typeof countryNames], valid);
    }
  }, [country, onChange]);

  const handleSelect = (c: Country) => {
    const newCode = c.cca2 as CountryCode;
    let newName: string;

    if (newCode in countryNames) {
      newName = countryNames[newCode as keyof typeof countryNames];
    } else if (
      c.name &&
      typeof c.name === 'object' &&
      'common' in c.name &&
      typeof (c.name as any).common === 'string'
    ) {
      newName = (c.name as any).common;
    } else {
      newName = typeof c.name === 'string' ? c.name : '';
    }

    setCode(newCode);
    setName(newName);
    onChange(newName, newCode);
    setVisible(false);
  };

  return (
    <>
      <Text style={styles.label}>Pays</Text>
      <TouchableOpacity
        style={styles.field}
        onPress={() => !disabled && setVisible(true)}
        disabled={disabled}
      >
        <LeftInputIcon icon="globe-africa" size={34} />
        <Text style={styles.fieldText}>{name}</Text>
      </TouchableOpacity>
      <HelperText type="error" visible={!!error} style={styles.errorText}>
        {error}
      </HelperText>

      {visible && (
        <CountryPicker
          withFilter
          withFlag
          withAlphaFilter
          withCountryNameButton={false}
          onSelect={handleSelect}
          visible
          onClose={() => setVisible(false)}
          theme={theme}
          countryCode={code}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '600',
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
  },
  fieldText: {
    flex: 1,
    fontSize: 19,
    color: '#333',
    marginLeft: 8,
  },
  errorText: {
    marginLeft: 32,
    color: '#DC2626',
    fontSize: 13,
    marginTop: -2,
    marginRight: -5,
    marginBottom: 8,

  },
});