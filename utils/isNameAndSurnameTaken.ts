// utils/isNameAndSurnameTaken.ts
import { collection, getDocs } from 'firebase/firestore'; // ✅ Import correct (pas lite)
import { db } from '../services/firebase/firebaseConfig';
import { normalizeText } from './normalizeText';

export async function isNameAndSurnameTaken(nom: string, prenom: string): Promise<boolean> {
  try {
    const normalizedNom = normalizeText(nom);
    const normalizedPrenom = normalizeText(prenom);
    
    console.log('🔍 Vérification nom+prénom:', { normalizedNom, normalizedPrenom });

    const snapshot = await getDocs(collection(db, 'users'));
    console.log(`📊 ${snapshot.docs.length} utilisateurs trouvés dans la base`);

    for (const docSnap of snapshot.docs) {
      const user = docSnap.data();
      const nomDB = normalizeText(user.nom || '');
      const prenomDB = normalizeText(user.prenom || '');
      
      if (nomDB === normalizedNom && prenomDB === normalizedPrenom) {
        console.log('⚠️ Doublon trouvé !', { nomDB, prenomDB });
        return true;
      }
    }

    console.log('✅ Aucun doublon trouvé');
    return false;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification nom+prénom:', error);
    return false; // En cas d'erreur, on laisse passer pour ne pas bloquer
  }
}