// constants/theme.ts

// On importe les jeux de couleurs et les polices
import { lightColors, darkColors } from './colors';
import { fontFamilies, fontSizes } from './fonts';

// 🎨 Thème clair complet — à utiliser si le mode clair est actif
export const lightTheme = {
  colors: lightColors, // on récupère les couleurs light
  fonts: {
    families: fontFamilies, // et les polices
    sizes: fontSizes,
  },
};

// 🌙 Thème sombre complet — à utiliser si le dark mode est activé
export const darkTheme = {
  colors: darkColors,
  fonts: {
    families: fontFamilies,
    sizes: fontSizes,
  },
};
