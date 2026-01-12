import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Text
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler 
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/context/AuthContext';
import { useBible } from '@/context/EnhancedBibleContext';

// Components
import HomeHeader from '../components/home/HomeHeader';
import NotificationModal, { Notification } from '../components/NotificationModal';
import HomeMenuModal from '../components/home/HomeMenuModal';
import QuickAccessGrid from '../components/home/QuickAccessGrid';
import NewsFeedWidget from '../components/home/NewsFeedWidget';
import SermonSection from '../components/home/SermonSection';
import DailyDevotional from '../components/home/DailyDevotional';
import MinistryGrid from '../components/home/MinistryGrid';
import LiveStreamWidget from '../components/home/LiveStreamWidget';
import HomeFooter from '../components/home/HomeFooter'; // NOUVEAU FOOTER
import ModernMenuIcon from '../components/ui/ModernMenuIcon';

const HEADER_MAX_HEIGHT = 280; 

export default function HomeScreen() {
  const theme = useAppTheme();
  const { loading: authLoading } = useAuth();
  const { initialize } = useBible(); // ✅ Hook Bible
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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
    const timer = setTimeout(() => setIsReady(true), 1000);
    
    // ✅ SEMI-EAGER INIT: On lance le chargement de la Bible en arrière-plan dès l'accueil
    // Cela ne bloque pas l'UI mais prépare le terrain pour l'onglet Bible
    console.log('🏠 Accueil monté -> Préchauffage du service Bible...');
    initialize();

    return () => clearTimeout(timer);
  }, [initialize]); // Ajout de initialize dans les dépendances

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const handleMarkAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  const handleMarkAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  const handleDeleteNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const handleNotificationItemPress = (notification: Notification) => {
    if (!notification.isRead) handleMarkAsRead(notification.id);
    setShowNotificationModal(false);
  };

  if (!isReady || authLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      
      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_MAX_HEIGHT + 20 }]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={theme.colors.primary} 
            progressViewOffset={HEADER_MAX_HEIGHT}
          />
        }
      >
        <QuickAccessGrid />
        <NewsFeedWidget />
        <DailyDevotional />
        <MinistryGrid />
        <LiveStreamWidget />
        <SermonSection />
        
        {/* FOOTER DE FIN */}
        <HomeFooter />

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      <View style={styles.headerWrapper} pointerEvents="box-none">
        <HomeHeader
          onNotificationPress={() => {}}
          unreadCount={0}
          onMenuPress={() => {}}
          scrollY={scrollY}
        />
      </View>

      <View style={[styles.floatingButtonsContainer, { top: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => setShowNotificationModal(true)}
        >
          <Ionicons name="notifications-outline" size={26} color={theme.colors.onPrimary} />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => setShowMenu(true)}
        >
          <ModernMenuIcon color={theme.colors.onPrimary} />
        </TouchableOpacity>
      </View>

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
        isVisible={showMenu}
        onClose={() => setShowMenu(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { 
    paddingBottom: 20 
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  floatingButtonsContainer: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1E3A8A',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
  },
});
