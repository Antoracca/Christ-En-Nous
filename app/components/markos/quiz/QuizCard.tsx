// Carte de quiz pour la liste
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Quiz, QuizTopic } from '@/data/quizData';

interface QuizCardProps {
  quiz: Quiz;
  onPress: () => void;
}

const TOPIC_COLORS: Record<QuizTopic, string> = {
  Bible: '#8B5CF6',
  Culture: '#3B82F6',
  Histoire: '#10B981',
  Géographie: '#F59E0B',
  Science: '#EC4899',
  Musique: '#EF4444',
  Sport: '#06B6D4',
  Général: '#6366F1',
};

const STATUS_CONFIG: Record<Quiz['status'], { label: string; color: string; icon: string }> = {
  live: { label: 'EN DIRECT', color: '#EF4444', icon: 'radio' },
  upcoming: { label: 'À VENIR', color: '#3B82F6', icon: 'clock' },
  finished: { label: 'TERMINÉ', color: '#6B7280', icon: 'check-circle' },
  waiting: { label: 'DISPONIBLE', color: '#10B981', icon: 'play-circle' },
};

export default function QuizCard({ quiz, onPress }: QuizCardProps) {
  const theme = useAppTheme();
  const topicColor = TOPIC_COLORS[quiz.topic] || TOPIC_COLORS.Général;
  const statusConfig = STATUS_CONFIG[quiz.status];

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {quiz.image && (
        <Image source={{ uri: quiz.image }} style={styles.image} contentFit="cover" />
      )}
      
      <LinearGradient
        colors={[topicColor, topicColor + '80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
            <MaterialCommunityIcons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {quiz.title}
          </Text>

          {/* Info */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="account-group" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.infoText}>{quiz.participants} participants</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="lightning-bolt" size={14} color="#FFD700" />
              <Text style={[styles.infoText, { color: '#FFD700' }]}>{quiz.xpReward} XP</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={[styles.difficultyBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.difficultyText}>{quiz.difficulty}</Text>
            </View>
            <View style={styles.footerRight}>
              <MaterialCommunityIcons name="book-open" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.footerText}>{quiz.questions.length} questions</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  gradient: {
    padding: 20,
    minHeight: 180,
  },
  content: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Nunito_800ExtraBold',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: 'white',
    marginBottom: 12,
    lineHeight: 26,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(255,255,255,0.9)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: 'white',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(255,255,255,0.9)',
  },
});
