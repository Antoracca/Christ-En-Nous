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
import { Svg, Path, Circle, Rect, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import NotificationModal, { Notification } from '@/components/NotificationModal';

const HEADER_MAX_HEIGHT = 280;

// =================================================================
// NOUVEAU COMPOSANT : Icône Menu Moderne (style référence)
// =================================================================
const ModernMenuIcon = ({ size = 24, color = "#fff" }: { size?: number; color?: string }) => {
  // Design inspiré de l'image : 3 lignes avec différentes largeurs pour un effet moderne
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>
        {/* Ligne supérieure - plus courte */}
        <Rect x="3" y="6" width="14" height="2" rx="1" fill={color} />
        {/* Ligne du milieu - pleine largeur */}
        <Rect x="3" y="11" width="18" height="2" rx="1" fill={color} />
        {/* Ligne inférieure - largeur moyenne */}
        <Rect x="3" y="16" width="10" height="2" rx="1" fill={color} />
      </G>
    </Svg>
  );
};

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

// =================================================================
// COMPOSANT AMÉLIORÉ : Header avec logo en arrière-plan
// =================================================================
const HomeHeader = ({ 
  onNotificationPress, 
  unreadCount 
}: { 
  onNotificationPress: () => void; 
  unreadCount: number; 
}) => {
  const theme = useAppTheme();
  const { userProfile } = useAuth();
  
  // 🌟 ANIMATIONS MULTIPLES POUR UN EFFET WOW
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const particlesAnim = useRef(new Animated.Value(0)).current;

  // ✨ ANIMATION COMPLEXE ET IMMERSIVE
  useEffect(() => {
    // Animation séquentielle avec effet dramatique
    Animated.sequence([
      // 1. Apparition avec scale et rotation
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 0.95,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotation, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      // 2. Effet de glow qui pulse
      Animated.timing(glowOpacity, {
        toValue: 0.6,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation infinie de particules flottantes
    Animated.loop(
      Animated.sequence([
        Animated.timing(particlesAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(particlesAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation continue très subtile du logo
    Animated.loop(
      Animated.timing(logoRotation, {
        toValue: 2,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  
  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[theme.colors.primary, '#1E3A8A']}
        style={styles.headerCurve}
      >
        
        <View style={styles.headerContentContainer}>
          <View style={styles.headerTopRow}>
            <EnhancedAvatar 
              photoURL={userProfile?.photoURL}
              prenom={userProfile?.prenom}
              nom={userProfile?.nom}
              size={54}
            />
            <View style={styles.headerIconsContainer}>
              <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
                <Ionicons name="notifications-outline" size={26} color={theme.colors.onPrimary} />
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {/* NOUVEAU : Utilisation de l'icône menu moderne */}
              <TouchableOpacity style={styles.iconButton}>
                <ModernMenuIcon size={28} color={theme.colors.onPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.welcomeTextContainer}>
            <Text 
              style={[styles.greetingText, { color: theme.colors.onPrimary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Shalom, {userProfile?.username || 'invité'}
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

      {/* 🌟 LOGO EN DEHORS DU GRADIENT POUR ÉVITER L'OVERFLOW */}
      {/* COUCHE 1: PARTICULES FLOTTANTES */}
      <Animated.View style={[
        styles.particlesContainer,
        {
          opacity: particlesAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.1, 0.3, 0.1]
          }),
          transform: [{
            translateY: particlesAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, -20]
            })
          }]
        }
      ]}>
        {/* Particules décoratives autour du logo */}
        <View style={[styles.particle, { bottom: 60, right: 80 }]} />
        <View style={[styles.particle, { bottom: 90, right: 40 }]} />
        <View style={[styles.particle, { bottom: 120, right: 60 }]} />
        <View style={[styles.particle, { bottom: 140, right: 20 }]} />
        <View style={[styles.particle, { bottom: 100, right: 100 }]} />
      </Animated.View>

      {/* COUCHE 2: EFFET DE GLOW DERRIÈRE LE LOGO */}
      <Animated.View style={[
        styles.logoGlow,
        {
          opacity: glowOpacity,
          transform: [{
            scale: glowOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1.2]
            })
          }]
        }
      ]} />

      {/* COUCHE 3: LOGO PRINCIPAL AVEC ANIMATIONS COMPLEXES */}
      <Animated.View style={[
        styles.logoContainer,
        {
          opacity: logoOpacity,
          transform: [
            {
              scale: logoScale
            },
            {
              rotate: logoRotation.interpolate({
                inputRange: [0, 1, 2],
                outputRange: ['0deg', '5deg', '360deg']
              })
            }
          ]
        }
      ]}>
        <Image
          source={require('assets/images/logosbg.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        
        {/* Cercle décoratif autour du logo */}
        <Animated.View style={[
          styles.logoRing,
          {
            transform: [{
              rotate: logoRotation.interpolate({
                inputRange: [0, 2],
                outputRange: ['0deg', '-360deg']
              })
            }]
          }
        ]} />
      </Animated.View>
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
  const [isInitializing, setIsInitializing] = useState(true);
  
  // États pour les notifications
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Nouvelle prédication disponible',
      message: 'Pasteur Jean a publié une nouvelle prédication sur la foi.',
      type: 'info',
      timestamp: new Date(Date.now() - 300000),
      isRead: false,
      priority: 'normal',
    },
    {
      id: '2',
      title: 'Demande de prière',
      message: 'Marie demande vos prières pour sa famille.',
      type: 'prayer',
      timestamp: new Date(Date.now() - 3600000),
      isRead: false,
      priority: 'high',
    },
    {
      id: '3',
      title: 'Événement à venir',
      message: 'Culte spécial dimanche prochain à 10h.',
      type: 'event',
      timestamp: new Date(Date.now() - 7200000),
      isRead: true,
      priority: 'normal',
    },
    {
      id: '4',
      title: 'Mise à jour système',
      message: 'L\'application a été mise à jour avec de nouvelles fonctionnalités.',
      type: 'system',
      timestamp: new Date(Date.now() - 86400000),
      isRead: false,
      priority: 'low',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Fonctions de gestion des notifications
  const handleNotificationPress = () => {
    setShowNotificationModal(true);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleNotificationItemPress = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    setShowNotificationModal(false);
    console.log('Navigation vers:', notification.actionUrl || 'page par défaut');
  };

  if (authLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isInitializing) {
    return <HomeScreenSkeleton />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="light-content" />
      <HomeHeader 
        onNotificationPress={handleNotificationPress}
        unreadCount={unreadCount}
      />

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

      <NotificationModal
        visible={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDeleteNotification={handleDeleteNotification}
        onNotificationPress={handleNotificationItemPress}
      />
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
    overflow: 'hidden', // Important pour contenir le logo
  },
  // 🌟 STYLES POUR EFFETS IMMERSIFS
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 77, // ✅ Visible mais en dessous du logo
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 2,
    shadowColor: '#fff',
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  logoContainer: {
    position: 'absolute',
    width: 280,
    height: 280,
    right: 40, // Moitié hors écran (50% visible)
    bottom: 40, // Moitié hors écran (50% visible)
    zIndex: 50, // ✅ TRÈS ÉLEVÉ pour passer devant tout
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 250,
    height: 250,
    zIndex: 51, // ✅ AU-DESSUS DE TOUT
    opacity: 0.4, // ✅ SEMI-TRANSPARENT pour effet subtil mais visible
  },
  logoGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    right: -150,
    bottom: -150,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 150,
    zIndex: 45, // ✅ Juste en dessous du logo mais au-dessus du contenu
    shadowColor: '#fff',
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 20,
  },
  logoRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 110,
    borderStyle: 'dashed',
    zIndex: 49, // ✅ Juste en dessous du logo
  },
  headerContentContainer: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 60,
    paddingHorizontal: 25,
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 1, // En dessous du logo maintenant
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
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
  },
  welcomeTextContainer: {
    marginTop: 10,
    marginBottom: 15,
    flex: 1,
    maxWidth: '100%',
  },
  greetingText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 30,
    flexShrink: 1,
    maxWidth: '100%',
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