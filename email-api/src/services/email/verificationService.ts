// ============================================================================
// 📁 src/services/email/verificationService.ts - VERSION CORRIGÉE
// ============================================================================

import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

// ✅ CONFIGURATION FIREBASE ADMIN CORRECTE
if (!admin.apps.length) {
  const serviceAccountPath = path.join(process.cwd(), 'firebase-admin-key.json');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'app-christ-en-nous' // Votre projet Firebase
  });
}

// ✅ EXPORT DE LA DB FIRESTORE
const db = admin.firestore();

interface VerificationToken {
  id: string;
  userId: string;
  email: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

/**
 * Génère un token de vérification unique
 */
export async function generateVerificationToken(
  userId: string, 
  email: string
): Promise<string> {
  try {
    const tokenId = uuidv4();
    const token = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h
    
    const verificationData: VerificationToken = {
      id: tokenId,
      userId,
      email,
      token,
      createdAt: now,
      expiresAt,
      used: false
    };
    
    // Sauvegarde dans Firestore
    await db.collection('verification_tokens').doc(tokenId).set(verificationData);
    
    console.log(`✅ Token de vérification généré pour ${email}`);
    return token;
    
  } catch (error) {
    console.error('❌ Erreur génération token:', error);
    throw new Error('Impossible de générer le token de vérification');
  }
}

/**
 * Valide un token de vérification
 */
export async function validateVerificationToken(token: string): Promise<{
  valid: boolean;
  userId?: string;
  email?: string;
  error?: string;
}> {
  try {
    // Recherche du token dans Firestore
    const tokensRef = db.collection('verification_tokens');
    const query = tokensRef.where('token', '==', token).where('used', '==', false);
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return { valid: false, error: 'Token invalide ou déjà utilisé' };
    }
    
    const tokenDoc = snapshot.docs[0];
    const tokenData = tokenDoc.data() as VerificationToken;
    
    // Vérification expiration
    if (new Date() > tokenData.expiresAt) {
      return { valid: false, error: 'Token expiré' };
    }
    
    // Marquer comme utilisé
    await tokenDoc.ref.update({ used: true });
    
    console.log(`✅ Token validé pour ${tokenData.email}`);
    return {
      valid: true,
      userId: tokenData.userId,
      email: tokenData.email
    };
    
  } catch (error) {
    console.error('❌ Erreur validation token:', error);
    return { valid: false, error: 'Erreur serveur' };
  }
}

/**
 * Nettoyage des tokens expirés (à appeler périodiquement)
 */
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    const now = new Date();
    const expiredTokens = await db
      .collection('verification_tokens')
      .where('expiresAt', '<', now)
      .get();
    
    // ✅ Suppression des tokens expirés
    const deletePromises = expiredTokens.docs.map((doc: { ref: { delete: () => any; }; }) => doc.ref.delete());
    await Promise.all(deletePromises);
    
    console.log(`🧹 ${expiredTokens.size} tokens expirés supprimés`);
    
  } catch (error) {
    console.error('❌ Erreur nettoyage tokens:', error);
  }
}

// ✅ EXPORT DE LA DB POUR UTILISATION DANS D'AUTRES MODULES
export { db };