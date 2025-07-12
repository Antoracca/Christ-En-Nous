// src/components/LeftInputIcon.tsx
import React, { useRef } from 'react';
import {
 
  StyleSheet,
  Animated,
  Pressable,
  GestureResponderEvent,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export interface LeftInputIconProps {
  /**
   * Nom de l’icône FontAwesome5 (ex: "user", "lock", "envelope", etc.)
   */
  icon: React.ComponentProps<typeof FontAwesome5>['name'];
  /**
   * Diamètre du cercle intérieur (en px). Défaut 36.
   */
  size?: number;
  /**
   * Couleur de début du dégradé de bordure. Défaut bleu nuit.
   */
  primaryColor?: string;
  /**
   * Couleur de fin du dégradé de bordure. Défaut or.
   */
  accentColor?: string;
  /**
   * Callback optionnel quand on appuie dessus.
   */
  onPress?: () => void;
}

export default function LeftInputIcon({
  icon,
  size = 36,
  primaryColor = '#001F5B',
  accentColor = '#003B99',
  onPress,
}: LeftInputIconProps) {
  // Animation scale pour l'effet “press”
  const anim = useRef(new Animated.Value(0)).current;

  const handlePressIn = (_event: GestureResponderEvent) => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 100,
    }).start();
  };

  const handlePressOut = (_event: GestureResponderEvent) => {
    Animated.spring(anim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 6,
      tension: 100,
    }).start();
    onPress?.();
  };

  // Interpolation de 0→1 en scale 1→0.92
  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.92],
  });

  // Calcul de la taille totale du cercle (+ bordure)
  const BORDER = 2;
  const outerSize = size + BORDER * 2;

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.wrapper}
      hitSlop={6}
    >
      {/* Cercle extérieur dégradé */}
      <LinearGradient
        colors={[primaryColor, accentColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradientBorder,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
          },
        ]}
      >
        {/* Cercle intérieur animé */}
        <Animated.View
          style={[
            styles.innerCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              transform: [{ scale }],
            },
          ]}
        >
          <FontAwesome5 name={icon} size={size * 0.6} color={primaryColor} />
        </Animated.View>
      </LinearGradient>

      {/* Séparateur dégradé haut de gamme */}
      <LinearGradient
        colors={[accentColor, primaryColor]}
        style={[
          styles.separator,
          { height: outerSize + 4 }, // un peu plus haut que le cercle
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradientBorder: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  innerCircle: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  separator: {
    width: 3,
    borderRadius: 1.5,
    marginLeft: -3,   // légère superposition pour l’effet “encoche”
    elevation: 1,
  },
});
