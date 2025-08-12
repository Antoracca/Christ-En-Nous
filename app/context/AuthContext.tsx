// app/context/AuthContext.tsx - VERSION CORRIGÉE
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from 'services/firebase/firebaseConfig';

export interface UserProfile {
  uid: string;
  nom: string;
  prenom: string;
  email: string;
  photoURL?: string | null;
  emailVerified?: boolean;
  username?: string;
  phone?: string;
  birthdate?: string;
  ville?: string;
  pays?: string;
  quartier?: string;
  isBaptized?: boolean;
  baptizedByImmersion?: boolean;
  fonction?: string;
  sousFonction?: string;
  egliseOrigine?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  showSuccessModal: boolean;
  setShowSuccessModal: (value: boolean) => void;
  refreshUserProfile: () => Promise<void>;
  isRegistering: boolean;  // ✅ AJOUT
  setIsRegistering: (value: boolean) => void;  // ✅ AJOUT
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);  // ✅ DÉJÀ PRÉSENT (ligne 43)

  // Fonction pour rafraîchir le profil utilisateur
  const refreshUserProfile = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const freshUser = auth.currentUser;
      
      if (freshUser) {
        setUser(freshUser);
        
        try {
          const userDocRef = doc(db, 'users', freshUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const firestoreProfile = userDocSnap.data();
            setUserProfile({
              uid: freshUser.uid,
              nom: firestoreProfile.nom || '',
              prenom: firestoreProfile.prenom || '',
              email: freshUser.email || firestoreProfile.email || '',
              photoURL: freshUser.photoURL,
              emailVerified: freshUser.emailVerified,
              username: firestoreProfile.username,
              phone: firestoreProfile.phone,
              birthdate: firestoreProfile.birthdate,
              ville: firestoreProfile.ville,
              pays: firestoreProfile.pays,
              quartier: firestoreProfile.quartier,
              isBaptized: firestoreProfile.isBaptized,
              baptizedByImmersion: firestoreProfile.baptizedByImmersion,
              fonction: firestoreProfile.fonction,
              sousFonction: firestoreProfile.sousFonction,
              egliseOrigine: firestoreProfile.egliseOrigine,
            });
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
        }
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser?.uid || 'null');
      
      if (firebaseUser) {
        // Recharger les infos de l'utilisateur pour avoir les dernières données
        await firebaseUser.reload();
        const freshUser = auth.currentUser;
        
        if (freshUser) {
          setUser(freshUser);
          
          try {
            const userDocRef = doc(db, 'users', freshUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              const firestoreProfile = userDocSnap.data();
              setUserProfile({
                uid: freshUser.uid,
                nom: firestoreProfile.nom || '',
                prenom: firestoreProfile.prenom || '',
                email: freshUser.email || firestoreProfile.email || '',
                photoURL: freshUser.photoURL,
                emailVerified: freshUser.emailVerified,
                username: firestoreProfile.username,
                phone: firestoreProfile.phone,
                birthdate: firestoreProfile.birthdate,
                ville: firestoreProfile.ville,
                pays: firestoreProfile.pays,
                quartier: firestoreProfile.quartier,
                isBaptized: firestoreProfile.isBaptized,
                baptizedByImmersion: firestoreProfile.baptizedByImmersion,
                fonction: firestoreProfile.fonction,
                sousFonction: firestoreProfile.sousFonction,
                egliseOrigine: firestoreProfile.egliseOrigine,
              });
            } else {
              console.log('⚠️ Document utilisateur non trouvé dans Firestore');
              setUserProfile(null);
            }
          } catch (error) {
            console.error('❌ Erreur lors de la récupération du profil:', error);
            setUserProfile(null);
          }
        }
      } else {
        // Aucun utilisateur connecté
        setUser(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Dépendances vides - s'exécute une seule fois

  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    showSuccessModal,
    setShowSuccessModal,
    refreshUserProfile,
    isRegistering,  // ✅ AJOUT
    setIsRegistering,  // ✅ AJOUT
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};