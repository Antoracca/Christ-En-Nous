import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { QuizSession } from '@/data/markosData';

export default function LiveQuizCard({ quiz, onPress }: { quiz: QuizSession; onPress: () => void }) {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={['#8B5CF6', '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.liveQuizCard}
      >
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>EN DIRECT</Text>
        </View>
        <View style={styles.quizContent}>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          <Text style={styles.quizTopic}>Thème : {quiz.topic}</Text>
          
          <View style={styles.quizStats}>
            <View style={styles.statItem}>
              <Feather name="users" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>{quiz.participants} Joueurs</Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="award" size={14} color="#FFD700" />
              <Text style={[styles.statText, { color: '#FFD700' }]}>{quiz.xpReward} XP</Text>
            </View>
          </View>
        </View>
        <View style={styles.joinQuizButton}>
          <Text style={styles.joinQuizText}>REJOINDRE</Text>
          <Feather name="arrow-right" size={16} color="#6366F1" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  liveQuizCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Nunito_800ExtraBold',
  },
  quizContent: {
    marginBottom: 15,
  },
  quizTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: 'white',
    marginBottom: 4,
  },
  quizTopic: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
  },
  quizStats: {
    flexDirection: 'row',
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  joinQuizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  joinQuizText: {
    color: '#6366F1',
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
  },
});
