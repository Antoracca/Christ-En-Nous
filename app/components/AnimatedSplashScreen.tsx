/**
 * AnimatedSplashScreen.tsx
 * Version 6.0 - Premium UI/UX Rebalanced & Dark Mode Enhanced
 * @author TeamAssist for Chef Adjoint Antoni
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions, useColorScheme } from 'react-native';
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interpolate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Extrapolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Configuration premium recalculée
const CONFIG = {
  logo: SCREEN_WIDTH * 0.35, // Légèrement plus grand pour compenser
  title: SCREEN_WIDTH * 0.082,
  motto: SCREEN_WIDTH * 0.046,
  duration: {
    logo: 1500,
    title: 1000,
    motto: 750,
    fadeOut: 650
  },
  effects: {
    breathingDuration: 3500,
    pulseIntensity: 0.025,
    shimmerDuration: 2800
  }
};

interface Props {
  onAnimationEnd: () => void;
}

const AnimatedSplashScreen: React.FC<Props> = ({ onAnimationEnd }) => {
  const isDark = useColorScheme() === 'dark';
  
  // Palette de couleurs premium avec mode sombre amélioré
  const colors = {
    // Arrière-plans
    bg: isDark ? '#0A0A0A' : '#FFFFFF',
    bgAccent: isDark ? '#1A1A1A' : '#F8FAFC',
    bgSecondary: isDark ? '#2A2A2A' : '#F1F5F9',
    bgTertiary: isDark ? '#0F0F0F' : '#FEFEFE',
    
    // Textes
    text: isDark ? '#F8F9FA' : '#0F172A',
    textSecondary: isDark ? '#E9ECEF' : '#334155',
    
    // Accents avec variations pour le mode sombre
    accent: isDark ? '#FFD700' : '#2563EB',
    accentLight: isDark ? '#FFF8DC' : '#DBEAFE',
    accentDark: isDark ? '#B8860B' : '#1D4ED8',
    
    // Tons subtils améliorés
    subtle: isDark ? 'rgba(248,249,250,0.8)' : 'rgba(15,23,42,0.75)',
    subtleLight: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
    
    // Effets visuels premium
    glow: isDark ? 'rgba(255,215,0,0.3)' : 'rgba(37,99,235,0.2)',
    glowIntense: isDark ? 'rgba(255,215,0,0.5)' : 'rgba(37,99,235,0.3)',
    shimmer: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
    
    // Ombres
    shadowColor: isDark ? '#000000' : '#64748B',
    shadowLight: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.1)',
  };

  // Animations principales
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.2);
  const logoRotation = useSharedValue(-8);
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.85);
  
  // Animations pour les effets premium
  const breathingScale = useSharedValue(1);
  const shimmerOpacity = useSharedValue(0);
  const glowIntensity = useSharedValue(0);
  const topLineWidth = useSharedValue(0);
  const bottomLineWidth = useSharedValue(0);
  
  // Animations cascade pour la devise - repositionnées
  const motto1Opacity = useSharedValue(0);
  const motto1Y = useSharedValue(50);
  const motto2Opacity = useSharedValue(0);
  const motto2Y = useSharedValue(50);
  const motto3Opacity = useSharedValue(0);
  const motto3Y = useSharedValue(50);
  const motto4Opacity = useSharedValue(0);
  const motto4Y = useSharedValue(50);
  const motto5Opacity = useSharedValue(0);
  const motto5Y = useSharedValue(50);
  
  const mottoWords = ['Servir', '•', 'Faire Des Disciples', '•', 'Évangéliser'];
  
  const mottoAnimations = useMemo(() => [
    { opacity: motto1Opacity, translateY: motto1Y },
    { opacity: motto2Opacity, translateY: motto2Y },
    { opacity: motto3Opacity, translateY: motto3Y },
    { opacity: motto4Opacity, translateY: motto4Y },
    { opacity: motto5Opacity, translateY: motto5Y },
  ], [motto1Opacity, motto1Y, motto2Opacity, motto2Y, motto3Opacity, motto3Y, motto4Opacity, motto4Y, motto5Opacity, motto5Y]);
  
  // Animation finale avec parallaxe
  const screenOpacity = useSharedValue(1);
  const screenScale = useSharedValue(1);
  const parallaxY = useSharedValue(0);

  const handleEnd = useCallback(() => {
    onAnimationEnd();
  }, [onAnimationEnd]);

  useEffect(() => {
    // Phase 1: Logo avec entrée dramatique
    logoOpacity.value = withTiming(1, {
      duration: CONFIG.duration.logo,
      easing: Easing.out(Easing.cubic),
    });
    
    logoScale.value = withSpring(1, {
      damping: 18,
      stiffness: 130,
      overshootClamping: false,
    });

    logoRotation.value = withSpring(0, {
      damping: 25,
      stiffness: 120,
    });

    // Phase 2: Lignes décoratives qui s'étendent
    topLineWidth.value = withDelay(
      600,
      withSpring(1, {
        damping: 15,
        stiffness: 100,
      })
    );

    bottomLineWidth.value = withDelay(
      700,
      withSpring(1, {
        damping: 15,
        stiffness: 100,
      })
    );

    // Phase 3: Titre repositionné
    titleOpacity.value = withDelay(
      1000,
      withTiming(1, {
        duration: CONFIG.duration.title,
        easing: Easing.out(Easing.cubic),
      })
    );

    titleScale.value = withDelay(
      1000,
      withSpring(1, {
        damping: 20,
        stiffness: 150,
      })
    );

    // Phase 4: Effets visuels premium
    glowIntensity.value = withDelay(
      1300,
      withTiming(1, {
        duration: 900,
        easing: Easing.out(Easing.quad),
      })
    );

    // Animation de respiration subtile
    breathingScale.value = withDelay(
      1700,
      withRepeat(
        withSequence(
          withTiming(1 + CONFIG.effects.pulseIntensity, {
            duration: CONFIG.effects.breathingDuration,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(1, {
            duration: CONFIG.effects.breathingDuration,
            easing: Easing.inOut(Easing.sin),
          })
        ),
        -1,
        false
      )
    );

    // Effet shimmer
    shimmerOpacity.value = withDelay(
      1500,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: CONFIG.effects.shimmerDuration,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(0, {
            duration: CONFIG.effects.shimmerDuration,
            easing: Easing.inOut(Easing.quad),
          })
        ),
        -1,
        false
      )
    );

    // Phase 5: Devise repositionnée plus bas
    mottoAnimations.forEach((anim, index) => {
      const delay = 2000 + (index * 200);
      
      anim.opacity.value = withDelay(
        delay,
        withTiming(1, {
          duration: CONFIG.duration.motto,
          easing: Easing.out(Easing.cubic),
        })
      );
      
      anim.translateY.value = withDelay(
        delay,
        withSpring(0, {
          damping: 14,
          stiffness: 110,
          overshootClamping: false,
        })
      );
    });

    // Phase 6: Transition finale avec parallaxe
    const exitDelay = 5200;
    
    parallaxY.value = withDelay(
      exitDelay,
      withTiming(-60, {
        duration: CONFIG.duration.fadeOut,
        easing: Easing.in(Easing.cubic),
      })
    );
    
    screenScale.value = withDelay(
      exitDelay,
      withTiming(1.06, {
        duration: CONFIG.duration.fadeOut,
        easing: Easing.in(Easing.cubic),
      })
    );
    
    screenOpacity.value = withDelay(
      exitDelay,
      withTiming(0, {
        duration: CONFIG.duration.fadeOut,
        easing: Easing.in(Easing.cubic),
      }, (finished) => {
        if (finished) runOnJS(handleEnd)();
      })
    );
  }, [
    handleEnd,
    logoOpacity,
    logoScale,
    logoRotation,
    titleOpacity,
    titleScale,
    mottoAnimations,
    screenOpacity,
    screenScale,
    parallaxY,
    breathingScale,
    shimmerOpacity,
    glowIntensity,
    topLineWidth,
    bottomLineWidth
  ]);

  // Styles animés premium
  const containerStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [
      { scale: screenScale.value },
      { translateY: parallaxY.value }
    ],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value * breathingScale.value },
      { rotateZ: `${logoRotation.value}deg` }
    ],
  }));

  const logoGlowStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value * (isDark ? 0.7 : 0.4),
    transform: [
      { scale: logoScale.value * breathingScale.value * 1.3 }
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const topLineStyle = useAnimatedStyle(() => ({
    width: SCREEN_WIDTH * 0.4 * topLineWidth.value,
    opacity: topLineWidth.value,
  }));

  const bottomLineStyle = useAnimatedStyle(() => ({
    width: SCREEN_WIDTH * 0.35 * bottomLineWidth.value,
    opacity: bottomLineWidth.value,
  }));
  
  // Styles animés pour chaque mot de la devise
  const motto1Style = useAnimatedStyle(() => ({
    opacity: motto1Opacity.value,
    transform: [{ translateY: motto1Y.value }],
  }));
  
  const motto2Style = useAnimatedStyle(() => ({
    opacity: motto2Opacity.value,
    transform: [{ translateY: motto2Y.value }],
  }));
  
  const motto3Style = useAnimatedStyle(() => ({
    opacity: motto3Opacity.value,
    transform: [{ translateY: motto3Y.value }],
  }));
  
  const motto4Style = useAnimatedStyle(() => ({
    opacity: motto4Opacity.value,
    transform: [{ translateY: motto4Y.value }],
  }));
  
  const motto5Style = useAnimatedStyle(() => ({
    opacity: motto5Opacity.value,
    transform: [{ translateY: motto5Y.value }],
  }));
  
  const mottoStyles = [motto1Style, motto2Style, motto3Style, motto4Style, motto5Style];

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Gradient premium multicouche optimisé pour le mode sombre */}
      <LinearGradient
        colors={isDark 
          ? [colors.bg, colors.bgSecondary, colors.bgAccent, colors.bgTertiary, colors.bg]
          : [colors.bg, colors.bgSecondary, colors.bgAccent, colors.bg]
        }
        locations={isDark ? [0, 0.2, 0.5, 0.8, 1] : [0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Cercles décoratifs premium repositionnés */}
      <View style={[styles.circle, styles.circleTop, { 
        borderColor: colors.accent, 
        opacity: isDark ? 0.18 : 0.12,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: isDark ? 0.4 : 0.3,
        shadowRadius: isDark ? 25 : 20,
      }]} />
      <View style={[styles.circle, styles.circleBottom, { 
        borderColor: colors.accentLight, 
        opacity: isDark ? 0.15 : 0.1,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: isDark ? 0.3 : 0.2,
        shadowRadius: isDark ? 20 : 15,
      }]} />
      <View style={[styles.circle, styles.circleCenter, { 
        borderColor: colors.accentDark, 
        opacity: isDark ? 0.12 : 0.06,
      }]} />

      {/* Ligne décorative du haut avec animation */}
    

      {/* Effet de lueur pour le logo repositionné */}
      <Animated.View style={[
        styles.logoGlow, 
        { backgroundColor: colors.glow }, 
        logoGlowStyle
      ]} />

      {/* Logo repositionné plus haut */}
      <Animated.Image
        source={require('../../assets/images/Splash-Christ.png')}
        style={[styles.logo, logoStyle]}
        resizeMode="contain"
      />

      {/* Ligne décorative centrale plus fine */}
      <Animated.View style={[
        styles.centralLine, 
        { backgroundColor: colors.accent }, 
        titleStyle
      ]} />

      {/* Titre repositionné au centre */}
      <Animated.Text style={[styles.title, { 
        color: colors.text,
        textShadowColor: isDark ? colors.glowIntense : colors.glow,
        textShadowOffset: { width: 0, height: isDark ? 3 : 2 },
        textShadowRadius: isDark ? 12 : 8,
      }, titleStyle]}>
        Christ En Nous
      </Animated.Text>

      {/* Devise repositionnée plus bas avec espacement optimisé */}
      <View style={styles.mottoContainer}>
        {mottoWords.map((word, index) => {
          const isDot = word === '•';
          
          return (
            <Animated.Text
              key={index}
              style={[
                styles.mottoText,
                isDot && styles.mottoDot,
                { 
                  color: isDot ? colors.accent : colors.subtle,
                  textShadowColor: isDot ? colors.glow : 'transparent',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: isDark ? 6 : 4,
                },
                mottoStyles[index],
              ]}
            >
              {word}
            </Animated.Text>
          );
        })}
      </View>

      {/* Particules flottantes repositionnées */}
      <EnhancedFloatingElements 
        color={colors.accent} 
        glowColor={colors.glow}
        isDark={isDark}
      />
      
      {/* Ligne décorative du bas avec animation */}
      <Animated.View style={[
        styles.bottomLine, 
        { backgroundColor: colors.accent }, 
        bottomLineStyle,
        shimmerStyle
      ]} />
    </Animated.View>
  );
};

