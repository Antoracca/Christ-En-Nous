// app/constants/theme.ts
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { lightColors, darkColors } from './colors';
import { Fonts } from './fonts';

/**
 * Thème clair pour l'application, compatible avec React Native Paper v5 (MD3).
 * C'est une structure moderne qui mappe nos couleurs personnalisées au système de design.
 */
export const LightAppTheme = {
  ...MD3LightTheme,
  roundness: 12,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary,
    onPrimary: lightColors.onPrimary,
    secondary: lightColors.secondary,
    onSecondary: lightColors.onSecondary,
    tertiary: lightColors.accent, // Utilisation de 'tertiary' pour l'accentuation
    background: lightColors.background,
    surface: lightColors.surface,
    surfaceVariant: '#E2E8F0', // Une variante pour les surfaces (ex: fond de chip)
    onSurface: lightColors.text,
    onSurfaceVariant: lightColors.text,
    onBackground: lightColors.text,
    error: lightColors.error,
    onError: lightColors.onError,
    outline: lightColors.border,
    // Couleurs personnalisées non standard MD3 pour un usage spécifique
    placeholder: lightColors.placeholder,
    success: lightColors.success,
  },
  // Nos constantes personnalisées pour un accès direct et facile
  custom: {
    colors: lightColors,
    fonts: Fonts,
  },
};

/**
 * Thème sombre pour l'application, compatible avec React Native Paper v5 (MD3).
 */
export const DarkAppTheme = {
  ...MD3DarkTheme,
  roundness: 12,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    onPrimary: darkColors.onPrimary,
    secondary: darkColors.secondary,
    onSecondary: darkColors.onSecondary,
    tertiary: darkColors.accent,
    background: darkColors.background,
    surface: darkColors.surface,
    surfaceVariant: '#334155',
    onSurface: darkColors.text,
    onSurfaceVariant: darkColors.text,
    onBackground: darkColors.text,
    error: darkColors.error,
    onError: darkColors.onError,
    outline: darkColors.border,
    // Couleurs personnalisées non standard MD3
    placeholder: darkColors.placeholder,
    success: darkColors.success,
  },
  // Nos constantes personnalisées pour un accès direct et facile
  custom: {
    colors: darkColors,
    fonts: Fonts,
  },
};

// Type pour notre thème personnalisé pour garantir la cohérence dans toute l'app
export type AppThemeType = typeof LightAppTheme;
