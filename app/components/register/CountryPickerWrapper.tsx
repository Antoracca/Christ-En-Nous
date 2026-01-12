// app/components/register/CountryPickerWrapper.tsx
// Version NATIVE (iOS/Android) du Country Picker

import React from 'react';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';

interface CountryPickerWrapperProps {
  countryCode: CountryCode;
  onSelect: (country: Country) => void;
  withFlag?: boolean;
  withFilter?: boolean;
  withAlphaFilter?: boolean;
  containerButtonStyle?: any;
}

const CountryPickerWrapper: React.FC<CountryPickerWrapperProps> = (props) => {
  return <CountryPicker {...props} />;
};

export default CountryPickerWrapper;
