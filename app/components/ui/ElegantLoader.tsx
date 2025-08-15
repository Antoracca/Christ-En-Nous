import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ElegantLoaderProps {
  size?: number;
  color?: string;
}

export default function ElegantLoader({ size = 60, color = '#FFFFFF' }: ElegantLoaderProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValues = useRef([
    new Animated.Value(0.8),
    new Animated.Value(0.8),
    new Animated.Value(0.8),
    new Animated.Value(0.8),
    new Animated.Value(0.8),
    new Animated.Value(0.8),
  ]).current;

  useEffect(() => {
    // Animation de rotation continue
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Animation des points pulsants
    const pulseAnimations = scaleValues.map((scaleValue, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.2,
            duration: 600,
            delay: index * 100,
            easing: Easing.bezier(0.4, 0, 0.6, 1),
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 0.8,
            duration: 600,
            easing: Easing.bezier(0.4, 0, 0.6, 1),
            useNativeDriver: true,
          }),
        ])
      )
    );

    spinAnimation.start();
    pulseAnimations.forEach(anim => anim.start());

    return () => {
      spinAnimation.stop();
      pulseAnimations.forEach(anim => anim.stop());
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderDots = () => {
    const dots = [];
    const angleStep = 60; // 6 points, 360/6 = 60°

    for (let i = 0; i < 6; i++) {
      const angle = i * angleStep;
      const radian = (angle * Math.PI) / 180;
      const radius = size * 0.35;
      
      const x = Math.cos(radian) * radius;
      const y = Math.sin(radian) * radius;

      dots.push(
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              width: size * 0.15,
              height: size * 0.15,
              backgroundColor: color,
              transform: [
                { translateX: x },
                { translateY: y },
                { scale: scaleValues[i] }
              ],
              opacity: 0.9 - (i * 0.1),
            },
          ]}
        />
      );
    }
    return dots;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Cercle externe rotatif */}
      <Animated.View
        style={[
          styles.outerRing,
          {
            width: size,
            height: size,
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <LinearGradient
          colors={[color + '40', color + '00', color + '40']}
          style={[styles.gradient, { width: size, height: size, borderRadius: size / 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Points pulsants */}
      <View style={styles.dotsContainer}>
        {renderDots()}
      </View>

      {/* Centre lumineux */}
      <View style={[styles.center, { 
        width: size * 0.2, 
        height: size * 0.2, 
        backgroundColor: color,
        borderRadius: size * 0.1 
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gradient: {
    position: 'absolute',
  },
  dotsContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  center: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
});