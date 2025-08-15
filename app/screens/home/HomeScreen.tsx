import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  TextInput,
  StatusBar,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';

const HEADER_MAX_HEIGHT = 280;

// =================================================================
// COMPOSANT AMÉLIORÉ : Avatar avec icône par défaut élégante
// =================================================================
const GuestAvatarIcon = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="1.5" />
    <Path 
      d="M17 20C17 17.2386 14.7614 15 12 15C9.23858 15 7 17.2386 7 20" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
  </Svg>
);

const EnhancedAvatar = ({ photoURL, prenom, nom, size }: { photoURL?: string | null; prenom?: string; nom?: string; size: number; }) => {
  const theme = useAppTheme();
  
  if (photoURL) {
    return <Image source={{ uri: photoURL }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }

  return (
    <View style={[
      styles.avatarFallback, 
      { width: size, height: size, borderRadius: size / 2, backgroundColor: 'rgba(255, 255, 255, 0.2)' }
    ]}>
      <GuestAvatarIcon size={size * 0.6} color={theme.colors.onPrimary} />
    </View>
  );
};


// =================================================================
// COMPOSANT : Squelette de chargement pour l'accueil
// =================================================================
const HomeScreenSkeleton = () => {
  const theme = useAppTheme();
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(animValue, { toValue: 0, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
      ])
    ).start();
  }, [animValue]);

  const opacity = animValue.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  
  const AnimatedView = (props: any) => <Animated.View {...props} style={[props.style, { opacity }]} />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="light-content" />
      {/* Faux Header */}
      <View style={{ height: HEADER_MAX_HEIGHT }}>
        <LinearGradient
          colors={[theme.colors.primary, '#1E3A8A']}
          style={styles.headerCurve}
        >
          <View style={[styles.headerContentContainer, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 60 }]}>
            <View style={styles.headerTopRow}>
              <AnimatedView style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.3)' }} />
              <View style={{ flexDirection: 'row' }}>
                <AnimatedView style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.3)', marginLeft: 8 }} />
                <AnimatedView style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.3)', marginLeft: 8 }} />
              </View>
            </View>
            <View style={styles.welcomeTextContainer}>
              <AnimatedView style={{ width: '60%', height: 30, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: 10 }} />
              <AnimatedView style={{ width: '40%', height: 20, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            </View>
            <AnimatedView style={[styles.searchContainer, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
          </View>
        </LinearGradient>
      </View>
      {/* Faux Contenu */}
      <View style={styles.mainContentContainer}>
        <AnimatedView style={{ width: '40%', height: 25, borderRadius: 8, backgroundColor: theme.colors.surface, marginBottom: 15 }} />
        <View style={styles.quickActionsContainer}>
          <AnimatedView style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]} />
          <AnimatedView style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]} />
          <AnimatedView style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]} />
        </View>
      </View>
      <View style={styles.mainContentContainer}>
        <AnimatedView style={{ width: '60%', height: 25, borderRadius: 8, backgroundColor: theme.colors.surface, marginBottom: 15 }} />
        <AnimatedView style={[styles.contentCard, { backgroundColor: theme.colors.surface }]} />
        <AnimatedView style={[styles.contentCard, { backgroundColor: theme.colors.surface }]} />
      </View>
    </View>
  );
};


const HomeHeader = () => {
  const theme = useAppTheme();
  const { userProfile } = useAuth();
  
  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[theme.colors.primary, '#1E3A8A']}
        style={styles.headerCurve}
      >
        <View style={styles.headerContentContainer}>
          <View style={styles.headerTopRow}>
            {/* ✅ UTILISATION DU NOUVEL AVATAR */}
            <EnhancedAvatar 
              photoURL={userProfile?.photoURL}
              prenom={userProfile?.prenom}
              nom={userProfile?.nom}
              size={54}
            />
            <View style={styles.headerIconsContainer}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={26} color={theme.colors.onPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="menu-outline" size={32} color={theme.colors.onPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.welcomeTextContainer}>
            <Text style={[styles.greetingText, { color: theme.colors.onPrimary }]}>
              Shalom, {userProfile?.prenom || 'invité'}
            </Text>
            <Text style={[styles.subtitleText, { color: theme.colors.onPrimary }]}>
              Ton église à{' '}
              <Text style={{ color: theme.custom.colors.accent }}>portée de main</Text>
            </Text>
          </View>
          
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


export default function HomeScreen() {
  const theme = useAppTheme();
  const { loading: authLoading } = useAuth();
  
  // ✅ NOUVEAU : État pour le chargement initial de l'écran
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Simule un chargement des données de l'écran pendant 1.5 secondes
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Le loader global du contexte d'authentification
  if (authLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // ✅ NOUVEAU : Affiche le squelette de chargement pendant l'initialisation
  if (isInitializing) {
    return <HomeScreenSkeleton />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="light-content" />
      <HomeHeader />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT }}
      >
        <View style={styles.mainContentContainer}>
          <Text style={[styles.sectionTitle, { color: theme.custom.colors.text }]}>Services</Text>
          <View style={styles.quickActionsContainer}>
            <QuickActionCard icon="megaphone-outline" label="Annonces" onPress={() => {}} />
            <QuickActionCard icon="calendar-outline" label="Événements" onPress={() => {}} />
            <QuickActionCard icon="heart-outline" label="Dons" onPress={() => {}} />
          </View>
        </View>

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

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  headerIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  searchIcon: {},
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
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
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
    height: 90,
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