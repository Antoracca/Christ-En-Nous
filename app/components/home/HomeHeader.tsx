// app/components/home/HomeHeader.tsx
// Header Rétractable (Collapsible) et Animé - Version Fond Seul (Boutons gérés par le parent)

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, StatusBar, Platform, Animated as RNAnimated, Easing, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  interpolate, 
  Extrapolate,
  SharedValue,
  withSpring,
  withTiming,
  useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import Avatar from '@/components/profile/Avatar';

// Hauteur de base (sera ajustée avec les insets)
const BASE_HEADER_HEIGHT = 240; 
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 110 : 90;

interface HomeHeaderProps {
  scrollY: SharedValue<number>;
}

// --- COMPOSANT DE SALUTATION ANIMÉ ---
const AnimatedGreeting = ({ username, color }: { username: string; color: string }) => {
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const [showAvatar, setShowAvatar] = useState(true);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 12 });
    opacity.value = withTiming(1, { duration: 400 });
    scale.value = withSpring(1);

    const timeout = setTimeout(() => {
      translateY.value = withTiming(10, { duration: 500 });
      opacity.value = withTiming(0, { duration: 500 });
      setShowAvatar(false);
    }, 4000);

    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.greetingContainer}>
      <View style={styles.greetingRow}>
        <Text style={[styles.greetingText, { color }]}>Shalom,</Text>
        <View style={styles.nameWrapper}>
          <Text style={[styles.usernameText, { color }]} numberOfLines={1} ellipsizeMode="tail">
            {username}
          </Text>
          {showAvatar && (
            <Animated.View style={[styles.popGreeting, animatedStyle]}>
              <View style={styles.avatarBubble}>
                <Text style={styles.avatarEmoji}>👋</Text>
              </View>
              <View style={styles.bubbleTail} />
            </Animated.View>
          )}
        </View>
      </View>
    </View>
  );
};

const HomeHeader = ({ scrollY }: HomeHeaderProps) => {
  const theme = useAppTheme();
  const { userProfile } = useAuth();
  const insets = useSafeAreaInsets();
  
  const headerMaxHeight = BASE_HEADER_HEIGHT + insets.top;
  const scrollDistance = headerMaxHeight - HEADER_MIN_HEIGHT;

  const particlesAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.timing(particlesAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
        easing: Easing.linear
      })
    ).start();
  }, [particlesAnim]);

  // --- ANIMATIONS ---

  const headerHeightStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, scrollDistance],
      [headerMaxHeight, HEADER_MIN_HEIGHT],
      Extrapolate.CLAMP
    );
    return { height };
  });

  const fadeOutStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, scrollDistance * 0.6],
      [1, 0],
      Extrapolate.CLAMP
    );
    const translateY = interpolate(scrollY.value, [0, scrollDistance], [0, -20], Extrapolate.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  const avatarStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [0, scrollDistance], [1, 0.9], Extrapolate.CLAMP);
    const translateY = interpolate(scrollY.value, [0, scrollDistance], [0, -15], Extrapolate.CLAMP);
    return { transform: [{ scale }, { translateY }] };
  });

  const miniTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [scrollDistance - 50, scrollDistance],
      [0, 1],
      Extrapolate.CLAMP
    );
    // On remonte le texte vers le haut (-10px) pour le centrer verticalement
    const translateY = interpolate(
      scrollY.value,
      [scrollDistance - 50, scrollDistance],
      [10, -10],
      Extrapolate.CLAMP
    );
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <Animated.View style={[styles.headerContainer, headerHeightStyle]} pointerEvents="box-none">
      <LinearGradient
        colors={[theme.colors.primary, '#1E3A8A']}
        style={styles.headerCurve}
      >
        <RNAnimated.View style={[
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
        </RNAnimated.View>
        
        <View style={[styles.headerContentContainer, { paddingTop: insets.top + 10 }]}>
          
          {/* Ligne du haut (Avatar, Titre Mini) - SANS BOUTONS */}
          <View style={styles.headerTopRow}>
            <Animated.View style={avatarStyle}>
              <Avatar 
                photoURL={userProfile?.photoURL}
                prenom={userProfile?.prenom}
                nom={userProfile?.nom}
                size={50} 
              />
            </Animated.View>

            <Animated.View style={[styles.miniTitleContainer, miniTitleStyle]} pointerEvents="none">
              <Text style={styles.miniTitleText}>Christ En Nous</Text>
            </Animated.View>
          </View>

          {/* Éléments rétractables */}
          <Animated.View style={[styles.collapsibleContent, fadeOutStyle]}>
            <View style={styles.welcomeTextContainer}>
              <AnimatedGreeting 
                username={userProfile?.prenom || 'Bien-aimé(e)'} 
                color={theme.colors.onPrimary} 
              />
              <Text style={[styles.subtitleText, { color: theme.colors.onPrimary }]}>
                Ton église à{' '}
                <Text style={{ color: theme.custom.colors.accent, fontWeight: '800' }}>portée de main</Text>
              </Text>
            </View>
            
            <View style={[styles.searchContainer, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <TextInput
                placeholder="Rechercher..."
                placeholderTextColor={'rgba(255,255,255,0.7)'}
                style={[styles.searchInput, { color: theme.colors.onPrimary }]}
              />
              <Ionicons name="search" size={22} color={'rgba(255,255,255,0.7)'} style={styles.searchIcon} />
            </View>
          </Animated.View>

        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        // zIndex géré par le parent
    },
    headerCurve: {
        flex: 1,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
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
        paddingHorizontal: 20,
        flex: 1,
        paddingBottom: 20,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 20,
        height: 60,
    },
    miniTitleContainer: {
        position: 'absolute',
        left: 0, 
        right: 0, 
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        zIndex: -1,
    },
    miniTitleText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Nunito_800ExtraBold',
    },
    collapsibleContent: {
        marginTop: 15,
        justifyContent: 'flex-end',
        flex: 1,
    },
    welcomeTextContainer: {
        marginBottom: 20,
        paddingLeft: 4,
    },
    greetingContainer: {
        marginBottom: 4,
    },
    greetingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    greetingText: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 28,
        marginRight: 8,
    },
    nameWrapper: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    usernameText: {
        fontFamily: 'Nunito_800ExtraBold',
        fontSize: 28,
        maxWidth: 200,
    },
    popGreeting: {
        position: 'absolute',
        top: -35, 
        right: -10,
        alignItems: 'center',
        zIndex: 10,
    },
    avatarBubble: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    avatarEmoji: {
        fontSize: 16,
    },
    bubbleTail: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 4,
        borderRightWidth: 4,
        borderTopWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#FFFFFF',
        marginTop: -1,
        alignSelf: 'center',
    },
    subtitleText: {
        fontFamily: 'Nunito_400Regular',
        fontSize: 16,
        opacity: 0.9,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderRadius: 16,
        height: 50,
        marginBottom: 5,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontFamily: 'Nunito_400Regular',
        fontSize: 16,
        paddingRight: 10,
    },
    searchIcon: {
        opacity: 0.8,
    },
});

export default HomeHeader;