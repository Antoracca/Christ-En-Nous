// Écran principal des Jeux & Quiz
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StatusBar,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AVAILABLE_QUIZZES, Quiz, QuizTopic } from '@/data/quizData';
import QuizCard from '@/components/markos/quiz/QuizCard';
import SectionHeader from '@/components/markos/SectionHeader';

export default function MarkosGamesScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<QuizTopic | 'all'>('all');

  const filteredQuizzes = filter === 'all'
    ? AVAILABLE_QUIZZES
    : AVAILABLE_QUIZZES.filter(q => q.topic === filter);

  const liveQuiz = AVAILABLE_QUIZZES.find(q => q.status === 'live');
  const upcomingQuizzes = AVAILABLE_QUIZZES.filter(q => q.status === 'upcoming');
  const availableQuizzes = AVAILABLE_QUIZZES.filter(q => q.status === 'waiting');

  const topics: (QuizTopic | 'all')[] = ['all', 'Bible', 'Culture', 'Histoire', 'Géographie', 'Science', 'Musique'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Jeux & Quiz</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Gagnez des XP en jouant
          </Text>
        </View>
        <TouchableOpacity style={[styles.xpBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
          <MaterialCommunityIcons name="lightning-bolt" size={18} color="#F59E0B" />
          <Text style={[styles.xpText, { color: theme.colors.onSurface }]}>1250 XP</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Live Quiz Banner */}
        {liveQuiz && (
          <View style={styles.section}>
            <SectionHeader
              title="Quiz en Direct"
              icon="radio"
              color="#EF4444"
            />
            <QuizCard quiz={liveQuiz} onPress={() => router.push(`/(tabs)/markos/games/quiz/${liveQuiz.id}`)} />
          </View>
        )}

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {topics.map((topic) => (
              <TouchableOpacity
                key={topic}
                style={[
                  styles.filterChip,
                  filter === topic && { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary },
                  { borderColor: theme.colors.outline + '40' },
                ]}
                onPress={() => setFilter(topic)}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: filter === topic ? theme.colors.primary : theme.colors.onSurfaceVariant },
                  ]}
                >
                  {topic === 'all' ? 'Tous' : topic}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Quizzes */}
        {upcomingQuizzes.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="À Venir"
              icon="clock"
              color="#3B82F6"
            />
            <FlatList
              data={upcomingQuizzes}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={{ width: 300, marginRight: 16 }}>
                  <QuizCard quiz={item} onPress={() => router.push(`/(tabs)/markos/games/quiz/${item.id}`)} />
                </View>
              )}
            />
          </View>
        )}

        {/* Available Quizzes */}
        <View style={styles.section}>
          <SectionHeader
            title="Quiz Disponibles"
            icon="play-circle"
            color="#10B981"
          />
          {filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onPress={() => router.push(`/(tabs)/markos/games/quiz/${quiz.id}`)} />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    marginTop: 2,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  xpText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  scrollContent: {
    paddingTop: 10,
  },
  section: {
    marginBottom: 25,
  },
  filtersContainer: {
    marginBottom: 20,
    paddingVertical: 10,
  },
  filters: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
});
