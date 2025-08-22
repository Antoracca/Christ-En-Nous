// hooks/useMigrateUserRoles.ts
// Hook pour migrer automatiquement les anciens formats vers le nouveau format roles[]

import { useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from 'services/firebase/firebaseConfig';
import { useAuth } from '@/context/AuthContext';

export const useMigrateUserRoles = () => {
  const { user, userProfile, refreshUserProfile } = useAuth();

  useEffect(() => {
    const migrateRolesFormat = async () => {
      if (!user || !userProfile) return;

      // Vérifier si la migration est nécessaire
      const hasOldFormat = userProfile.fonction && !userProfile.roles;
      const hasEmptyRoles = userProfile.roles && Array.isArray(userProfile.roles) && userProfile.roles.length === 0;
      
      if (!hasOldFormat && !hasEmptyRoles) {
        console.log('✅ Format de rôles déjà à jour');
        return;
      }

      console.log('🔄 Migration des rôles nécessaire...');

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          console.error('Document utilisateur introuvable');
          return;
        }

        const currentData = userDoc.data();
        const updateData: any = {};

        // Construire le tableau roles[] à partir des anciennes données
        const newRoles = [];

        // Si on a fonction/sousFonction, les ajouter
        if (currentData.fonction) {
          newRoles.push({
            fonction: currentData.fonction,
            sousFonction: currentData.sousFonction || ''
          });
        }

        // Si on a des otherRoles, les convertir aussi
        if (currentData.otherRoles && Array.isArray(currentData.otherRoles)) {
          currentData.otherRoles.forEach((role: string) => {
            if (role && role.trim()) {
              newRoles.push({
                fonction: role,
                sousFonction: ''
              });
            }
          });
        }

        // Mettre à jour uniquement si on a des rôles à migrer
        if (newRoles.length > 0) {
          updateData.roles = newRoles;
          
          // Optionnel : nettoyer les anciens champs après migration
          // updateData.fonction = null;
          // updateData.sousFonction = null;
          // updateData.otherRoles = null;

          console.log('📝 Migration des rôles:', newRoles);
          
          await updateDoc(userDocRef, updateData);
          
          console.log('✅ Migration réussie !');
          
          // Rafraîchir le profil pour avoir les nouvelles données
          await refreshUserProfile();
        } else {
          console.log('⚠️ Aucun rôle à migrer');
        }
      } catch (error) {
        console.error('❌ Erreur migration rôles:', error);
      }
    };

    migrateRolesFormat();
  }, [user?.uid, userProfile?.fonction, userProfile?.roles]); // Se déclenche quand les données changent
};