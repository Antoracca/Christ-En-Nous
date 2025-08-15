import { db } from 'services/firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

/**
 * Vérifie si le format du nom d'utilisateur est valide.
 * (Logique extraite de vos fichiers)
 */
export const isValidUsernameFormat = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9._-]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Vérifie dans Firestore si un nom d'utilisateur est déjà pris par un AUTRE utilisateur.
 */
export const isUsernameTaken = async (username: string, currentUserId: string): Promise<boolean> => {
  if (!username) return false;
  const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return false;
  // Retourne vrai seulement si un document trouvé a un ID différent de l'utilisateur actuel
  return snapshot.docs.some(doc => doc.id !== currentUserId);
};

/**
 * Vérifie dans Firestore si un numéro de téléphone est déjà pris par un AUTRE utilisateur.
 */
export const isPhoneTaken = async (phone: string, currentUserId: string): Promise<boolean> => {
  if (!phone) return false;
  try {
    const q = query(collection(db, 'users'), where('phone', '==', phone.trim()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return false;
    return snapshot.docs.some(doc => doc.id !== currentUserId);
  } catch (error) {
    console.error('Erreur Firestore (isPhoneTaken):', error);
    return true; // En cas d'erreur, on bloque pour la sécurité
  }
};

/**
 * Vérifie dans Firestore si le couple nom/prénom est déjà pris par un AUTRE utilisateur.
 */
export const isNameAndSurnameTaken = async (nom: string, prenom: string, currentUserId: string): Promise<boolean> => {
    if (!nom || !prenom) return false;
    const q = query(
        collection(db, 'users'),
        where('nom', '==', nom.trim()),
        where('prenom', '==', prenom.trim())
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return false;
    return snapshot.docs.some(doc => doc.id !== currentUserId);
};

/**
 * Vérifie le format d'un numéro de téléphone international.
 */
export const isValidPhoneNumber = (phone: string): boolean => {
    if (!phone || phone.length < 8) return false;
    try {
        return phoneUtil.isValidNumber(phoneUtil.parse(phone));
    } catch {
        return false;
    }
};
