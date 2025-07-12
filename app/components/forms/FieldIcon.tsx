// FieldIcon.tsx — version harmonisée avec LeftInputIcon + Progression dynamique
import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Pressable,
  GestureResponderEvent,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export interface FieldIconProps {
  name: React.ComponentProps<typeof FontAwesome5>['name'];
  size?: number;
  primaryColor?: string;
  accentColor?: string;
  onPress?: () => void;
  progress?: number; // Ajout de la progression (entre 0 et 1)
}

export default function FieldIcon({
  name,
  size = 36,
  primaryColor = '#001F5B',
  accentColor = '#003B99',
  onPress,
  progress = 0,
}: FieldIconProps) {
  const anim = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(ringAnim, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress, ringAnim]);

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

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.92],
  });

  const BORDER = 2;
  const outerSize = size + BORDER * 2;
  const progressWidth = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.wrapper}
      hitSlop={6}
    >
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
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
            <FontAwesome5 name={name} size={size * 0.6} color={primaryColor} />
          </Animated.View>
        </LinearGradient>

        <Animated.View
          style={[styles.progressRing, { width: progressWidth }]}
        />
      </View>

      <LinearGradient
        colors={[accentColor, primaryColor]}
        style={[
          styles.separator,
          { height: outerSize + 4 },
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
    marginLeft: -3,
    elevation: 1,
  },
  progressRing: {
    height: 2,
    backgroundColor: '#10B981', // vert par défaut
    alignSelf: 'center',
    marginTop: 4,
    borderRadius: 1,
  },
});
