// Boutons de réaction rapide
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ReactionType } from '@/data/quizData';
import { useAppTheme } from '@/hooks/useAppTheme';
import * as Haptics from 'expo-haptics';

interface ReactionButtonsProps {
  onReaction: (type: ReactionType) => void;
}

const REACTIONS: Array<{ type: ReactionType; icon: string; color: string; label: string }> = [
  { type: 'fire', icon: 'fire', color: '#FF6B35', label: 'Feu' },
  { type: 'clap', icon: 'hand-clap', color: '#FFD700', label: 'Applaudir' },
  { type: 'heart', icon: 'heart', color: '#FF1744', label: 'Aimer' },
  { type: 'laugh', icon: 'emoticon-lol', color: '#FFC107', label: 'Rire' },
  { type: 'wow', icon: 'emoticon-wow', color: '#2196F3', label: 'Wow' },
];

export default function ReactionButtons({ onReaction }: ReactionButtonsProps) {
  const theme = useAppTheme();

  const handleReaction = (type: ReactionType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReaction(type);
  };

  return (
    <View style={styles.container}>
      {REACTIONS.map((reaction) => (
        <TouchableOpacity
          key={reaction.type}
          style={[styles.button, { backgroundColor: theme.colors.surface }]}
          onPress={() => handleReaction(reaction.type)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name={reaction.icon as any} size={20} color={reaction.color} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});
