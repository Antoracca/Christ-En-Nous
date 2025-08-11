// screens/home/HomeScreen.tsx - NOUVEAU DESIGN AMÉLIORÉ
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';

const HEADER_MAX_HEIGHT = 280; // Hauteur fixe pour l'en-tête

// --- Composants Spécifiques à l'Écran d'Accueil ---

// Icône de menu personnalisée, inspirée de l'image
const CustomMenuIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M3 12H15" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M3 6H21" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M3 18H9" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// En-tête avec la forme incurvée
const HomeHeader = () => {
  const theme = useAppTheme();
  const { userProfile } = useAuth();
  
  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[theme.colors.primary, '#1E3A8A']} // Dégradé subtil
        style={styles.headerCurve}
      >
        <View style={styles.headerContentContainer}>
          {/* Ligne du haut : Avatar et Icônes */}
          <View style={styles.headerTopRow}>
            <Image 
              source={{ uri: `https://i.pravatar.cc/150?u=${userProfile?.uid}` }} 
              style={styles.avatar}
            />
            <View style={styles.headerIconsContainer}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={26} color={theme.colors.onPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <CustomMenuIcon color={theme.colors.onPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Textes de bienvenue */}
          <View style={styles.welcomeTextContainer}>
            <Text style={[styles.greetingText, { color: theme.colors.onPrimary }]}>
              Shalom, {userProfile?.prenom || 'invité'}
            </Text>
            <Text style={[styles.subtitleText, { color: theme.colors.onPrimary }]}>
              Ton église à{' '}
              <Text style={{ color: theme.custom.colors.accent }}>portée de main</Text>
            </Text>
          </View>
          
          {/* Barre de recherche */}
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface + 'E6' }]}>
            <TextInput
              placeholder="Recherche..."
              placeholderTextColor={theme.custom.colors.placeholder}
              style={[styles.searchInput, { color: theme.custom.colors.text }]}
            />
            <Ionicons name="search" size={22} color={theme.custom.colors.placeholder} style={styles.searchIcon} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Cartes d'actions rapides
const QuickActionCard = ({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; }) => {
  const theme = useAppTheme();
  return (
    <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]} onPress={onPress}>
      <View style={[styles.quickActionIconContainer, { backgroundColor: theme.colors.primary + '1A' }]}>
        <Ionicons name={icon} size={28} color={theme.colors.primary} />
      </View>
      <Text style={[styles.quickActionLabel, { color: theme.custom.colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
};

// Carte pour un événement ou une prédication
const ContentCard = ({ title, subtitle, imageUrl }: { title: string; subtitle: string; imageUrl: string; }) => {
  const theme = useAppTheme();
  return (
    <TouchableOpacity style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}>
      <Image source={{ uri: imageUrl }} style={styles.contentCardImage} />
      <View style={styles.contentCardTextContainer}>
        <Text style={[styles.contentCardTitle, { color: theme.custom.colors.text }]}>{title}</Text>
        <Text style={[styles.contentCardSubtitle, { color: theme.custom.colors.placeholder }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={theme.custom.colors.placeholder} />
    </TouchableOpacity>
  );
};


// --- Écran Principal ---

export default function HomeScreen() {
  const theme = useAppTheme();
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="light-content" />
      <HomeHeader />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT }}
      >
        {/* Section des Actions Rapides */}
        <View style={styles.mainContentContainer}>
          <Text style={[styles.sectionTitle, { color: theme.custom.colors.text }]}>Services</Text>
          <View style={styles.quickActionsContainer}>
            <QuickActionCard icon="megaphone-outline" label="Annonces" onPress={() => {}} />
            <QuickActionCard icon="calendar-outline" label="Événements" onPress={() => {}} />
            <QuickActionCard icon="heart-outline" label="Dons" onPress={() => {}} />
          </View>
        </View>

        {/* Section des Dernières Prédications */}
        <View style={styles.mainContentContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.custom.colors.text }]}>Dernières Prédications</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <ContentCard 
            title="Le pouvoir de la foi"
            subtitle="Pasteur John Doe - 45 min"
            imageUrl="https://placehold.co/400x400/1E3A8A/FFFFFF?text=Foi"
          />
          <ContentCard 
            title="Marcher dans la lumière"
            subtitle="Pasteur Jane Smith - 52 min"
            imageUrl="https://placehold.co/400x400/FBBF24/0F172A?text=Lumière"
          />
        </View>
      </ScrollView>
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header Styles
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    height: HEADER_MAX_HEIGHT,
  },
  headerCurve: {
    flex: 1,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  headerContentContainer: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 60,
    paddingHorizontal: 25,
    flex: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  headerIconsContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  welcomeTextContainer: {
    marginTop: 10,
  },
  greetingText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 30,
  },
  subtitleText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 18,
    opacity: 0.9,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 15,
    height: 55,
    marginTop: 'auto',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    paddingRight: 10,
  },
  searchIcon: {
    // L'icône est maintenant à la fin
  },
  // Main Content Styles
  mainContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
  },
  seeAllText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  quickActionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    textAlign: 'center',
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  contentCardImage: {
    width: 60,
    height: 60,
    borderRadius: 15,
    marginRight: 15,
  },
  contentCardTextContainer: {
    flex: 1,
  },
  contentCardTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  contentCardSubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
  },
});
