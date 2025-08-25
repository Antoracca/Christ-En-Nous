// app/components/home/HomeHeader.tsx
// Le header principal et animé de l'écran d'accueil.

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, Platform, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import ModernMenuIcon from '@/components/ui/ModernMenuIcon';
import Avatar from '@/components/profile/Avatar';

const HEADER_MAX_HEIGHT = 280;

interface HomeHeaderProps {
  onNotificationPress: () => void;
  unreadCount: number;
  onMenuPress: () => void;
}

const HomeHeader = ({ onNotificationPress, unreadCount, onMenuPress }: HomeHeaderProps) => {
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

const styles = StyleSheet.create({
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
    sparkle: {
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
});

export default HomeHeader;
