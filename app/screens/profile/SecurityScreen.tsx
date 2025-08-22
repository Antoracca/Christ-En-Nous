// app/screens/profile/SecurityScreen.tsx
// 🔐 Écran de sécurité complet avec gestion mot de passe, sessions et profil
// Version 1.0 - Architecture cohérente avec ModifierProfilScreen.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
  SafeAreaView, ScrollView, StatusBar, Platform, Modal,
  RefreshControl
} from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { 
  updatePassword, EmailAuthProvider, reauthenticateWithCredential,
  signOut
} from 'firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  doc, updateDoc, collection, addDoc, query, where, 
  orderBy, limit, getDocs, Timestamp, deleteDoc
} from 'firebase/firestore';
import * as Device from 'expo-device';
import * as Network from 'expo-network';
import { BlurView } from 'expo-blur';

// Hooks et services
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { auth, db } from 'services/firebase/firebaseConfig';

// Types
// REPLACE l’interface LoginSession par :
interface LoginSession {
  id: string;
  timestamp: Timestamp;
  sessionId: string;
  type: 'login' | 'logout';        // <- normalisé
  eventType: 'login' | 'logout';   // <- sémantique
  eventDetail?: 'connect' | 'reconnect' | 'disconnect';

  device: string;
  os: string;
  osVersion: string;
  deviceType: string;
  modelName?: string;
  brand?: string;
  deviceFingerprint?: string;

  ipAddress?: string | null;
  networkType?: string | null;
  source?: string;

  isActive?: boolean;
  isCurrent: boolean;
  isLoginSession?: boolean;

  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
}


interface SecurityStats {
  lastPasswordUpdate: Date | null;
  daysSincePasswordUpdate: number;
  profileCompleteness: number;
  missingFields: string[];
  totalSessions: number;
  needsPasswordUpdate: boolean;
}
// === Helpers UI globaux (portée module) ===
export const deviceTypeLabel = (raw?: string) => {
  switch ((raw || '').toUpperCase()) {
    case 'PHONE':   return 'Téléphone';
    case 'TABLET':  return 'Tablette';
    case 'DESKTOP': return 'Ordinateur';
    case 'TV':      return 'TV';
    default:        return raw || 'Inconnu';
  }
};

export function deviceDisplayName(
  s: { device?: string; modelName?: string | null } | LoginSession
): string {
  const device = (s as any).device ?? null;
  const model  = (s as any).modelName ?? null;
  if (device && model && model !== device) return `${device} (${model})`;
  return device || model || 'Appareil inconnu';
}

// === Helper : contexte appareil / réseau ===
async function buildClientContext() {
  let ipAddress: string | null = null;
  let networkType: string | null = null;

  try {
    const state = await Network.getNetworkStateAsync();
    networkType = (state?.type as any) ?? null;
  } catch {}

  try {
    ipAddress = await Network.getIpAddressAsync();
  } catch {}

  const os = Platform.OS === 'ios' ? 'iOS' : 'Android';

  const deviceInfo = {
    device: Device.deviceName || Device.modelName || 'Appareil inconnu',
    os,
    osVersion: Device.osVersion || 'Inconnue',
    deviceType:
      Device.deviceType && (Device as any).DeviceType
        ? (Device as any).DeviceType[Device.deviceType] || 'Inconnu'
        : 'Inconnu',
    brand: Device.brand || null,
    modelName: Device.modelName || null,
  };

  const deviceFingerprint = [os, deviceInfo.brand ?? 'brand?', deviceInfo.modelName ?? 'model?', deviceInfo.osVersion].join('|');

  return {
    ...deviceInfo,
    ipAddress,
    networkType,
    deviceFingerprint,
    source: 'mobile-app',
  };
}


// =================================================================
// COMPOSANTS UI RÉUTILISABLES
// =================================================================

