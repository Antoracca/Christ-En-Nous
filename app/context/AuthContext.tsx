// app/context/AuthContext.tsx - VERSION AVEC GESTION DU MODAL
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
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
  postRegistrationSuccess: boolean; // NOUVEAU : Pour gérer l'état post-inscription
  setPostRegistrationSuccess: (value: boolean) => void; // NOUVEAU
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [postRegistrationSuccess, setPostRegistrationSuccess] = useState(false); // NOUVEAU

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await firebaseUser.reload();
        const freshUser = auth.currentUser;
        if (freshUser) {
            setUser(freshUser);
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
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    postRegistrationSuccess,
    setPostRegistrationSuccess,
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
