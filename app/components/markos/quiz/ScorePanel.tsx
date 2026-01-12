// Panneau de score avec XP, combo, et classement
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAppTheme } from '@/hooks/useAppTheme';
import { QuizParticipant } from '@/data/quizData';

interface ScorePanelProps {
  score: number;
  xpEarned: number;
  combo: number;
  maxCombo: number;
  leaderboard: QuizParticipant[];
  currentUserId: string;
}

export default function ScorePanel({
  score,
  xpEarned,
  combo,
  maxCombo,
  leaderboard,
  currentUserId,
}: ScorePanelProps) {
  const theme = useAppTheme();
  const userRank = leaderboard.findIndex(p => p.id === currentUserId) + 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Stats principales */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.primary + '15' }]}>
          <MaterialCommunityIcons name="trophy" size={24} color={theme.colors.primary} />
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>{score}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Score</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FFD700' + '15' }]}>
          <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FFD700" />
          <Text style={[styles.statValue, { color: '#FFD700' }]}>{xpEarned}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>XP</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#EC4899' + '15' }]}>
          <MaterialCommunityIcons name="fire" size={24} color="#EC4899" />
          <Text style={[styles.statValue, { color: '#EC4899' }]}>
            {combo > 0 ? `${combo}x` : '0'}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Combo</Text>
        </View>
      </View>

      {/* Combo max */}
      {maxCombo > 0 && (
        <View style={[styles.comboBadge, { backgroundColor: '#EC4899' + '20' }]}>
          <MaterialCommunityIcons name="fire" size={16} color="#EC4899" />
          <Text style={[styles.comboText, { color: '#EC4899' }]}>
            Combo max : {maxCombo}x
          </Text>
        </View>
      )}

      {/* Classement */}
      {leaderboard.length > 0 && (
        <View style={styles.leaderboard}>
          <Text style={[styles.leaderboardTitle, { color: theme.colors.onSurface }]}>
            Classement
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {leaderboard.slice(0, 5).map((participant, index) => {
              const isCurrentUser = participant.id === currentUserId;
              return (
                <View
                  key={participant.id}
                  style={[
                    styles.leaderItem,
                    isCurrentUser && { backgroundColor: theme.colors.primary + '15' },
                  ]}
                >
                  <View style={styles.rankContainer}>
                    {index === 0 && (
                      <MaterialCommunityIcons name="trophy" size={16} color="#FFD700" />
                    )}
                    <Text style={[styles.rank, { color: theme.colors.onSurfaceVariant }]}>
                      #{index + 1}
                    </Text>
                  </View>
                  <Image source={{ uri: participant.avatar }} style={styles.leaderAvatar} contentFit="cover" />
                  <Text style={[styles.leaderName, { color: theme.colors.onSurface }]} numberOfLines={1}>
                    {participant.name}
                  </Text>
                  <Text style={[styles.leaderScore, { color: theme.colors.primary }]}>
                    {participant.score}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    marginTop: 2,
  },
  comboBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
    gap: 6,
    marginBottom: 12,
  },
  comboText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  leaderboard: {
    marginTop: 8,
  },
  leaderboardTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 12,
  },
  leaderItem: {
    alignItems: 'center',
    marginRight: 12,
    padding: 8,
    borderRadius: 12,
    minWidth: 80,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  rank: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
  },
  leaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: '#EC4899',
  },
  leaderName: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 2,
    textAlign: 'center',
  },
  leaderScore: {
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
  },
});
