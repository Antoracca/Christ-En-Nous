// app/components/NotificationModal.tsx
// 🔔 Modal moderne pour les notifications avec design glassmorphism

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Types pour les notifications
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'prayer' | 'event' | 'system' | 'social';
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  priority: 'low' | 'normal' | 'high';
}

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onNotificationPress: (notification: Notification) => void;
}

// Composant pour une notification individuelle
const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  onPress 
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onPress: (notification: Notification) => void;
}) => {
  const theme = useAppTheme();
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'prayer': return 'pray';
      case 'event': return 'calendar';
      case 'social': return 'account-group';
      case 'system': return 'cog';
      default: return 'information';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'prayer': return '#10B981';
      case 'event': return '#F59E0B';
      case 'social': return '#3B82F6';
      case 'system': return '#6B7280';
      default: return theme.colors.primary;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <TouchableOpacity 
      style={[
        styles.notificationItem, 
        { 
          backgroundColor: notification.isRead 
            ? theme.colors.surface + '80' 
            : theme.colors.surface,
          borderLeftColor: getNotificationColor(notification.type),
        }
      ]}
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={[
            styles.notificationIconContainer, 
            { backgroundColor: getNotificationColor(notification.type) + '20' }
          ]}>
            <MaterialCommunityIcons 
              name={getNotificationIcon(notification.type) as any} 
              size={20} 
              color={getNotificationColor(notification.type)} 
            />
          </View>
          
          <View style={styles.notificationTextContainer}>
            <Text 
              style={[
                styles.notificationTitle, 
                { 
                  color: theme.custom.colors.text,
                  opacity: notification.isRead ? 0.7 : 1 
                }
              ]}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            <Text 
              style={[
                styles.notificationMessage, 
                { 
                  color: theme.custom.colors.placeholder,
                  opacity: notification.isRead ? 0.6 : 0.8 
                }
              ]}
              numberOfLines={2}
            >
              {notification.message}
            </Text>
          </View>

          <View style={styles.notificationMeta}>
            <Text style={[styles.notificationTime, { color: theme.custom.colors.placeholder }]}>
              {formatTime(notification.timestamp)}
            </Text>
            {notification.priority === 'high' && (
              <View style={[styles.priorityBadge, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.priorityText}>!</Text>
              </View>
            )}
            {!notification.isRead && (
              <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
            )}
          </View>
        </View>
      </View>

      <View style={styles.notificationActions}>
        {!notification.isRead && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary + '20' }]}
            onPress={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
          >
            <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#EF444420' }]}
          onPress={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Composant principal du modal
export default function NotificationModal({
  visible,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onNotificationPress,
}: NotificationModalProps) {
  const theme = useAppTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(notif => 
    filter === 'all' || !notif.isRead
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" />
      
      {/* Overlay */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.overlayTouch} onPress={handleClose} activeOpacity={1} />
      </Animated.View>

      {/* Modal Content */}
      <Animated.View 
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <BlurView intensity={100} tint={theme.dark ? 'dark' : 'light'} style={styles.blurContainer}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outline }]}>
            <View style={styles.headerLeft}>
              <Ionicons name="notifications" size={24} color={theme.colors.primary} />
              <Text style={[styles.modalTitle, { color: theme.custom.colors.text }]}>
                Notifications
              </Text>
              {unreadCount > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={theme.custom.colors.placeholder} />
            </TouchableOpacity>
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterTab,
                filter === 'all' && { backgroundColor: theme.colors.primary + '20' }
              ]}
              onPress={() => setFilter('all')}
            >
              <Text style={[
                styles.filterText,
                { 
                  color: filter === 'all' ? theme.colors.primary : theme.custom.colors.placeholder 
                }
              ]}>
                Toutes ({notifications.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterTab,
                filter === 'unread' && { backgroundColor: theme.colors.primary + '20' }
              ]}
              onPress={() => setFilter('unread')}
            >
              <Text style={[
                styles.filterText,
                { 
                  color: filter === 'unread' ? theme.colors.primary : theme.custom.colors.placeholder 
                }
              ]}>
                Non lues ({unreadCount})
              </Text>
            </TouchableOpacity>

            {unreadCount > 0 && (
              <TouchableOpacity
                style={[styles.markAllButton, { backgroundColor: theme.colors.primary + '20' }]}
                onPress={onMarkAllAsRead}
              >
                <Ionicons name="checkmark-done" size={16} color={theme.colors.primary} />
                <Text style={[styles.markAllText, { color: theme.colors.primary }]}>
                  Tout lire
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Notifications List */}
          <ScrollView
            style={styles.notificationsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.notificationsContent}
          >
            {filteredNotifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons 
                  name="notifications-off-outline" 
                  size={48} 
                  color={theme.custom.colors.placeholder} 
                />
                <Text style={[styles.emptyText, { color: theme.custom.colors.placeholder }]}>
                  {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
                </Text>
              </View>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDeleteNotification}
                  onPress={onNotificationPress}
                />
              ))
            )}
          </ScrollView>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouch: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.15,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    marginLeft: 12,
  },
  unreadBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  closeButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
    marginRight: 12,
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginLeft: 'auto',
  },
  markAllText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    marginLeft: 4,
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationItem: {
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 20,
  },
  notificationMeta: {
    alignItems: 'flex-end',
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 4,
  },
  priorityBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    marginTop: 16,
    textAlign: 'center',
  },
});