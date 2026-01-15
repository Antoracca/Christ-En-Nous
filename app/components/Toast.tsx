// app/components/Toast.tsx
// Toast moderne et personnalisé

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info' | 'loading' | 'reminder';
  duration?: number;
  onHide?: () => void;
}

const { width } = Dimensions.get('window');

export default function Toast({
  visible,
  message,
  type = 'success',
  duration = 3000,
  onHide
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Apparition
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        })
      ]).start();

      // Disparition automatique
      if (type !== 'loading') {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  if (!visible && translateY._value === -100) return null;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'check-circle',
          color: '#4CAF50',
          bg: '#E8F5E9'
        };
      case 'error':
        return {
          icon: 'alert-circle',
          color: '#EF5350',
          bg: '#FFEBEE'
        };
      case 'loading':
        return {
          icon: 'loader',
          color: '#2196F3',
          bg: '#E3F2FD'
        };
      case 'reminder':
        return {
          icon: 'feather',
          color: '#7C4DFF',
          bg: '#EDE7F6'
        };
      default: // info
        return {
          icon: 'info',
          color: '#FF9800',
          bg: '#FFF3E0'
        };
    }
  };

  const config = getConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }]
        }
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={type !== 'loading' ? hideToast : undefined}
        style={[styles.toast, { backgroundColor: config.bg }]}
      >
        <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
          <Feather name={config.icon as any} size={20} color="#FFF" />
        </View>

        <Text style={[styles.message, { color: config.color }]}>
          {message}
        </Text>

        {type !== 'loading' && (
          <TouchableOpacity onPress={hideToast} style={styles.closeBtn}>
            <Feather name="x" size={18} color={config.color} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    elevation: 9999
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 60
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
    lineHeight: 22
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8
  }
});
