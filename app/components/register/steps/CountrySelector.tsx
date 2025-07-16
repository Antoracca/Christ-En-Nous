import React, { useState, useEffect } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  
} from 'react-native';
import CountryPicker, {
  Country,
  CountryCode,
  DEFAULT_THEME,
} from 'react-native-country-picker-modal';
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
      setName(countryNames[valid]);
      onChange(countryNames[valid], valid);
    }
  }, [country, onChange]);

  const handleSelect = (c: Country) => {
    const newCode = c.cca2 as CountryCode;
    let newName: string;

    if (typeof countryNames[newCode] === 'string') {
      newName = countryNames[newCode];
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
