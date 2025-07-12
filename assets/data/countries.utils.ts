// countries.utils.ts
import countriesData from './countries.json';
import { CountryCode } from 'react-native-country-picker-modal';

export const countryNames: Record<CountryCode, string> = Object.fromEntries(
  Object.entries(countriesData).map(([code, data]) => [code, data.name])
) as Record<CountryCode, string>;

export const citiesByCountryCode: Record<CountryCode, string[]> = Object.fromEntries(
  Object.entries(countriesData).map(([code, data]) => [code, data.cities])
) as Record<CountryCode, string[]>;
