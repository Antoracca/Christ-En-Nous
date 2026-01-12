// Composant de bulle de réaction animée (comme TikTok)
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ReactionType } from '@/data/quizData';

const { width } = Dimensions.get('window');

interface ReactionBubbleProps {
  id: string;
  userName: string;
  userAvatar: string;
  type: ReactionType;
  onComplete: () => void;
}

const REACTION_CONFIG: Record<ReactionType, { icon: string; color: string; emoji: string }> = {
  fire: { icon: 'fire', color: '#FF6B35', emoji: '🔥' },
  clap: { icon: 'hand-clap', color: '#FFD700', emoji: '👏' },
  heart: { icon: 'heart', color: '#FF1744', emoji: '❤️' },
  laugh: { icon: 'emoticon-lol', color: '#FFC107', emoji: '😂' },
  wow: { icon: 'emoticon-wow', color: '#2196F3', emoji: '😮' },
  correct: { icon: 'check-circle', color: '#10B981', emoji: '✅' },
};

export default function ReactionBubble({ userName, userAvatar, type, onComplete }: ReactionBubbleProps) {
  const translateY = new Animated.Value(0);
  const opacity = new Animated.Value(1);
  const scale = new Animated.Value(0.5);
  const translateX = new Animated.Value(0);

  useEffect(() => {
    const randomX = (Math.random() - 0.5) * 100; // Déplacement horizontal aléatoire
    
    Animated.parallel([
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.2,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(translateY, {
        toValue: -200,
        duration: 3000,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: randomX,
        duration: 3000,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 3000,
        delay: 2000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  }, []);

  const config = REACTION_CONFIG[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY },
            { translateX },
            { scale },
          ],
          opacity,
        },
      ]}
    >
      <View style={[styles.bubble, { backgroundColor: config.color + '20' }]}>
        <Image source={{ uri: userAvatar }} style={styles.avatar} contentFit="cover" />
        <View style={styles.content}>
          <Text style={styles.emoji}>{config.emoji}</Text>
          <Text style={styles.name} numberOfLines={1}>{userName}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: width / 2 - 80,
    zIndex: 1000,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'white',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emoji: {
    fontSize: 16,
  },
  name: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    maxWidth: 80,
  },
});
