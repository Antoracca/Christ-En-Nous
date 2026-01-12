// Toast de réaction (comme les lives TikTok)
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ReactionType } from '@/data/quizData';
import { useAppTheme } from '@/hooks/useAppTheme';

const { width } = Dimensions.get('window');

interface ReactionToastProps {
  id: string;
  userName: string;
  userAvatar: string;
  type: ReactionType;
  onComplete: () => void;
}

const REACTION_CONFIG: Record<ReactionType, { icon: string; color: string; label: string }> = {
  fire: { icon: 'fire', color: '#FF6B35', label: 'a réagi avec 🔥' },
  clap: { icon: 'hand-clap', color: '#FFD700', label: 'applaudit 👏' },
  heart: { icon: 'heart', color: '#FF1744', label: 'aime ❤️' },
  laugh: { icon: 'emoticon-lol', color: '#FFC107', label: 'rigole 😂' },
  wow: { icon: 'emoticon-wow', color: '#2196F3', label: 'est impressionné 😮' },
  correct: { icon: 'check-circle', color: '#10B981', label: 'a répondu correctement ✅' },
};

export default function ReactionToast({ userName, userAvatar, type, onComplete }: ReactionToastProps) {
  const theme = useAppTheme();
  const slideX = new Animated.Value(width);
  const opacity = new Animated.Value(0);
  const config = REACTION_CONFIG[type];

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.spring(slideX, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation de sortie après 3 secondes
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideX, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: slideX }],
          opacity,
        },
      ]}
    >
      <View style={[styles.toast, { backgroundColor: theme.colors.surface, borderLeftColor: config.color }]}>
        <Image source={{ uri: userAvatar }} style={styles.avatar} contentFit="cover" />
        <View style={styles.content}>
          <Text style={[styles.name, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {userName}
          </Text>
          <Text style={[styles.action, { color: theme.colors.onSurfaceVariant }]}>
            {config.label}
          </Text>
        </View>
        <MaterialCommunityIcons name={config.icon as any} size={20} color={config.color} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 2,
  },
  action: {
    fontSize: 11,
    fontFamily: 'Nunito_400Regular',
  },
});
