import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; 
import { auth, db } from 'services/firebase/firebaseConfig';

export interface ChurchRole {
  fonction: string;
  sousFonction: string;
}

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
  // Champs dépréciés (conservés pour la compatibilité)
  fonction?: string;
  sousFonction?: string;
  // Nouveaux champs pour une gestion plus flexible
  roles?: ChurchRole[];
  otherRoles?: string[]; // Pour les rôles personnalisés
  egliseOrigine?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  shouldShowRegisterSuccess: { show: boolean; userName: string; userEmail: string; } | null;
  setShouldShowRegisterSuccess: (value: { show: boolean; userName: string; userEmail: string; } | null) => void;
  isRegistering: boolean;
  setIsRegistering: (isRegistering: boolean) => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [shouldShowRegisterSuccess, setShouldShowRegisterSuccess] = useState<{ show: boolean; userName: string; userEmail: string; } | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const refreshUserProfile = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await currentUser.reload();
      setUser(auth.currentUser ? { ...auth.currentUser } : null);
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
  let unsubscribeProfile: () => void = () => {};

  if (user) { 
    if (!userProfile) setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    
    unsubscribeProfile = onSnapshot(
      userDocRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          const firestoreData = docSnap.data();
          setUserProfile({
            ...(firestoreData as UserProfile),
            uid: user.uid,
            email: user.email || firestoreData.email || '',
            emailVerified: user.emailVerified || firestoreData.emailVerified || false,
            photoURL: firestoreData.photoURL || user.photoURL || null,
          });
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }, 
      (error) => {
        console.error('Erreur onSnapshot:', error);
        setUserProfile(null);
        setLoading(false);
      }
    );
  } else {
    setLoading(false);
  }

  return () => unsubscribeProfile();
}, [user]);


  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    shouldShowRegisterSuccess,
    setShouldShowRegisterSuccess,
    isRegistering,
    setIsRegistering,
    refreshUserProfile,
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
