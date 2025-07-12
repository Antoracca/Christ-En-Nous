import { collection, getDocs } from 'firebase/firestore/lite';

import { db } from '../services/firebase/firebaseConfig';
import { normalizeText } from './normalizeText';

export async function isNameAndSurnameTaken(nom: string, prenom: string): Promise<boolean> {
  const normalizedNom = normalizeText(nom);
  const normalizedPrenom = normalizeText(prenom);
  console.log('🔍 isNameAndSurnameTaken → normalized', normalizedNom, normalizedPrenom);

  const snapshot = await getDocs(collection(db, 'users'));
  console.log('🔍 isNameAndSurnameTaken → nb users récupérés:', snapshot.docs.length);

  for (const docSnap of snapshot.docs) {
    const user = docSnap.data();
    const nomDB = normalizeText(user.nom || '');
    const prenomDB = normalizeText(user.prenom || '');
    if (nomDB === normalizedNom && prenomDB === normalizedPrenom) {
      console.log('✅ Nom+Prénom trouvé dans Firestore');
      return true;
    }
  }

  console.log('❌ Nom+Prénom non trouvé');
  return false;
}
