import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, collection, addDoc, query, where, getDocs,Timestamp, getDoc, limit   } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../services/firebase/firebaseConfig';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
// ... (Les interfaces ChurchRole, UserProfile, AuthContextType restent les mêmes)
export interface ChurchRole {
  fonction: string;
  sousFonction: string;
}

export interface UserProfile {
  lastPasswordUpdate: any;
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
  roles?: ChurchRole[];
  otherRoles?: string[];
  egliseOrigine?: string;
  createdAt?: string;
  lastEmailUpdate?: string;
  passwordHistory?: string[];
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
  logout: () => Promise<void>;
  syncEmailToFirestore: (newEmail: string) => Promise<void>;
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

  // ✅ LOGIQUE DE SYNCHRONISATION INTÉGRÉE ICI POUR CASSER LA BOUCLE
  useEffect(() => {
    const checkAndSync = async () => {
      if (!user) return; // Ne rien faire si l'utilisateur n'est pas connecté

      try {
        console.log('🔍 [SYNC] Vérification d\'une synchronisation Firestore en attente...');
        const syncDataString = await AsyncStorage.getItem('@firestoreSyncPending');

        if (!syncDataString) {
          console.log('✅ [SYNC] Aucune synchronisation en attente.');
          return;
        }

        const syncData = JSON.parse(syncDataString);
        console.log('📋 [SYNC] Tâche de synchronisation trouvée pour:', syncData.email);

        if (user.uid === syncData.uid) {
          console.log('🔄 [SYNC] Démarrage de la synchronisation pour l\'utilisateur connecté...');
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists() && userDoc.data().email !== syncData.email) {
            console.log(`📝 [SYNC] Mise à jour de l'email dans Firestore: ${userDoc.data().email} → ${syncData.email}`);
            await updateDoc(userDocRef, {
              email: syncData.email,
              emailVerified: true,
              lastEmailUpdate: new Date().toISOString()
            });
            console.log('✅ [SYNC] Firestore synchronisé avec succès !');
            await refreshUserProfile();
          } else {
            console.log('👍 [SYNC] L\'email dans Firestore est déjà à jour.');
          }

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
  }, [user, refreshUserProfile]); // Se déclenche quand l'utilisateur se connecte
async function buildClientContext() {
  let ipAddress: string | null = null;
  let networkType: string | null = null;

  try {
    const state = await (await import('expo-network')).getNetworkStateAsync();
    networkType = state.type ?? null;
  } catch { /* no-op */ }

  try {
    ipAddress = await (await import('expo-network')).getIpAddressAsync();
  } catch { /* no-op */ }

  const os = Platform.OS === 'ios' ? 'iOS' : 'Android';

  const deviceInfo = {
    device: Device.deviceName || Device.modelName || 'Appareil inconnu',
    os,
    osVersion: Device.osVersion || 'Inconnue',
    deviceType:
      Device.deviceType ? (Device.DeviceType[Device.deviceType] || 'Inconnu') : 'Inconnu',
    brand: Device.brand || null,
    modelName: Device.modelName || null,
  };

  // Empreinte simple et déterministe (suffisant côté client)
  const deviceFingerprint = [
    os,
    deviceInfo.brand ?? 'brand?',
    deviceInfo.modelName ?? 'model?',
    deviceInfo.osVersion
  ].join('|');

  return {
    ...deviceInfo,
    ipAddress,
    networkType,
    deviceFingerprint,
    source: 'mobile-app',
  };
}


const logout = useCallback(async () => {
  const currentUser = auth.currentUser;
  try {
    if (currentUser) {
      console.log('DBG[logout] enter function, hasUser=', true);
      const sessionId = await AsyncStorage.getItem('@currentSessionId');
      console.log('DBG[logout] step=0 sessionId from storage =', sessionId);

      const ctx = await buildClientContext();

      // 1) désactiver le login actif pour ce sessionId
      console.log('DBG[logout] step=1 about to getDocs(activeSessionQuery)');
      const activeSessionQuery = query(
        collection(db, 'loginSessions'),
        where('userId', '==', currentUser.uid),
        where('sessionId', '==', sessionId),
        where('eventType', '==', 'login'),
        limit(1)
      );
      const snapshot = await getDocs(activeSessionQuery);
      console.log('DBG[logout] step=1 OK snapshot.empty =', snapshot.empty);

      if (!snapshot.empty) {
        console.log('DBG[logout] step=2 about to updateDoc(isActive=false) on', snapshot.docs[0].id);
        await updateDoc(snapshot.docs[0].ref, { isActive: false, endedAt: Timestamp.now() });
        console.log('DBG[logout] step=2 OK update isActive=false');
      } else {
        console.log('DBG[logout] step=1 no active session doc, skip update');
      }

      // 1.bis) par sécurité, désactiver toute autre session active du même appareil
      if (ctx.deviceFingerprint) {
        const othersQ = query(
          collection(db, 'loginSessions'),
          where('userId', '==', currentUser.uid),
          where('deviceFingerprint', '==', ctx.deviceFingerprint),
          where('isActive', '==', true)
        );
        const othersSnap = await getDocs(othersQ);
        await Promise.all(othersSnap.docs.map(d => updateDoc(d.ref, { isActive: false, endedAt: Timestamp.now() })));
      }

      // 2) ajouter l’event LOGOUT (normalisé)
      console.log('DBG[logout] step=3 about to addDoc(logout event)');
      await addDoc(collection(db, 'loginSessions'), {
        userId: currentUser.uid,
        timestamp: Timestamp.now(),
        sessionId: sessionId || `${currentUser.uid}_${Date.now()}`,
        type: 'logout',        // ✅ cohérent partout
        eventType: 'logout',
        eventDetail: 'disconnect',
        device: ctx.device,
        os: ctx.os,
        osVersion: ctx.osVersion,
        deviceType: ctx.deviceType,
        brand: ctx.brand,
        modelName: ctx.modelName,
        deviceFingerprint: ctx.deviceFingerprint,
        ipAddress: ctx.ipAddress,
        networkType: ctx.networkType,
        source: ctx.source
      });
      console.log('DBG[logout] step=3 OK addDoc logout event');

      // 3) cleanup local
      await AsyncStorage.removeItem('@currentSessionId');
      console.log('DBG[logout] step=4 removed @currentSessionId');
    }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la déconnexion:", error);
  } finally {
    console.log('DBG[logout] step=5 auth.signOut()');
    await auth.signOut();
    console.log('DBG[logout] step=5 done signOut()');
  }
}, []);



  const syncEmailToFirestore = useCallback(async (newEmail: string) => {
    console.log('🔄 Synchronisation email Firestore:', newEmail);
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Utilisateur non connecté');
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) throw new Error('Document utilisateur introuvable');
      await updateDoc(userDocRef, {
        email: newEmail.toLowerCase(),
        emailVerified: true,
        lastEmailUpdate: new Date().toISOString()
      });
      console.log('✅ Email synchronisé dans Firestore');
      await refreshUserProfile();
    } catch (error: any) {
      console.error('❌ Erreur sync Firestore:', error);
      throw error;
    }
  }, [refreshUserProfile]);

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
    logout,
    syncEmailToFirestore,
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