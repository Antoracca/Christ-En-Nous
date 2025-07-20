// services/email/verificationService.ts
import { db } from '../firebase/firebaseConfig';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import uuid from 'react-native-uuid';

/**
 * Génère un token de vérification et le stocke dans Firestore
 */
export async function generateVerificationToken(userId: string, email: string): Promise<string> {
 const token = uuid.v4() as string;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Expire dans 24h
  
  // Stocker le token dans Firestore
  await setDoc(doc(db, 'email_verifications', token), {
    userId,
    email,
    token,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    used: false,
  });
  
  return token;
}

/**
 * Vérifie un token et marque l'email comme vérifié
 */
export async function verifyEmailToken(token: string): Promise<{
  success: boolean;
  message: string;
  userId?: string;
}> {
  try {
    // Récupérer le token
    const tokenDoc = await getDoc(doc(db, 'email_verifications', token));
    
    if (!tokenDoc.exists()) {
      return { success: false, message: 'Lien de vérification invalide.' };
    }
    
    const tokenData = tokenDoc.data();
    
    // Vérifier si déjà utilisé
    if (tokenData.used) {
      return { success: false, message: 'Ce lien a déjà été utilisé.' };
    }
    
    // Vérifier l'expiration
    const expiresAt = new Date(tokenData.expiresAt);
    if (expiresAt < new Date()) {
      return { success: false, message: 'Ce lien a expiré.' };
    }
    
    // Marquer l'email comme vérifié
    await updateDoc(doc(db, 'users', tokenData.userId), {
      emailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
    });
    
    // Marquer le token comme utilisé
    await updateDoc(doc(db, 'email_verifications', token), {
      used: true,
      usedAt: new Date().toISOString(),
    });
    
    return { 
      success: true, 
      message: 'Email vérifié avec succès !',
      userId: tokenData.userId
    };
    
  } catch (error) {
    console.error('Erreur vérification token:', error);
    return { success: false, message: 'Erreur lors de la vérification.' };
  }
}

/**
 * Nettoie les tokens expirés (optionnel)
 */
export async function cleanupExpiredTokens(): Promise<void> {
  // À implémenter avec une Cloud Function programmée
  // ou manuellement de temps en temps
}