// app/constants/colors.ts

/**
 * Palette de couleurs pour le thème clair.
 * Inspirée par une identité visuelle sobre, spirituelle et moderne.
 */
export const lightColors = {
  background: '#FFFFFF',       // blanc pur
  text: '#0F172A',             // bleu nuit/noir pour le texte pour un meilleur contraste
  primary: '#1E3A8A',           // bleu foncé (couleur d’église)
  onPrimary: '#FFFFFF',        // texte blanc sur fond primaire
  secondary: '#FBBF24',         // jaune doré (boutons, accents)
  onSecondary: '#0F172A',       // texte sombre sur fond secondaire
  accent: '#FFD54F',           // or plus clair (hover, surbrillance)
  border: '#CBD5E1',           // gris bleuté pour bordures
  placeholder: '#94A3B8',       // couleur pour les placeholders
  surface: '#FFFFFF',          // couleur pour les cartes et surfaces
  error: '#DC2626',             // rouge d’erreur
  onError: '#FFFFFF',          // texte blanc sur fond d'erreur
  success: '#16A34A',           // vert de succès
};

/**
 * Palette de couleurs pour le thème sombre.
 */
export const darkColors = {
  background: '#0F172A',       // bleu nuit
  text: '#E2E8F0',             // texte blanc cassé en dark mode
  primary: '#3B82F6',           // bleu lumineux en sombre
  onPrimary: '#FFFFFF',        // texte blanc sur fond primaire
  secondary: '#FACC15',         // jaune clair
  onSecondary: '#0F172A',       // texte sombre sur fond secondaire
  accent: '#FDE68A',           // accent jaune très clair
  border: '#334155',           // bordures en mode sombre
  placeholder: '#64748B',       // couleur pour les placeholders
  surface: '#1E293B',          // couleur pour les cartes (légèrement plus claire que le fond)
  error: '#F87171',             // rouge d'erreur clair
  onError: '#0F172A',          // texte sombre sur fond d'erreur
  success: '#4ADE80',           // vert de succès clair
};
