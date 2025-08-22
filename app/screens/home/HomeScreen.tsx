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
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import NotificationModal, { Notification } from '@/components/NotificationModal';
import ModernMenuIcon from '@/components/ui/ModernMenuIcon';
import HomeMenuModal from './HomeMenuModal';
import Avatar from '@/components/profile/Avatar';

const HEADER_MAX_HEIGHT = 280;

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
// COMPOSANT : Header de l'accueil
// =================================================================
const HomeHeader = ({ 
  onNotificationPress, 
  unreadCount,
  onMenuPress
}: { 
  onNotificationPress: () => void; 
  unreadCount: number; 
  onMenuPress: () => void;
}) => {
  const theme = useAppTheme();
  const { userProfile } = useAuth();
  const particlesAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(particlesAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
        easing: Easing.linear
      })
    ).start();
  }, [particlesAnim]);
  
  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[theme.colors.primary, '#1E3A8A']}
        style={styles.headerCurve}
      >
        <Animated.View style={[
          styles.particlesContainer,
          {
            opacity: particlesAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.3, 0.7, 0.3]
            }),
          }
        ]}>
          <View style={[styles.sparkle, { top: '20%', right: '15%' }]} />
          <View style={[styles.sparkle, { top: '40%', right: '30%' }]} />
          <View style={[styles.sparkle, { top: '70%', right: '10%' }]} />
          <View style={[styles.sparkle, { top: '30%', left: '15%' }]} />
          <View style={[styles.sparkle, { top: '60%', left: '25%' }]} />
        </Animated.View>
        
        <View style={styles.headerContentContainer}>
          <View style={styles.headerTopRow}>
            <Avatar 
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
              
              <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
                <ModernMenuIcon color={theme.colors.onPrimary} />
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
          
          <View style={[styles.searchContainer, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <TextInput
              placeholder="Recherche..."
              placeholderTextColor={'rgba(255,255,255,0.6)'}
              style={[styles.searchInput, { color: theme.colors.onPrimary }]}
            />
            <Ionicons name="search" size={22} color={'rgba(255,255,255,0.6)'} style={styles.searchIcon} />
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
  const [isInitializing, setIsInitializing] = useState(true);
  const [isMenuVisible, setMenuVisible] = useState(false);
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
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleNotificationPress = () => setShowNotificationModal(true);
  const handleMarkAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  const handleMarkAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  const handleDeleteNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const handleNotificationItemPress = (notification: Notification) => {
    if (!notification.isRead) handleMarkAsRead(notification.id);
    setShowNotificationModal(false);
  };

  if (authLoading || isInitializing) {
    return <HomeScreenSkeleton />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="light-content" />
      <HomeHeader 
        onNotificationPress={handleNotificationPress}
        unreadCount={unreadCount}
        onMenuPress={() => setMenuVisible(true)}
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
      
      <HomeMenuModal 
        isVisible={isMenuVisible}
        onClose={() => setMenuVisible(false)}
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
    overflow: 'hidden', 
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1, 
  },
  sparkle: { // Style manquant corrigé
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  headerContentContainer: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 60,
    paddingHorizontal: 25,
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 10, 
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    zIndex: 20,
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
