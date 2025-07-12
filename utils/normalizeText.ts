// utils/normalizeText.ts

/**
 * Normalise un texte (nom ou prénom) pour comparaison intelligente :
 * - enlève les accents
 * - enlève ponctuations sauf tirets
 * - remplace espaces multiples par un seul
 * - met en minuscule
 */
export function normalizeText(input: string): string {
  return input
    .normalize('NFD') // décompose les lettres accentuées
    .replace(/[\u0300-\u036f]/g, '') // enlève les accents
    .replace(/[^\w\s-]|_/g, '') // enlève les ponctuations sauf tirets
    .replace(/\s+/g, ' ') // remplace les espaces multiples par un seul
    .trim()
    .toLowerCase();
}

/**
 * Nettoie un pseudo pour comparaison (lettres et chiffres uniquement, pas d'espace ni tiret)
 */
export function normalizeUsername(username: string): string {
  return normalizeText(username)
    .replace(/\s+/g, '') // enlève tous les espaces
    .replace(/[^a-z0-9]/g, ''); // garde uniquement lettres et chiffres
}
