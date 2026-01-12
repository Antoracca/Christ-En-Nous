import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay, withTiming, runOnJS } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface TopToastProps {
  visible: boolean;
  message: string;
  onHide: () => void;
}

export default function TopToast({ visible, message, onHide }: TopToastProps) {
  const translateY = useSharedValue(-150);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(Platform.OS === 'ios' ? 50 : 20, { damping: 12 });
      
      // Auto hide after 4 seconds
      const timeout = setTimeout(() => {
        translateY.value = withTiming(-150, { duration: 300 }, () => {
          runOnJS(onHide)();
        });
      }, 4000);
      
      return () => clearTimeout(timeout);
    } else {
      translateY.value = -150;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible && translateY.value === -150) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <BlurView intensity={80} tint="light" style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="check" size={18} color="white" />
        </View>
        <Text style={styles.message}>{message}</Text>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    width: '100%',
    overflow: 'hidden',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: '#1F2937',
    lineHeight: 16,
  },
});
