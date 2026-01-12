// hooks/useFirestoreEmailSync.ts
// Hook pour synchroniser l'email Firestore après une reconnexion suite à un changement.

import { useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@/utils/storage';
import { db } from 'services/firebase/firebaseConfig';
import { useAuth } from '@/context/AuthContext';

export const useFirestoreEmailSync = () => {
  const { user, refreshUserProfile } = useAuth();

  useEffect(() => {
    // Cette fonction anonyme est déclarée async pour pouvoir utiliser await à l'intérieur de l'useEffect
    const checkAndSync = async () => {
      // On ne fait rien si l'utilisateur n'est pas encore chargé
      if (!user) {
        return;
      }

      try {
        console.log('🔍 [SYNC] Vérification d\'une synchronisation Firestore en attente...');

        // 1. Vérifier s'il y a une synchronisation en attente dans le stockage local
        const syncDataString = await AsyncStorage.getItem('@firestoreSyncPending');

        if (!syncDataString) {
          console.log('✅ [SYNC] Aucune synchronisation en attente.');
          return;
        }

        const syncData = JSON.parse(syncDataString);
        console.log('📋 [SYNC] Tâche de synchronisation trouvée pour:', syncData.email);

        // 2. S'assurer que la tâche concerne bien l'utilisateur actuellement connecté
        if (user.uid === syncData.uid) {
          console.log('🔄 [SYNC] Démarrage de la synchronisation pour l\'utilisateur connecté...');
          
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          // 3. Vérifier que le document existe et que la mise à jour est bien nécessaire
          if (userDoc.exists() && userDoc.data().email !== syncData.email) {
            console.log(`📝 [SYNC] Mise à jour de l'email dans Firestore: ${userDoc.data().email} → ${syncData.email}`);
            
            await updateDoc(userDocRef, {
              email: syncData.email,
              emailVerified: true, // L'email est forcément vérifié à ce stade
              lastEmailUpdate: new Date().toISOString()
            });

            console.log('✅ [SYNC] Firestore synchronisé avec succès !');

            // 4. Rafraîchir le profil dans le contexte de l'application
            await refreshUserProfile();
          } else {
             console.log('👍 [SYNC] L\'email dans Firestore est déjà à jour.');
          }

          // 5. Nettoyer les données temporaires pour ne pas re-lancer la synchro
          console.log('🧹 [SYNC] Nettoyage des données de synchronisation temporaires...');
          await AsyncStorage.removeItem('@firestoreSyncPending');
          await AsyncStorage.removeItem('@tempPassword');
          console.log('🗑️ [SYNC] Nettoyage terminé.');

        }
      } catch (error) {
        console.error('❌ [SYNC] Erreur critique lors de la synchronisation Firestore:', error);
      }
    };

    checkAndSync();

  }, [user, refreshUserProfile]); // Le hook se déclenchera à chaque changement de l'objet `user`
};