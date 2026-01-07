import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const COURSES = [
  {
    id: '1',
    title: 'Introduction à la Bible',
    lessons: 12,
    completed: 4,
    icon: 'book-open-variant',
    color: '#6366F1'
  },
  {
    id: '2',
    title: 'La Vie de Jésus',
    lessons: 24,
    completed: 0,
    icon: 'heart-outline',
    color: '#EC4899'
  },
  {
    id: '3',
    title: 'Les Prophètes',
    lessons: 15,
    completed: 0,
    icon: 'fire',
    color: '#F59E0B'
  },
  {
    id: '4',
    title: 'Histoire de l\'Église',
    lessons: 10,
    completed: 0,
    icon: 'church',
    color: '#10B981'
  }
];

export default function BibleLearningScreen() {
  const theme = useAppTheme();
  const router = useRouter();

  const renderCourseItem = ({ item }: { item: typeof COURSES[0] }) => {
    const progress = item.lessons > 0 ? (item.completed / item.lessons) : 0;
    
    return (
      <TouchableOpacity 
        style={[styles.courseCard, { backgroundColor: theme.colors.surface }]} 
        onPress={() => {}}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
        </View>
        
        <View style={styles.courseInfo}>
          <Text style={[styles.courseTitle, { color: theme.colors.onSurface }]}>{item.title}</Text>
          <Text style={[styles.courseMeta, { color: theme.colors.onSurfaceVariant }]}>
            {item.lessons} leçons • {item.completed} terminées
          </Text>
          
          <View style={styles.progressRow}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View style={[styles.progressFill, { backgroundColor: item.color, width: `${progress * 100}%` }]} />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        </View>
        
        <Feather name="chevron-right" size={20} color={theme.colors.outline} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Résumé de progression */}
        <LinearGradient
          colors={[theme.colors.primary, '#4F46E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View>
            <Text style={styles.heroLabel}>Votre Progression</Text>
            <Text style={styles.heroValue}>Niveau 4</Text>
            <Text style={styles.heroSub}>1,250 XP • 12 leçons finies</Text>
          </View>
          <View style={styles.heroIconCircle}>
            <MaterialCommunityIcons name="star" size={40} color="white" />
          </View>
        </LinearGradient>

        {/* Quiz du jour */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Quiz du jour</Text>
          <TouchableOpacity style={[styles.quizCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.quizContent}>
              <Text style={[styles.quizTitle, { color: theme.colors.onSurface }]}>Testez vos connaissances !</Text>
              <Text style={[styles.quizDesc, { color: theme.colors.onSurfaceVariant }]}>
                Répondez à 5 questions sur l'Ancien Testament.
              </Text>
              <View style={[styles.quizBadge, { backgroundColor: theme.colors.secondary }]}>
                <Text style={styles.quizBadgeText}>+50 XP</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="comment-question-outline" size={60} color={theme.colors.secondary + '40'} />
          </TouchableOpacity>
        </View>

        {/* Mes Cours */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Mes Cours</Text>
            <TouchableOpacity><Text style={{ color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }}>Tout voir</Text></TouchableOpacity>
          </View>
          
          <FlatList
            data={COURSES}
            renderItem={renderCourseItem}
            keyExtractor={item => item.id}
            scrollEnabled={false} // On laisse le ScrollView parent gérer
          />
        </View>

        {/* "Le saviez-vous ?" */}
        <View style={[styles.factCard, { backgroundColor: theme.colors.primary + '10' }]}>
          <Feather name="info" size={20} color={theme.colors.primary} />
          <Text style={[styles.factText, { color: theme.colors.onSurface }]}>
            <Text style={{ fontWeight: 'bold' }}>Le saviez-vous ?</Text> La Bible est le livre le plus traduit au monde, disponible en plus de 3 000 langues.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Hero Card
  heroCard: {
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    textTransform: 'uppercase',
  },
  heroValue: {
    color: 'white',
    fontSize: 32,
    fontFamily: 'Nunito_800ExtraBold',
  },
  heroSub: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    marginTop: 4,
  },
  heroIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
  },

  // Quiz Card
  quizCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  quizContent: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 4,
  },
  quizDesc: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 12,
  },
  quizBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  quizBadgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
  },

  // Course Items
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 2,
  },
  courseMeta: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    width: 30,
  },

  // Fact Card
  factCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    alignItems: 'center',
  },
  factText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Nunito_400Regular',
  }
});
