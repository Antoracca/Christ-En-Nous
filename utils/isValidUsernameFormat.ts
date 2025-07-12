// utils/isValidUsernameFormat.ts

export function isValidUsernameFormat(username: string): boolean {
  const normalized = username.trim().toLowerCase();
  const pattern = /^[a-z0-9._]{3,}$/; // lettres minuscules, chiffres, points, _
  return pattern.test(normalized);
}
