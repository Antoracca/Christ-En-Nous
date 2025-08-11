// services/firebase/firebaseConfig.ts
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

// ✅ POINTE VERS LE BON FICHIER Firebase Admin dans le container
const serviceAccountPath = path.join(process.cwd(), 'firebase-admin-key.json');

console.log('🔍 Chemin Firebase Admin:', serviceAccountPath);

// Éviter la double initialisation
if (getApps().length === 0) {
  try {
    initializeApp({
      credential: cert(serviceAccountPath),
      projectId: 'app-christ-en-nous'  // ✅ LE BON PROJECT ID Firebase
    });
    console.log('✅ Firebase Admin initialisé pour app-christ-en-nous');
  } catch (error) {
    console.error('❌ Erreur Firebase Admin:', error);
    process.exit(1);
  }
}

// ✅ Firestore Admin (privilèges complets)
export const db = getFirestore();