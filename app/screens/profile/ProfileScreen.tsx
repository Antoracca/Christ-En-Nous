import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from 'services/firebase/firebaseConfig';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SectionHeader = ({ title }: { title: string }) => {
    const theme = useAppTheme();
    return <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>{title}</Text>;
};

const InfoRow = ({ icon, label, value, onEdit }: { icon: keyof typeof Feather.glyphMap; label: string; value?: string | null; onEdit?: () => void; }) => {
    const theme = useAppTheme();
    if (!value) return null;

    return (
        <View style={styles.infoRow}>
            <Feather name={icon} size={22} color={theme.custom.colors.placeholder} style={styles.infoRowIcon} />
            <View style={styles.infoRowTextContainer}>
                <Text style={[styles.infoRowLabel, { color: theme.custom.colors.placeholder }]}>{label}</Text>
                <Text style={[styles.infoRowValue, { color: theme.custom.colors.text }]}>{value}</Text>
            </View>
            {onEdit && (
                <TouchableOpacity onPress={onEdit}>
                    <Feather name="edit-2" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
            )}
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

export default function ProfileScreen() {
  const theme = useAppTheme();
  const { user, userProfile, loading,  } = useAuth();

  

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erreur de déconnexion: ", error);
      Alert.alert("Erreur", "Impossible de se déconnecter. Veuillez réessayer.");
    }
  };

  const formatDate = (dateString?: string) => {
      if (!dateString) return "Non renseignée";
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
  };

  const getBaptismStatus = () => {
      if (userProfile?.isBaptized) {
          return userProfile.baptizedByImmersion ? "Baptisé(e) par immersion" : "Baptisé(e)";
      }
      return "Non baptisé(e)";
  };

  if (loading && !userProfile) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const isVerified = user?.emailVerified ?? userProfile?.emailVerified;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Image 
                    source={{ uri: userProfile?.photoURL || `https://i.pravatar.cc/150?u=${userProfile?.uid}` }} 
                    style={styles.avatar}
                />
                <Text style={[styles.fullName, { color: theme.custom.colors.text }]}>
                    {userProfile?.prenom} {userProfile?.nom}
                </Text>
                <Text style={[styles.username, { color: theme.custom.colors.placeholder }]}>
                    @{userProfile?.username}
                </Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <SectionHeader title="Informations Personnelles" />
                <EmailInfoRow label="Email" value={userProfile?.email} isVerified={isVerified} />
                <InfoRow icon="phone" label="Téléphone" value={userProfile?.phone} />
                <InfoRow icon="gift" label="Date de naissance" value={formatDate(userProfile?.birthdate)} />
                <InfoRow icon="map-pin" label="Adresse" value={`${userProfile?.quartier}, ${userProfile?.ville}`} />
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <SectionHeader title="Parcours Spirituel" />
                <InfoRow icon="check-circle" label="Statut de baptême" value={getBaptismStatus()} />
                <InfoRow icon="users" label="Rôle dans l'église" value={`${userProfile?.fonction} (${userProfile?.sousFonction})`} />
                <InfoRow icon="home" label="Église d'origine" value={userProfile?.egliseOrigine} />
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <SectionHeader title="Paramètres" />
                <NavButton icon="edit" label="Modifier le profil" onPress={() => {}} />
                <NavButton icon="shield" label="Sécurité" onPress={() => {}} />
                <NavButton icon="bell" label="Notifications" onPress={() => {}} />
            </View>

            <TouchableOpacity onPress={handleLogout}>
                <LinearGradient
                    colors={['#FF6B6B', '#E53E3E']}
                    style={styles.logoutButton}
                >
                    <Feather name="log-out" size={22} color="white" />
                    <Text style={styles.logoutButtonText}>Se déconnecter</Text>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
    marginBottom: 15,
  },
  fullName: {
    fontSize: 26,
    fontFamily: 'Nunito_700Bold',
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
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoRowIcon: {
    marginRight: 20,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 50,
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginLeft: 10,
  },
});