// Composant amélioré pour les éléments flottants
const EnhancedFloatingElements = ({ 
  color, 
  glowColor, 
  isDark 
}: { 
  color: string; 
  glowColor: string; 
  isDark: boolean;
}) => {
  const dot1Y = useSharedValue(0);
  const dot1Opacity = useSharedValue(0);
  const dot2Y = useSharedValue(0);
  const dot2Opacity = useSharedValue(0);
  const dot3Y = useSharedValue(0);
  const dot3Opacity = useSharedValue(0);
  const dot4Y = useSharedValue(0);
  const dot4Opacity = useSharedValue(0);
  const dot5Y = useSharedValue(0);
  const dot5Opacity = useSharedValue(0);

  useEffect(() => {
    // Particules repositionnées pour le nouveau layout
    dot1Y.value = withDelay(
      2500,
      withSpring(-SCREEN_HEIGHT * 0.45, {
        damping: 4,
        stiffness: 18,
        mass: 2,
      })
    );
    dot1Opacity.value = withDelay(2500, withTiming(isDark ? 0.5 : 0.4, { duration: 800 }));
    
    dot2Y.value = withDelay(
      2700,
      withSpring(-SCREEN_HEIGHT * 0.4, {
        damping: 5,
        stiffness: 15,
        mass: 3,
      })
    );
    dot2Opacity.value = withDelay(2700, withTiming(isDark ? 0.4 : 0.3, { duration: 800 }));
    
    dot3Y.value = withDelay(
      2900,
      withSpring(-SCREEN_HEIGHT * 0.5, {
        damping: 3,
        stiffness: 20,
        mass: 1.5,
      })
    );
    dot3Opacity.value = withDelay(2900, withTiming(isDark ? 0.45 : 0.35, { duration: 800 }));
    
    dot4Y.value = withDelay(
      3100,
      withSpring(-SCREEN_HEIGHT * 0.35, {
        damping: 6,
        stiffness: 12,
        mass: 4,
      })
    );
    dot4Opacity.value = withDelay(3100, withTiming(isDark ? 0.35 : 0.25, { duration: 800 }));
    
    dot5Y.value = withDelay(
      3300,
      withSpring(-SCREEN_HEIGHT * 0.42, {
        damping: 4,
        stiffness: 16,
        mass: 2.5,
      })
    );
    dot5Opacity.value = withDelay(3300, withTiming(isDark ? 0.3 : 0.2, { duration: 800 }));
  }, [dot1Y, dot1Opacity, dot2Y, dot2Opacity, dot3Y, dot3Opacity, dot4Y, dot4Opacity, dot5Y, dot5Opacity, isDark]);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1Y.value }],
    opacity: dot1Opacity.value,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2Y.value }],
    opacity: dot2Opacity.value,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3Y.value }],
    opacity: dot3Opacity.value,
  }));

  const dot4Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot4Y.value }],
    opacity: dot4Opacity.value,
  }));

  const dot5Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot5Y.value }],
    opacity: dot5Opacity.value,
  }));

  return (
    <>
      <Animated.View style={[styles.floatingDot, { 
        backgroundColor: color, 
        left: '12%', 
        bottom: 0,
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: isDark ? 1.2 : 1,
        shadowRadius: isDark ? 10 : 8,
      }, dot1Style]} />
      <Animated.View style={[styles.floatingDot, { 
        backgroundColor: color, 
        left: '30%', 
        bottom: 0, 
        width: 3, 
        height: 3,
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: isDark ? 1.2 : 1,
        shadowRadius: isDark ? 8 : 6,
      }, dot2Style]} />
      <Animated.View style={[styles.floatingDot, { 
        backgroundColor: color, 
        left: '55%', 
        bottom: 0, 
        width: 5, 
        height: 5,
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: isDark ? 1.2 : 1,
        shadowRadius: isDark ? 12 : 10,
      }, dot3Style]} />
      <Animated.View style={[styles.floatingDot, { 
        backgroundColor: color, 
        left: '75%', 
        bottom: 0, 
        width: 2, 
        height: 2,
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: isDark ? 1.2 : 1,
        shadowRadius: isDark ? 6 : 4,
      }, dot4Style]} />
      <Animated.View style={[styles.floatingDot, { 
        backgroundColor: color, 
        left: '88%', 
        bottom: 0, 
        width: 3.5, 
        height: 3.5,
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: isDark ? 1.2 : 1,
        shadowRadius: isDark ? 9 : 7,
      }, dot5Style]} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    borderWidth: 6,
    borderRadius: 1000,
  },
  circleTop: {
    width: SCREEN_WIDTH * 2.4,
    height: SCREEN_WIDTH * 2.4,
    top: -SCREEN_WIDTH * 1.2,
    left: -SCREEN_WIDTH * 0.7,
  },
  circleBottom: {
    width: SCREEN_WIDTH * 1.9,
    height: SCREEN_WIDTH * 1.9,
    bottom: -SCREEN_WIDTH * 0.95,
    right: -SCREEN_WIDTH * 0.45,
  },
  circleCenter: {
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 1.5,
    top: SCREEN_HEIGHT * 0.05,
    right: -SCREEN_WIDTH * 0.8,
    borderWidth: 1,
  },
  
  
  bottomLine: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.18,
    height: 2,
    borderRadius: 1,
  },
  logoGlow: {
    position: 'absolute',
    width: CONFIG.logo * 1.9,
    height: CONFIG.logo * 1.9,
    borderRadius: CONFIG.logo * 1.2,
    top: SCREEN_HEIGHT * 0.25, // Repositionné plus haut
  },
  logo: {
    position: 'absolute',
    width: CONFIG.logo,
    height: CONFIG.logo,
    top: SCREEN_HEIGHT * 0.25, // Repositionné plus haut
  },
  centralLine: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.48, // Ligne fine au-dessus du titre
    width: 80,
    height: 1.5,
    borderRadius: 0.75,
  },
  title: {
    position: 'absolute',
    fontSize: CONFIG.title,
    fontFamily: 'Nunito_700Bold',
    letterSpacing: 3,
    top: SCREEN_HEIGHT * 0.5 - 80, // Position centrée selon votre choix
    fontWeight: '800',
    textAlign: 'center',
  },
  mottoContainer: {
    position: 'absolute',
    alignItems: 'center',
    top: SCREEN_HEIGHT * 0.65, // Repositionné plus bas pour équilibrer
    minHeight: 140,
  },
  mottoText: {
    fontSize: CONFIG.motto,
    fontFamily: 'Nunito_500Medium',
    marginVertical: 12,
    letterSpacing: 1.2,
    lineHeight: CONFIG.motto * 1.4,
    textAlign: 'center',
  },
  mottoDot: {
    fontSize: CONFIG.motto * 0.85,
    marginVertical: 8,
    fontWeight: '600',
  },
  floatingDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default AnimatedSplashScreen;