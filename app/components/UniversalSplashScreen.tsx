/**
 * UniversalSplashScreen.tsx
 * Version Universelle - Fixe et magnifique sur tous appareils
 * Design épuré avec animations fluides
 */

import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { useColorScheme } from 'react-native';

interface Props {
  onAnimationEnd: () => void;
}

const UniversalSplashScreen: React.FC<Props> = ({ onAnimationEnd }) => {
  const isDark = useColorScheme() === 'dark';

  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.3);
  const logoRotation = useSharedValue(-10); // Rotation subtile
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const mottoOpacity = useSharedValue(0);
  const mottoTranslateY = useSharedValue(20);
  const overlayOpacity = useSharedValue(0.8);
  const pulseScale = useSharedValue(1);
  const shimmerOpacity = useSharedValue(0);
  const glowIntensity = useSharedValue(0); // Effet de lueur mode sombre
  const particlesOpacity = useSharedValue(0); // Particules flottantes
  const screenOpacity = useSharedValue(1);

  // Colors - mode aware avec effets spéciaux mode sombre
  const colors = {
    primary: isDark ? '#F59E0B' : '#D97706', // Plus vibrant en mode sombre
    secondary: isDark ? '#FCD34D' : '#F59E0B', 
    accent: isDark ? '#FBBF24' : '#FCD34D',
    background: isDark ? '#0F172A' : '#FFFFFF',
    surface: isDark ? '#1E293B' : '#F8FAFC',
    text: isDark ? '#F8FAFC' : '#0F172A',
    textSecondary: isDark ? '#CBD5E1' : '#64748B',
    overlay: isDark ? '#000000' : '#FFFFFF',
    // Couleurs spéciales mode sombre
    glow: isDark ? '#F59E0B' : 'transparent',
    glowIntense: isDark ? '#FBBF24' : 'transparent',
    particle: isDark ? '#FCD34D' : 'transparent',
  };

  const handleEnd = useCallback(() => {
    onAnimationEnd();
  }, [onAnimationEnd]);

  useEffect(() => {
    // Réduction de l'overlay en arrière-plan
    overlayOpacity.value = withTiming(0.15, { duration: 800 });

    // Logo entrance - plus fluide avec rotation
    logoOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
    logoScale.value = withDelay(
      200,
      withSpring(1, {
        damping: 8,
        stiffness: 100,
        mass: 1,
      })
    );
    logoRotation.value = withDelay(
      200,
      withSpring(0, { damping: 6, stiffness: 80 })
    );

    // Pulse subtil du logo
    pulseScale.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );

    // Titre - élégant
    titleOpacity.value = withDelay(
      800,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
    );
    titleTranslateY.value = withDelay(
      800,
      withSpring(0, { damping: 10, stiffness: 120 })
    );

    // Devise - douce
    mottoOpacity.value = withDelay(
      1200,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
    );
    mottoTranslateY.value = withDelay(
      1200,
      withSpring(0, { damping: 8, stiffness: 100 })
    );

    // Effet shimmer sur le titre
    shimmerOpacity.value = withDelay(
      1400,
      withRepeat(
        withSequence(
          withTiming(isDark ? 0.5 : 0.3, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1,
        false
      )
    );

    // Effets spéciaux mode sombre uniquement
    if (isDark) {
      // Lueur intense autour du logo
      glowIntensity.value = withDelay(
        800,
        withRepeat(
          withSequence(
            withTiming(0.8, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
            withTiming(0.3, { duration: 3000, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          false
        )
      );
    }

      // Particules flottantes
      particlesOpacity.value = withDelay(
        1600,
        withTiming(0.6, { duration: 1200 })
      );

    // Exit animation - plus courte
    const exitDelay = 3200; // Un peu plus long pour profiter des effets
    screenOpacity.value = withDelay(
      exitDelay,
      withTiming(0, {
        duration: 500,
        easing: Easing.in(Easing.quad),
      }, (finished) => {
        if (finished) runOnJS(handleEnd)();
      })
    );
  }, [handleEnd, logoOpacity, logoScale, logoRotation, titleOpacity, titleTranslateY, mottoOpacity, mottoTranslateY, overlayOpacity, pulseScale, shimmerOpacity, glowIntensity, particlesOpacity, screenOpacity, isDark]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const logoContainerStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value * pulseScale.value },
      { rotate: `${logoRotation.value}deg` }
    ],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value,
    transform: [{ scale: logoScale.value * pulseScale.value * 1.4 }],
  }));

  const particlesStyle = useAnimatedStyle(() => ({
    opacity: particlesOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const mottoStyle = useAnimatedStyle(() => ({
    opacity: mottoOpacity.value,
    transform: [{ translateY: mottoTranslateY.value }],
  }));

  const loaderProgressStyle = useAnimatedStyle(() => ({
    width: interpolate(
      screenOpacity.value,
      [1, 0],
      [0, 200],
      'clamp'
    )
  }));

  return (
    <>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background}
        translucent={false}
      />
      <Animated.View style={[styles.container, containerStyle]}>
        {/* Gradient de fond enrichi pour mode sombre */}
        <LinearGradient
          colors={isDark 
            ? [colors.background, '#1E293B', '#0F172A', '#1E293B', colors.background]
            : [colors.background, '#F1F5F9', colors.background]
          }
          locations={isDark ? [0, 0.25, 0.5, 0.75, 1] : [0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Overlay réduit */}
        <Animated.View 
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.overlay },
            overlayStyle
          ]} 
        />

        {/* Logo épuré - avec effets seulement en mode sombre */}
        <Animated.View style={[styles.logoContainer, logoContainerStyle]}>
          {/* Lueur intense en mode sombre uniquement */}
          {isDark && (
            <Animated.View 
              style={[
                styles.logoGlow,
                { 
                  backgroundColor: colors.glow + '80',
                  shadowColor: colors.glowIntense,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 30,
                  elevation: 10,
                },
                glowStyle
              ]}
            />
          )}
          
          <Animated.Image
            source={require('../../assets/images/Splash-Christ.png')}
            style={[styles.logo, isDark && {
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 20,
            }]}
            resizeMode="contain"
          />
          
          {/* Effet shimmer subtil */}
          <Animated.View 
            style={[
              styles.logoShimmer,
              { backgroundColor: colors.primary + (isDark ? '60' : '40') },
              shimmerStyle
            ]}
          />
        </Animated.View>

        {/* Titre avec effets enrichis */}
        <Animated.Text style={[styles.title, { 
          color: colors.text,
          textShadowColor: isDark ? colors.glowIntense + '80' : colors.primary + '30',
          textShadowOffset: { width: 0, height: isDark ? 4 : 2 },
          textShadowRadius: isDark ? 12 : 4,
        }, titleStyle]}>
          Christ En Nous
        </Animated.Text>

        {/* Devise avec effet lueur en mode sombre */}
        <Animated.View style={[styles.mottoContainer, mottoStyle]}>
          <Text style={[styles.mottoText, { 
            color: colors.textSecondary,
            textShadowColor: isDark ? colors.primary + '40' : 'transparent',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: isDark ? 8 : 0,
          }]}>
            Servir • Faire Des Disciples • Évangéliser
          </Text>
        </Animated.View>
        
        {/* Particules flottantes en mode sombre */}
        {isDark && (
          <Animated.View style={[styles.particlesContainer, particlesStyle]}>
            <View style={[styles.particle, styles.particle1, { backgroundColor: colors.particle }]} />
            <View style={[styles.particle, styles.particle2, { backgroundColor: colors.accent }]} />
            <View style={[styles.particle, styles.particle3, { backgroundColor: colors.primary }]} />
            <View style={[styles.particle, styles.particle4, { backgroundColor: colors.particle }]} />
          </Animated.View>
        )}

        {/* Loader repositionné */}
        <View style={styles.loaderContainer}>
          <View style={[styles.loaderTrack, { backgroundColor: colors.primary + '20' }]}>
            <Animated.View 
              style={[
                styles.loaderProgress, 
                { backgroundColor: colors.primary },
                loaderProgressStyle
              ]} 
            />
          </View>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
    position: 'relative',
  },
  logo: {
    width: 240,
    height: 240,
  },
  logoShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 120,
    zIndex: -1,
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -30,
    left: -30,
    zIndex: -2,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Nunito_800ExtraBold',
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 16,
  },
  mottoContainer: {
    paddingHorizontal: 20,
    marginBottom: 80,
    alignItems: 'center',
  },
  mottoText: {
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
    letterSpacing: 1.2,
    lineHeight: 22,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 100,
    width: 160,
    height: 3,
    alignSelf: 'center',
  },
  loaderTrack: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loaderProgress: {
    height: '100%',
    borderRadius: 2,
  },
  // Styles pour les particules flottantes mode sombre
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.6,
  },
  particle1: {
    top: '20%',
    left: '15%',
    width: 3,
    height: 3,
  },
  particle2: {
    top: '30%',
    right: '20%',
    width: 2,
    height: 2,
  },
  particle3: {
    bottom: '25%',
    left: '25%',
    width: 4,
    height: 4,
  },
  particle4: {
    bottom: '35%',
    right: '15%',
    width: 3,
    height: 3,
  },
});

export default UniversalSplashScreen;