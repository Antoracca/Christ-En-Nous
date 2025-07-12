// utils/normalizeText.ts

/**
 * Normalise un texte (nom ou prénom) pour comparaison intelligente :
 * - Enlève les accents (é → e, à → a, etc.)
 * - Enlève ponctuations SAUF tirets (pour Jean-Pierre)
 * - Remplace espaces multiples par un seul
 * - Met en minuscule
 * 
 * Exemples :
 * - "D'Artagnan" → "dartagnan"
 * - "Jean-Pierre" → "jean-pierre"
 * - "François  DUPONT" → "francois dupont"
 * - "O'Connor" → "oconnor"
 */
export function normalizeText(input: string): string {
  return input
    .normalize('NFD')                  // Décompose les lettres accentuées
    .replace(/[\u0300-\u036f]/g, '')   // Enlève les accents
    .replace(/[^\w\s-]|_/g, '')        // Enlève ponctuations sauf tirets
    .replace(/\s+/g, ' ')              // Espaces multiples → un seul
    .trim()                            // Enlève espaces début/fin
    .toLowerCase();                    // Met en minuscules
}

/**
 * Nettoie un pseudo pour comparaison (lettres et chiffres uniquement)
 * - Pas d'espace
 * - Pas de tiret
 * - Pas de caractères spéciaux
 * 
 * Exemples :
 * - "Jean.Dupont" → "jeandupont"
 * - "user_123" → "user123"
 * - "Marie-Claire" → "marieclaire"
 */
export function normalizeUsername(username: string): string {
  return normalizeText(username)
    .replace(/\s+/g, '')         // Enlève TOUS les espaces
    .replace(/[^a-z0-9]/g, '');  // Garde UNIQUEMENT lettres et chiffres
}

/**
 * Teste si deux textes sont équivalents après normalisation
 * Utile pour vérifier les doublons
 */
export function areTextsEquivalent(text1: string, text2: string): boolean {
  return normalizeText(text1) === normalizeText(text2);
}

/**
 * Teste si deux usernames sont équivalents après normalisation
 */
export function areUsernamesEquivalent(username1: string, username2: string): boolean {
  return normalizeUsername(username1) === normalizeUsername(username2);
}