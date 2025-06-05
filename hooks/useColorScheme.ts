import { ColorSchemeName, useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme(): NonNullable<ColorSchemeName> {
  return useRNColorScheme() ?? 'light';
}
