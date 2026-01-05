import React, { useCallback, useState } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, Alert, 
  TouchableOpacity, ScrollView, SafeAreaView, RefreshControl,
  StatusBar, Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase/firebaseConfig';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Feather } from '@expo/vector-icons';
import Avatar from '@/components/profile/Avatar';
import { useMigrateUserRoles } from '@/hooks/useMigrateUserRoles';
import { useRouter } from 'expo-router';

// --- Sous-composants pour une meilleure lisibilité ---

const SectionHeader = ({ title }: { title: string }) => {
    const theme = useAppTheme();
    return <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>{title}</Text>;
};

const InfoRow = ({ icon, label, value, isMultiLine = false }: { icon: keyof typeof Feather.glyphMap; label: string; value?: string | null; isMultiLine?: boolean }) => {
    const theme = useAppTheme();
    if (!value) return null;
    return (
        <View style={styles.infoRow}>
            <Feather name={icon} size={22} color={theme.custom.colors.placeholder} style={styles.infoRowIcon} />
            <View style={styles.infoRowTextContainer}>
                <Text style={[styles.infoRowLabel, { color: theme.custom.colors.placeholder }]}>{label}</Text>
                <Text style={[styles.infoRowValue, { color: theme.custom.colors.text, ...(isMultiLine && { lineHeight: 22 }) }]}>{value}</Text>
            </View>
        </View>
    );
};

