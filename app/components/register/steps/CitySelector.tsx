import { Platform } from 'react-native';
import CitySelectorIOS from './CitySelector.ios';
import CitySelectorAndroid from './CitySelector.android';

interface CitySelectorProps {
  selectedCity: string;
  options: string[];
  error?: string;
  disabled?: boolean;
  manualMode?: boolean;
  onChange: (city: string) => void;
}

const CitySelector = Platform.OS === 'ios'
  ? (props: CitySelectorProps) => <CitySelectorIOS {...props} />
  : (props: CitySelectorProps) => <CitySelectorAndroid {...props} />;

export default CitySelector;