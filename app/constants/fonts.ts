// app/constants/fonts.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Platform } from 'react-native';

/**
 * Constantes pour les polices de l'application.
 * Nous utilisons la famille "Nunito" qui est déjà importée.
 * Elle offre une excellente lisibilité et un aspect moderne et amical.
 */
export const Fonts = {
  // Noms des familles de polices
  family: {
    regular: 'Nunito_400Regular',
    bold: 'Nunito_700Bold',
    // Si nous ajoutons d'autres poids (ex: Black, Light), on les mettra ici
  },
  // Tailles de police sémantiques
  size: {
    xs: 12, // Extra small
    sm: 14, // Small
    md: 16, // Medium (défaut pour le corps du texte)
    lg: 18, // Large
    xl: 20, // Extra large
    '2xl': 24, // Titres de section
    '3xl': 32, // Titres principaux
  },
  // Hauteurs de ligne pour une meilleure lisibilité
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 30,
    '2xl': 36,
    '3xl': 42,
  },
};
