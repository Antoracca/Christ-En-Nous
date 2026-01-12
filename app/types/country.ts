// app/types/country.ts
// Types locaux pour éviter la dépendance à react-native-country-picker-modal sur web

export type CountryCode = string;

export interface Country {
  cca2: CountryCode;
  name: string | { common: string };
  callingCode?: string[];
}
