// app/screens/home/HomeScreen.tsx
// L'écran d'accueil principal, assemblé à partir de composants modulaires.

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  StatusBar
} from 'react-native';

// Contexte et Thème
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';

// Composants de l'UI globale
import NotificationModal, { Notification } from '@/components/NotificationModal';
import HomeMenuModal from './HomeMenuModal';

// Nouveaux composants modulaires pour l'écran d'accueil
import HomeHeader from '@/components/home/HomeHeader';
import SectionHeader from '@/components/home/SectionHeader';
import QuickActionCard from '@/components/home/QuickActionCard';
import ContentCard from '@/components/home/ContentCard';
import HomeScreenSkeleton from '@/components/home/HomeScreenSkeleton';

const HEADER_MAX_HEIGHT = 280;

export default function HomeScreen() {
  const theme = useAppTheme();
  const { loading: authLoading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  
  // États pour la visibilité des modaux
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  // Données de démonstration pour les notifications
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

  // Simule un temps de chargement initial pour les données de la page
  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Fonctions de gestion des notifications
  const handleNotificationPress = () => setShowNotificationModal(true);
  const handleMarkAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  const handleMarkAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  const handleDeleteNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const handleNotificationItemPress = (notification: Notification) => {
    if (!notification.isRead) handleMarkAsRead(notification.id);
    setShowNotificationModal(false);
  };

  // Affiche le squelette de chargement si l'authentification ou l'initialisation est en cours
  if (authLoading || isInitializing) {
    return <HomeScreenSkeleton />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <HomeHeader 
        onNotificationPress={handleNotificationPress}
        unreadCount={unreadCount}
        onMenuPress={() => setMenuVisible(true)}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.sectionContainer}>
          <SectionHeader title="Services" />
          <View style={styles.quickActionsContainer}>
            <QuickActionCard icon="megaphone-outline" label="Annonces" onPress={() => {}} />
            <QuickActionCard icon="calendar-outline" label="Événements" onPress={() => {}} />
            <QuickActionCard icon="heart-outline" label="Dons" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <SectionHeader title="Dernières Prédications" onSeeAll={() => {}} />
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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: HEADER_MAX_HEIGHT,
    paddingBottom: 20,
  },
  sectionContainer: {
    marginTop: 20,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
});