const SecurityCard = ({ children, title, icon }: { 
  children: React.ReactNode; 
  title: string; 
  icon: keyof typeof Feather.glyphMap;
}) => {
  const theme = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconContainer, { backgroundColor: theme.colors.primary + '1A' }]}>
          <Feather name={icon} size={24} color={theme.colors.primary} />
        </View>
        <Text style={[styles.cardTitle, { color: theme.custom.colors.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
};
const clearSessionHistory = (user: any, setLoginSessions: any, addCurrentSession: any, loadLoginSessions: any) => {
  Alert.alert(
    'Effacer l\'historique',
    'Supprimer toutes les sessions (sans vous déconnecter) ?',
    [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Effacer',
        style: 'destructive',
        onPress: async () => {
          try {
            const sessionsQuery = query(
              collection(db, 'loginSessions'),
              where('userId', '==', user?.uid)
            );
            const snapshot = await getDocs(sessionsQuery);
            
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            
            setLoginSessions([]);
            Alert.alert('Succès', 'Historique effacé');
            
            // Recréer la session actuelle
            await addCurrentSession();
            await loadLoginSessions();
          } catch (error) {
            Alert.alert('Erreur', 'Impossible d\'effacer l\'historique');
          }
        }
      }
    ]
  );
};

const SecurityActionButton = ({ 
  icon, label, description, onPress, warning = false, success = false 
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
  warning?: boolean;
  success?: boolean;
}) => {
  const theme = useAppTheme();
  const color = warning ? theme.colors.error : success ? '#10B981' : theme.colors.primary;
  
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={[styles.actionIconContainer, { backgroundColor: color + '1A' }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <View style={styles.actionTextContainer}>
        <Text style={[styles.actionLabel, { color: theme.custom.colors.text }]}>{label}</Text>
        <Text style={[styles.actionDescription, { color: theme.custom.colors.placeholder }]}>
          {description}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={theme.custom.colors.placeholder} />
    </TouchableOpacity>
  );
};

const StatusBadge = ({ 
  status, label 
}: { 
  status: 'success' | 'warning' | 'error'; 
  label: string; 
}) => {
  const colors = {
    success: { bg: '#10B981', text: '#065F46' },
    warning: { bg: '#F59E0B', text: '#92400E' },
    error: { bg: '#EF4444', text: '#991B1B' }
  };
  
  return (
    <View style={[styles.statusBadge, { backgroundColor: colors[status].bg + '20' }]}>
      <Text style={[styles.statusText, { color: colors[status].text }]}>{label}</Text>
    </View>
  );
};

const SessionItem = ({ 
  session, onRevoke, isCurrent 
}: { 
  session: LoginSession; 
  onRevoke: (id: string) => void; 
  isCurrent: boolean; 
}) => {
  const theme = useAppTheme();
  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  return (
    <View style={[styles.sessionItem, { borderBottomColor: theme.colors.outline }]}>
      <View style={styles.sessionInfo}>
      <View style={styles.sessionHeader}>
 <Text style={[styles.sessionDevice, { color: theme.custom.colors.text }]}>
  {session.type === 'login'
    ? (session.eventDetail === 'reconnect' ? '🔁' : '➡️')
    : '⬅️'} {session.device}
</Text>

  {session.isActive && <StatusBadge status="success" label="Session active" />}
</View>
       <Text style={[styles.sessionDetails, { color: theme.custom.colors.placeholder }]}>
  {session.os} {session.osVersion}
  {session.brand && ` • ${session.brand}`}
  {session.modelName && session.modelName !== session.device && ` • ${session.modelName}`}
  {(session.ipAddress || session.networkType) && ' • '}
  {session.ipAddress ? `IP: ${session.ipAddress}` : ''}
  {session.ipAddress && session.networkType ? ' • ' : ''}
  {session.networkType ? `Réseau: ${session.networkType}` : ''}
{` • ${deviceTypeLabel(session.deviceType)}`}

</Text>


        <Text style={[styles.sessionDate, { color: theme.custom.colors.placeholder }]}>
          {formatDate(session.timestamp)}
        </Text>
        {session.location && (
          <Text style={[styles.sessionLocation, { color: theme.custom.colors.placeholder }]}>
            📍 {session.location.city}, {session.location.country}
          </Text>
        )}
      </View>
      {!isCurrent && (
        <TouchableOpacity 
          style={[styles.revokeButton, { backgroundColor: theme.colors.error + '1A' }]}
          onPress={() => onRevoke(session.id)}
        >
          <Feather name="x" size={16} color={theme.colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );
};

// =================================================================
// COMPOSANT PRINCIPAL
// =================================================================

export default function SecurityScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const { user, userProfile, refreshUserProfile } = useAuth();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loginSessions, setLoginSessions] = useState<LoginSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);

  // =================================================================
  // LOGIQUE DE CALCUL DES STATISTIQUES DE SÉCURITÉ
  // =================================================================
  
  const securityStats = useMemo((): SecurityStats => {
  if (!userProfile) {
   
    return {
      lastPasswordUpdate: null,
      daysSincePasswordUpdate: 0,
      profileCompleteness: 0,
      missingFields: [],
      totalSessions: 0,
      needsPasswordUpdate: false
    };
  }
  

  // Calcul dernière mise à jour du mot de passe
  const lastPasswordUpdate = userProfile.lastPasswordUpdate 
    ? new Date(userProfile.lastPasswordUpdate)
    : userProfile.createdAt 
      ? new Date(userProfile.createdAt) 
      : new Date();

  const daysSincePasswordUpdate = Math.floor(
    (Date.now() - lastPasswordUpdate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // =================================================================
  // CALCUL DE COMPLÉTUDE - COMPATIBLE ANCIEN ET NOUVEAU FORMAT
  // =================================================================
  
  const requiredFields = [
    { key: 'prenom', label: 'Prénom' },
    { key: 'nom', label: 'Nom' },
    { key: 'username', label: 'Nom d\'utilisateur' },
    { key: 'emailVerified', label: 'Email vérifié' },
    { key: 'birthdate', label: 'Date de naissance' },
    { key: 'phone', label: 'Numéro de téléphone' },
    { key: 'roles', label: 'Rôle dans l\'église' }
  ];
  
  const completedFields = requiredFields.filter(field => {
    if (field.key === 'emailVerified') {
      return userProfile.emailVerified === true;
    }
    
    if (field.key === 'roles') {
      // COMPATIBILITÉ TOTALE : Accepter les 3 formats possibles
      
      // Format 1 : Nouveau format avec tableau roles[]
      const hasNewFormat = userProfile.roles && 
                          Array.isArray(userProfile.roles) && 
                          userProfile.roles.length > 0;
      
      // Format 2 : Ancien format avec fonction/sousFonction directs
      const hasOldFormat = userProfile.fonction && 
                          typeof userProfile.fonction === 'string' && 
                          userProfile.fonction.trim() !== '';
      
      // Format 3 : Format hybride avec otherRoles[]
      const hasOtherRoles = userProfile.otherRoles && 
                           Array.isArray(userProfile.otherRoles) && 
                           userProfile.otherRoles.length > 0;
      
      // Accepter n'importe lequel de ces formats
      return hasNewFormat || hasOldFormat || hasOtherRoles;
    }
    
    // Pour tous les autres champs
    const value = userProfile[field.key as keyof typeof userProfile];
    return value && value.toString().trim() !== '';
  });

  const missingFields = requiredFields.filter(field => {
    if (field.key === 'emailVerified') {
      return userProfile.emailVerified !== true;
    }
    
    if (field.key === 'roles') {
      // Même logique pour les champs manquants
      const hasNewFormat = userProfile.roles && 
                          Array.isArray(userProfile.roles) && 
                          userProfile.roles.length > 0;
      
      const hasOldFormat = userProfile.fonction && 
                          typeof userProfile.fonction === 'string' && 
                          userProfile.fonction.trim() !== '';
      
      const hasOtherRoles = userProfile.otherRoles && 
                           Array.isArray(userProfile.otherRoles) && 
                           userProfile.otherRoles.length > 0;
      
      // Manquant si AUCUN des formats n'est présent
      return !(hasNewFormat || hasOldFormat || hasOtherRoles);
    }
    
    const value = userProfile[field.key as keyof typeof userProfile];
    return !value || value.toString().trim() === '';
  }).map(field => field.label);

  const profileCompleteness = Math.round((completedFields.length / requiredFields.length) * 100);
 const activeByDevice = new Set(
  loginSessions
    .filter(s => s.isActive && s.type === 'login')
    .map(s => s.deviceFingerprint || s.sessionId)
);
const totalSessions = activeByDevice.size;
  return {
    lastPasswordUpdate,
    daysSincePasswordUpdate,
    profileCompleteness,
    missingFields,
    totalSessions,
    needsPasswordUpdate: daysSincePasswordUpdate >= 90
  };
}, [userProfile, loginSessions]);
// Registre des appareils actifs (distincts par deviceFingerprint)
const activeDevices = useMemo(() => {
  const map = new Map<string, { name: string; lastTs: number }>();
  for (const s of loginSessions) {
    if (s.type === 'login' && s.isActive) {
      const key = s.deviceFingerprint || s.sessionId;
      const name = deviceDisplayName(s);
      const ts = s.timestamp?.toMillis?.() ?? 0;
      const prev = map.get(key);
      if (!prev || ts > prev.lastTs) {
        map.set(key, { name, lastTs: ts });
      }
    }
  }
  // tri du plus récent au plus ancien
  return Array.from(map.values()).sort((a, b) => b.lastTs - a.lastTs);
}, [loginSessions]);

type Group = {
  header: string;        // ex. "iPhone 13" ou "Samsung S22"
  active: boolean;       // au moins un login isActive=true
  lastEventMs: number;   // pour trier les groupes
  sessions: LoginSession[];
};

const groupedByDevice = useMemo<Group[]>(() => {
  const byKey = new Map<string, Group>();

  for (const s of loginSessions) {
    const key = s.deviceFingerprint || `${s.brand || ''}|${s.modelName || ''}|${s.device || ''}`;
    const header = deviceDisplayName(s);
    const lastMs = s.timestamp?.toMillis?.() ?? 0;
    const group = byKey.get(key) || { header, active: false, lastEventMs: 0, sessions: [] };
    group.sessions.push(s);
    group.active = group.active || (s.type === 'login' && !!s.isActive);
    group.lastEventMs = Math.max(group.lastEventMs, lastMs);
    byKey.set(key, group);
  }

  // Tri groupes par dernière activité desc
  const result = Array.from(byKey.values()).sort((a, b) => b.lastEventMs - a.lastEventMs);

  // Tri interne des sessions par date desc
  for (const g of result) {
    g.sessions.sort((a, b) => {
      const ta = a.timestamp?.toMillis?.() ?? 0;
      const tb = b.timestamp?.toMillis?.() ?? 0;
      return tb - ta;
    });
  }

  return result;
}, [loginSessions]);

  // =================================================================
  // GESTION DES SESSIONS DE CONNEXION
  // =================================================================

  // REPLACE ENTIER du corps de addCurrentSession par ceci :
const addCurrentSession = useCallback(async () => {
  if (!user) return;

  try {
    // 0) Y a‑t‑il déjà une session courante connue localement ?
    const existingSessionId = await AsyncStorage.getItem('@currentSessionId');
    if (existingSessionId) {
      // Vérifier si le login doc correspondant est toujours actif
      const activeByIdQ = query(
        collection(db, 'loginSessions'),
        where('userId', '==', user.uid),
        where('sessionId', '==', existingSessionId),
        where('eventType', '==', 'login'),
        where('isActive', '==', true),
        limit(1)
      );
      const activeByIdSnap = await getDocs(activeByIdQ);
      if (!activeByIdSnap.empty) {
        // Rien à créer : juste un heartbeat
        await updateDoc(activeByIdSnap.docs[0].ref, { lastSeen: Timestamp.now() });
        return;
      } else {
        // Nettoyer l'id obsolète
        await AsyncStorage.removeItem('@currentSessionId');
      }
    }

    // 1) Contexte appareil
    const ctx = await buildClientContext();

    // 2) Tenter de réutiliser une session active de CE device
    const activeSameDeviceQ = query(
      collection(db, 'loginSessions'),
      where('userId', '==', user.uid),
      where('deviceFingerprint', '==', ctx.deviceFingerprint),
      where('eventType', '==', 'login'),
      where('isActive', '==', true),
      limit(1)
    );
    const activeSameDeviceSnap = await getDocs(activeSameDeviceQ);
    if (!activeSameDeviceSnap.empty) {
      const reuseRef = activeSameDeviceSnap.docs[0].ref;
      const reuseData = activeSameDeviceSnap.docs[0].data();
      await updateDoc(reuseRef, { lastSeen: Timestamp.now() });
      await AsyncStorage.setItem('@currentSessionId', reuseData.sessionId);
      console.log('♻️ Session réutilisée:', reuseData.sessionId);
      return;
    }

    // 3) Déterminer si RECONNEXION (dernier event = logout < 15 min)
    let isReconnect = false;
    const lastEventQ = query(
      collection(db, 'loginSessions'),
      where('userId', '==', user.uid),
      where('deviceFingerprint', '==', ctx.deviceFingerprint),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    const lastEventSnap = await getDocs(lastEventQ);
    if (!lastEventSnap.empty) {
      const last = lastEventSnap.docs[0].data();
      if (last.eventType === 'logout') {
        const lastMs = last.timestamp?.toMillis ? last.timestamp.toMillis() : Date.now();
        if (Date.now() - lastMs < 15 * 60 * 1000) isReconnect = true;
      }
    }

    // 4) Créer une NOUVELLE session (si rien à réutiliser)
    const sessionId = `${user.uid}_${Date.now()}`;
    await addDoc(collection(db, 'loginSessions'), {
      userId: user.uid,
      timestamp: Timestamp.now(),
      lastSeen: Timestamp.now(),

      sessionId,
      type: 'login',
      eventType: 'login',
      eventDetail: isReconnect ? 'reconnect' : 'connect',

      device: ctx.device,
      os: ctx.os,
      osVersion: ctx.osVersion,
      deviceType: ctx.deviceType,
      brand: ctx.brand,
      modelName: ctx.modelName,
      deviceFingerprint: ctx.deviceFingerprint,
      ipAddress: ctx.ipAddress,
      networkType: ctx.networkType,
      source: ctx.source,

      isActive: true,
      isLoginSession: true,
    });

    await AsyncStorage.setItem('@currentSessionId', sessionId);
    console.log('🆕 Nouvelle session (login) créée:', sessionId, isReconnect ? '(reconnexion)' : '(connexion)');
  } catch (error) {
    console.error('Erreur ajout session:', error);
  }
}, [user]);


const recordLogout = useCallback(async () => {
  if (!user) return;

  try {
    const sessionId = await AsyncStorage.getItem('@currentSessionId');
    const ctx = await buildClientContext();

    if (sessionId) {
      // Enregistrer l'événement de déconnexion (normalisé + enrichi)
      await addDoc(collection(db, 'loginSessions'), {
        userId: user.uid,
        timestamp: Timestamp.now(),
        sessionId: sessionId,
        type: 'logout',          // ✅ normalisé
        eventType: 'logout',
        eventDetail: 'disconnect',

        // Contexte appareil/réseau
        device: ctx.device,
        os: ctx.os,
        osVersion: ctx.osVersion,
        deviceType: ctx.deviceType,
        brand: ctx.brand,
        modelName: ctx.modelName,
        deviceFingerprint: ctx.deviceFingerprint,
        ipAddress: ctx.ipAddress,
        networkType: ctx.networkType,
        source: ctx.source,
      });

      // Marquer la session login correspondante comme inactive (si présente)
      const activeSessionQuery = query(
        collection(db, 'loginSessions'),
        where('sessionId', '==', sessionId),
        where('eventType', '==', 'login'),
        limit(1)
      );
      const snapshot = await getDocs(activeSessionQuery);
      if (!snapshot.empty) {
        await updateDoc(snapshot.docs[0].ref, { isActive: false, endedAt: Timestamp.now() });
      }

      await AsyncStorage.removeItem('@currentSessionId');
      console.log('🚪 Déconnexion enregistrée');
    }
  } catch (error) {
    console.error('Erreur enregistrement déconnexion:', error);
  }
}, [user]);


  const loadLoginSessions = useCallback(async () => {
  if (!user) return;

  try {
    setLoadingSessions(true);
    
    const sessionsQuery = query(
      collection(db, 'loginSessions'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(50) // Afficher les 50 derniers événements
    );

    const snapshot = await getDocs(sessionsQuery);
    const sessions: LoginSession[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      isCurrent: doc.data().isActive || false
    } as LoginSession));

    setLoginSessions(sessions);
  } catch (error) {
    console.error('Erreur chargement sessions:', error);
  } finally {
    setLoadingSessions(false);
  }
}, [user]);

  const revokeSession = async (sessionId: string) => {
    Alert.alert(
      'Révoquer la session',
      'Êtes-vous sûr de vouloir révoquer cette session ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Révoquer',
          style: 'destructive',
          onPress: async () => {
            try {
              setRevokingSession(sessionId);
              await deleteDoc(doc(db, 'loginSessions', sessionId));
              setLoginSessions(prev => prev.filter(s => s.id !== sessionId));
              Alert.alert('Succès', 'Session révoquée avec succès.');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de révoquer la session.');
            } finally {
              setRevokingSession(null);
            }
          }
        }
      ]
    );
  };

  const signOutAllDevices = () => {
    Alert.alert(
      'Déconnexion générale',
      'Cela va vous déconnecter de tous vos appareils. Vous devrez vous reconnecter partout.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'destructive',
          onPress: async () => {
            try {
              // Supprimer toutes les sessions de cet utilisateur
              const sessionsQuery = query(
                collection(db, 'loginSessions'),
                where('userId', '==', user?.uid)
              );
              const snapshot = await getDocs(sessionsQuery);
              
              const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
              await Promise.all(deletePromises);
              
              // Déconnexion Firebase
              await signOut(auth);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de déconnecter tous les appareils.');
            }
          }
        }
      ]
    );
  };

  // =================================================================
  // GESTION DU CHANGEMENT D'EMAIL
  // =================================================================

  const navigateToChangeEmail = () => {
    navigation.navigate('ChangeEmail' as never);
  };

  // =================================================================
  // EFFECTS
  // =================================================================

  // Lance une fois au montage : établit/relance la session si besoin
useEffect(() => {
  addCurrentSession();
}, [addCurrentSession]);

// À chaque focus on lance l'actualisation complète automatiquement
useFocusEffect(
  useCallback(() => {
    if (!user) return;
    
    const refreshData = async () => {
      try {
        await Promise.all([
          refreshUserProfile(),
          loadLoginSessions()
        ]);
      } catch (error) {
        console.error('Erreur lors du rafraîchissement:', error);
      }
    };
    refreshData();
  }, [user?.uid]) // Seulement quand l'uid change, pas les fonctions
);



  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshUserProfile(),
        loadLoginSessions()
      ]);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshUserProfile, loadLoginSessions]);

  // =================================================================
  // RENDER
  // =================================================================

  if (!userProfile) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={onRefresh} 
            tintColor={theme.colors.primary} 
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================================
            PROFIL PERSONNEL
        ================================================================= */}
        <SecurityCard title="Profil personnel" icon="user">
          <View style={styles.profileCompletenessContainer}>
            <View style={styles.completenessHeader}>
              <Text style={[styles.completenessTitle, { color: theme.custom.colors.text }]}>
                Complétude du profil
              </Text>
              <View style={styles.completenessPercentage}>
                <Text style={[styles.percentageText, { color: theme.colors.primary }]}>
                  {securityStats.profileCompleteness}%
                </Text>
                {securityStats.profileCompleteness === 100 && (
                  <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                )}
              </View>
            </View>
            
            <View style={[styles.progressBar, { backgroundColor: '#E5E7EB' }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${securityStats.profileCompleteness}%`,
                    backgroundColor: securityStats.profileCompleteness === 100 ? '#10B981' : 
                                   securityStats.profileCompleteness >= 75 ? '#3B82F6' :
                                   securityStats.profileCompleteness >= 50 ? '#F59E0B' : '#EF4444'
                  }
                ]} 
              />
            </View>

            {securityStats.missingFields.length > 0 && (
              <View style={styles.missingFieldsContainer}>
                <Text style={[styles.missingFieldsTitle, { color: '#F59E0B' }]}>
                  ⚠️ Champs manquants ({securityStats.missingFields.length}) :
                </Text>
                <Text style={[styles.missingFieldsList, { color: theme.custom.colors.placeholder }]}>
                  {securityStats.missingFields.join(' • ')}
                </Text>
                {securityStats.missingFields.includes('Email vérifié') && (
                  <Text style={[styles.emailWarning, { color: '#EF4444' }]}>
                    ⚠️ Votre email n&apos;est pas vérifié. Vérifiez votre boîte de réception.
                  </Text>
                )}
                <Text style={[styles.missingFieldsHelper, { color: theme.custom.colors.placeholder }]}>
                  Complétez ces informations pour améliorer la sécurité de votre compte
                </Text>
              </View>
            )}
          </View>

          <SecurityActionButton
            icon="edit"
            label="Compléter le profil"
            description="Modifier vos informations personnelles"
            onPress={() => navigation.navigate('ModifierProfil' as never)}
            success={securityStats.profileCompleteness === 100}
          />
        </SecurityCard>

        {/* =================================================================
            MOT DE PASSE
        ================================================================= */}
        <SecurityCard title="Mot de passe" icon="lock">
          <View style={styles.passwordInfoContainer}>
            <View style={styles.passwordHeader}>
              <Text style={[styles.passwordTitle, { color: theme.custom.colors.text }]}>
                Dernière mise à jour
              </Text>
              {securityStats.needsPasswordUpdate && (
                <StatusBadge status="warning" label="Mise à jour recommandée" />
              )}
            </View>
            
            <Text style={[styles.passwordDate, { color: theme.custom.colors.placeholder }]}>
              Il y a {securityStats.daysSincePasswordUpdate} jour(s)
            </Text>
            
            {securityStats.needsPasswordUpdate && (
              <Text style={[styles.passwordWarning, { color: '#F59E0B' }]}>
                Changement de mot de passe recommandé (tous les 90 jours)
              </Text>
            )}
          </View>

          <SecurityActionButton
            icon="key"
            label="Changer le mot de passe"
            description="Modifier votre mot de passe actuel"
            onPress={() => navigation.navigate('ChangePassword' as never)}
            warning={securityStats.needsPasswordUpdate}
          />
        </SecurityCard>

        {/* =================================================================
            COMPTE ET EMAIL
        ================================================================= */}
        <SecurityCard title="Compte" icon="mail">
          <View style={styles.emailInfoContainer}>
            <Text style={[styles.emailLabel, { color: theme.custom.colors.placeholder }]}>
              Adresse email actuelle
            </Text>
            <Text style={[styles.emailValue, { color: theme.custom.colors.text }]}>
              {userProfile.email}
            </Text>
            <View style={styles.emailStatusContainer}>
              {userProfile.emailVerified ? (
                <StatusBadge status="success" label="Vérifié" />
              ) : (
                <StatusBadge status="warning" label="Non vérifié" />
              )}
            </View>
          </View>

          <SecurityActionButton
            icon="edit"
            label="Changer l'adresse email"
            description="Modifier votre adresse email"
            onPress={navigateToChangeEmail}
          />
          
          {!userProfile.emailVerified && (
            <SecurityActionButton
              icon="mail"
              label="Vérifier mon email"
              description="Recevoir un nouveau lien de vérification"
              onPress={() => navigation.navigate('ResendEmail' as never)}
              warning
            />
          )}
        </SecurityCard>

        {/* =================================================================
            SESSIONS ACTIVES
        ================================================================= */}
        {/* ======= Sommaire appareils actifs ======= */}
<View style={[styles.card, { backgroundColor: theme.colors.surface, marginHorizontal: 16 }]}>
  <View style={styles.cardHeader}>
    <View style={[styles.cardIconContainer, { backgroundColor: theme.colors.primary + '1A' }]}>
      <Feather name="smartphone" size={24} color={theme.colors.primary} />
    </View>
    <Text style={[styles.cardTitle, { color: theme.custom.colors.text }]}>
      Appareils actifs ({activeDevices.length})
    </Text>
  </View>

  {activeDevices.length === 0 ? (
    <Text style={{ color: theme.custom.colors.placeholder, fontFamily: 'Nunito_400Regular' }}>
      Aucun appareil actif actuellement.
    </Text>
  ) : (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {activeDevices.map((d, i) => (
        <View
          key={`${d.name}-${i}`}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 16,
            backgroundColor: theme.colors.primary + '1A',
            marginRight: 8,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: theme.colors.primary, fontFamily: 'Nunito_700Bold', fontSize: 12 }}>
            {d.name}
          </Text>
        </View>
      ))}
    </View>
  )}
</View>



        <SecurityCard title="Sessions actives" icon="smartphone">
          <View style={styles.sessionsInfoContainer}>
            <Text style={[styles.sessionsCount, { color: theme.custom.colors.text }]}>
              {securityStats.totalSessions} session(s) active(s)
            </Text>
            <Text style={[styles.sessionsDescription, { color: theme.custom.colors.placeholder }]}>
              Gérez les appareils connectés à votre compte
            </Text>
          </View>

          {loadingSessions ? (
  <ActivityIndicator style={styles.sessionsLoader} color={theme.colors.primary} />
) : (
  <View style={styles.sessionsList}>
    {groupedByDevice.map((group, gi) => (
      <View key={`${group.header}-${gi}`} style={{ marginBottom: 12 }}>
        {/* En-tête d’appareil */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.sessionDevice, { color: theme.custom.colors.text }]}>
            {group.header} {group.active ? '• ' : '• Inactif'}
          </Text>
          {group.active && (
            <View style={[styles.statusBadge, { backgroundColor: '#10B98120', marginLeft: 8 }]}>
              <Text style={[styles.statusText, { color: '#065F46' }]}>Actif</Text>
            </View>
          )}
        </View>

        {/* Événements pour cet appareil */}
        {group.sessions.map((session) => (
          <SessionItem
            key={session.id}
            session={session}
            onRevoke={revokeSession}
            isCurrent={!!session.isCurrent}
          />
        ))}
      </View>
    ))}
  </View>
)}

          <SecurityActionButton
  icon="trash-2"
  label="Effacer l'historique"
  description="Supprimer toutes les sessions sans déconnexion"
  onPress={() => clearSessionHistory(user, setLoginSessions, addCurrentSession, loadLoginSessions)}
/>
          <SecurityActionButton
            icon="log-out"
            label="Déconnecter tous les appareils"
            description="Fermer toutes les sessions actives"
            onPress={signOutAllDevices}
            warning
          />
        </SecurityCard>
             
      </ScrollView>

      
    </SafeAreaView>
  );
}

// =================================================================
// STYLES
// =================================================================

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Cards
  card: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
  },
  
  // Action buttons
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTextContainer: { flex: 1 },
  actionLabel: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 18,
  },
  
  // Status badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  
  // Profile completeness
  profileCompletenessContainer: { marginBottom: 16 },
  completenessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completenessTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  completenessPercentage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  percentageText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  missingFieldsContainer: { marginTop: 8 },
  missingFieldsTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 4,
  },
  missingFieldsList: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 18,
    marginBottom: 8,
  },
  missingFieldsHelper: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  emailWarning: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 8,
    lineHeight: 18,
  },
  
  // Password section
  passwordInfoContainer: { marginBottom: 16 },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  passwordTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  passwordDate: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 8,
  },
  passwordWarning: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    fontStyle: 'italic',
  },
  
  // Email section
  emailInfoContainer: { marginBottom: 16 },
  emailLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 4,
  },
  emailValue: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 8,
  },
  emailStatusContainer: {
    alignSelf: 'flex-start',
  },
  
  // Sessions section
  sessionsInfoContainer: { marginBottom: 16 },
  sessionsCount: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 4,
  },
  sessionsDescription: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
  },
  sessionsLoader: { marginVertical: 20 },
  sessionsList: { marginBottom: 16 },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sessionInfo: { flex: 1 },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  sessionDevice: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  sessionDetails: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 2,
  },
  sessionDate: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
  },
  revokeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  modalInput: {
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  passwordRequirements: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 4,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    marginTop: 2,
    fontStyle: 'italic',
  },
  sessionLocation: {
  fontSize: 12,
  fontFamily: 'Nunito_400Regular',
  marginTop: 2,
  fontStyle: 'italic',
},
});




