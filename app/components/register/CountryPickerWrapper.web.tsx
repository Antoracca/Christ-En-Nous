// app/components/register/CountryPickerWrapper.web.tsx
// Version WEB du Country Picker (select HTML simple)

import React from 'react';
import { View, StyleSheet } from 'react-native';

interface CountryPickerWrapperProps {
  countryCode: string;
  onSelect: (country: any) => void;
  withFlag?: boolean;
  withFilter?: boolean;
  withAlphaFilter?: boolean;
  containerButtonStyle?: any;
}

const CountryPickerWrapper: React.FC<CountryPickerWrapperProps> = ({
  countryCode,
  onSelect,
  containerButtonStyle,
}) => {
  const handleChange = (e: any) => {
    const code = e.target.value;
    onSelect({ cca2: code, name: '', callingCode: [] });
  };

  return (
    <View style={[styles.container, containerButtonStyle]}>
      <select
        value={countryCode}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: 12,
          fontSize: 16,
          borderRadius: 8,
          border: '1px solid #E5E7EB',
          backgroundColor: 'white',
          cursor: 'pointer',
        }}
      >
        <option value="CF">🇨🇫 République Centrafricaine</option>
        <option value="CD">🇨🇩 Congo (RDC)</option>
        <option value="CG">🇨🇬 Congo (Brazzaville)</option>
        <option value="FR">🇫🇷 France</option>
        <option value="BE">🇧🇪 Belgique</option>
        <option value="CA">🇨🇦 Canada</option>
        <option value="US">🇺🇸 États-Unis</option>
        <option value="GB">🇬🇧 Royaume-Uni</option>
        <option value="DE">🇩🇪 Allemagne</option>
      </select>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default CountryPickerWrapper;