const EmailInfoRow = ({ label, value, isVerified }: { label: string; value?: string | null; isVerified?: boolean }) => {
    const theme = useAppTheme();
    const verified = isVerified ?? false;
    return (
        <View style={styles.infoRow}>
            <Feather name="mail" size={22} color={theme.custom.colors.placeholder} style={styles.infoRowIcon} />
            <View style={styles.infoRowTextContainer}>
                <Text style={[styles.infoRowLabel, { color: theme.custom.colors.placeholder }]}>{label}</Text>
                <View style={styles.emailValueContainer}>
                    <Text style={[styles.infoRowValue, { color: theme.custom.colors.text }]}>{value}</Text>
                    <View style={[styles.verificationBadge, { backgroundColor: verified ? theme.custom.colors.success + '20' : theme.colors.error + '20' }]}>
                        <Feather name={verified ? "check-circle" : "x-circle"} size={14} color={verified ? theme.custom.colors.success : theme.colors.error} />
                        <Text style={[styles.verificationText, { color: verified ? theme.custom.colors.success : theme.colors.error }]}>
                            {verified ? "Vérifié" : "Non vérifié"}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const NavButton = ({ icon, label, onPress }: { icon: keyof typeof Feather.glyphMap; label: string; onPress: () => void; }) => {
    const theme = useAppTheme();
    return (
        <TouchableOpacity style={styles.navButton} onPress={onPress}>
            <View style={[styles.navButtonIconContainer, { backgroundColor: theme.colors.primary + '1A' }]}>
                <Feather name={icon} size={24} color={theme.colors.primary} />
            </View>
            <Text style={[styles.navButtonLabel, { color: theme.custom.colors.text }]}>{label}</Text>
            <Feather name="chevron-right" size={24} color={theme.custom.colors.placeholder} />
        </TouchableOpacity>
    );
};

const LogoutButton = ({ onPress, isLoading }: { onPress: () => void; isLoading: boolean; }) => {
    const theme = useAppTheme();
    const color = theme.colors.error;
    return (
        <TouchableOpacity style={styles.navButton} onPress={onPress} disabled={isLoading}>
            <View style={[styles.navButtonIconContainer, { backgroundColor: color + '1A' }]}>
                {isLoading 
                    ? <ActivityIndicator size="small" color={color} /> 
                    : <Feather name="log-out" size={24} color={color} />
                }
            </View>
            <Text style={[styles.navButtonLabel, { color: color }]}>Se déconnecter</Text>
        </TouchableOpacity>
    );
};

// --- Composant Principal ---

export default function ProfileScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { userProfile, loading, refreshUserProfile , logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  useMigrateUserRoles();

  useFocusEffect(
    useCallback(() => {
      if (refreshUserProfile) {
        refreshUserProfile();
      }
    }, [refreshUserProfile])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshUserProfile();
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
      Alert.alert("Erreur", "Impossible de rafraîchir le profil.");
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshUserProfile]);

  const handleLogout = () => {
  Alert.alert(
    "Déconnexion",
    "Voulez-vous vraiment vous déconnecter ?",
    [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            // On appelle simplement la fonction centrale du contexte
            await logout();
          } catch (error) {
            console.error("Erreur de déconnexion:", error);
            Alert.alert("Erreur", "Une erreur est survenue lors de la déconnexion.");
          } finally {
            // Cet état est surtout pour la réactivité visuelle immédiate
            setIsLoggingOut(false);
          }
        },
      },
    ]
  );
};

  const formatDate = (dateString?: string) => {
      if (!dateString) return "Non renseignée";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatMemberSince = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date d'inscription invalide";
    return `Inscrit(e) depuis le ${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  };

  const getBaptismStatus = () => {
      if (userProfile?.isBaptized) {
          return userProfile.baptizedByImmersion ? "Baptisé(e) par immersion" : "Baptisé(e)";
      }
      return "Non baptisé(e)";
  };

  const displayRoles = (profile: UserProfile | null) => {
    if (!profile) return 'Aucun';
    if (profile.roles && profile.roles.length > 0) {
        return profile.roles.map(role => 
            role.sousFonction ? `${role.fonction} - ${role.sousFonction}` : role.fonction
        ).join('\n');
    }
    if (profile.fonction) { // Fallback pour les anciens profils
        return profile.sousFonction ? `${profile.fonction} - ${profile.sousFonction}` : profile.fonction;
    }
    return 'Aucun';
  };

  const displayOtherRoles = (profile: UserProfile | null) => {
      if (profile?.otherRoles && profile.otherRoles.length > 0) {
          return profile.otherRoles.join('\n');
      }
      return null; // Important: retourner null pour ne pas afficher la ligne si vide
  };

  if (loading && !userProfile && !isRefreshing) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const isVerified = userProfile?.emailVerified;
  const memberSinceText = formatMemberSince(userProfile?.createdAt);
  const otherRolesText = displayOtherRoles(userProfile);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'} backgroundColor={theme.colors.background} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={onRefresh} 
            tintColor={theme.colors.primary} 
          />
        }
      >
        <View style={styles.header}>
            <Avatar 
                photoURL={userProfile?.photoURL}
                prenom={userProfile?.prenom}
                nom={userProfile?.nom}
                size={100}
            />
            <Text style={[styles.fullName, { color: theme.custom.colors.text }]}>
                {userProfile?.prenom} {userProfile?.nom}
            </Text>
            <Text style={[styles.username, { color: theme.custom.colors.placeholder }]}>
                @{userProfile?.username || 'non-défini'}
            </Text>
            {memberSinceText && (
                <Text style={styles.memberSinceText}>{memberSinceText}</Text>
            )}
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <SectionHeader title="Informations Personnelles" />
            <EmailInfoRow label="Email" value={userProfile?.email} isVerified={isVerified} />
            <InfoRow icon="phone" label="Téléphone" value={userProfile?.phone} />
            <InfoRow icon="gift" label="Date de naissance" value={formatDate(userProfile?.birthdate)} />
            <InfoRow icon="map-pin" label="Adresse" value={userProfile?.ville ? `${userProfile.quartier}, ${userProfile.ville}` : 'Non renseignée'} />
            <InfoRow icon="globe" label="Pays" value={userProfile?.pays} />
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <SectionHeader title="Parcours Spirituel" />
            <InfoRow icon="check-circle" label="Statut de baptême" value={getBaptismStatus()} />
            <InfoRow icon="users" label="Rôles officiels" value={displayRoles(userProfile)} isMultiLine />
            {otherRolesText && (
                <InfoRow icon="plus-circle" label="Autres fonctions" value={otherRolesText} isMultiLine />
            )}
            <InfoRow icon="home" label="Église d'origine" value={userProfile?.egliseOrigine} />
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <SectionHeader title="Paramètres" />
            <NavButton icon="edit" label="Modifier le profil" onPress={() => router.navigate('ModifierProfil' as never)} />
            <NavButton icon="shield" label="Sécurité" onPress={() => router.navigate('Security' as never)} />
            <NavButton icon="bell" label="Notifications" onPress={() => {}} />
            <LogoutButton onPress={handleLogout} isLoading={isLoggingOut} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  fullName: {
    fontSize: 26,
    fontFamily: 'Nunito_700Bold',
    marginTop: 15,
  },
  username: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    marginTop: 4,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoRowIcon: {
    marginRight: 20,
    marginTop: 2,
  },
  infoRowTextContainer: {
    flex: 1,
  },
  infoRowLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 2,
  },
  infoRowValue: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  emailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 10,
  },
  verificationText: {
    marginLeft: 5,
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  navButtonIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  navButtonLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  memberSinceText: {
    textAlign: 'center',
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
});

