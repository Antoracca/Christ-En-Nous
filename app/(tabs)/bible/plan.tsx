import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Données fictives pour les plans
const AVAILABLE_PLANS = [
  {
    id: '1',
    title: 'Bible en un an',
    subtitle: 'Lisez toute la Bible en 365 jours',
    days: 365,
    image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=500&q=80',
    color: '#4A90E2',
  },
  {
    id: '2',
    title: 'Nouveau Testament',
    subtitle: 'Découvrez la vie de Jésus et les apôtres',
    days: 90,
    image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=500&q=80',
    color: '#50E3C2',
  },
  {
    id: '3',
    title: 'Psaumes et Proverbes',
    subtitle: 'Sagesse et louange quotidienne',
    days: 30,
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&q=80',
    color: '#F5A623',
  },
];

const MY_ACTIVE_PLAN = {
  id: '1',
  title: 'Bible en un an',
  progress: 12, // %
  currentDay: 45,
  totalDays: 365,
  nextReading: 'Genèse 45-47',
};

export default function BiblePlanScreen() {
  const theme = useAppTheme();
  const router = useRouter();

  const [activePlan, setActivePlan] = useState(MY_ACTIVE_PLAN);

  const renderPlanCard = ({ item }: { item: typeof AVAILABLE_PLANS[0] }) => (
    <TouchableOpacity
      style={[styles.planCard, { backgroundColor: theme.colors.surface }]}
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/bible/plan-details', params: { id: item.id } } as any)}
    >
      <View style={styles.cardImageContainer}>
        {/* Placeholder image si pas de réseau */}
        <View style={[styles.cardImagePlaceholder, { backgroundColor: item.color }]} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.cardGradient}
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.days} jours</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={[styles.cardDesc, { color: theme.colors.onSurface }]}>{item.subtitle}</Text>
        <Feather name="chevron-right" size={20} color={theme.colors.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Mon Plan Actif */}
        {activePlan && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Mon plan en cours</Text>
            <View style={[styles.activePlanCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.activeHeader}>
                <Text style={[styles.activeTitle, { color: theme.colors.onSurface }]}>{activePlan.title}</Text>
                <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Text style={[styles.badgeText, { color: theme.colors.primary }]}>Jour {activePlan.currentDay}</Text>
                </View>
              </View>
              
              <Text style={[styles.nextReading, { color: theme.colors.onSurfaceVariant }]}>
                Lecture du jour : <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{activePlan.nextReading}</Text>
              </Text>

              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { backgroundColor: theme.colors.primary, width: `${activePlan.progress}%` }
                    ]} 
                  />
                </View>
                <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
                  {activePlan.progress}% terminé
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.continueButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/bible/reader')}
              >
                <Text style={styles.continueButtonText}>Continuer la lecture</Text>
                <Feather name="book-open" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bibliothèque */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Découvrir des plans</Text>
          <FlatList
            data={AVAILABLE_PLANS}
            renderItem={renderPlanCard}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            snapToInterval={width * 0.75 + 16}
            decelerationRate="fast"
          />
        </View>

        {/* Catégories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Par thèmes</Text>
          <View style={styles.categoriesGrid}>
            {['Évangiles', 'Sagesse', 'Prophètes', 'Paul', 'Débutant', 'Jeunesse'].map((cat, i) => (
              <TouchableOpacity 
                key={i} 
                style={[styles.categoryPill, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
              >
                <Text style={[styles.categoryText, { color: theme.colors.onSurface }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    marginLeft: 20,
    marginBottom: 16,
  },
  
  // Active Plan
  activePlanCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  nextReading: {
    fontSize: 14,
    marginBottom: 16,
    fontFamily: 'Nunito_600SemiBold',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
    fontFamily: 'Nunito_600SemiBold',
  },
  continueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },

  // Plan Cards
  listContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  planCard: {
    width: width * 0.75,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 8, // pour l'ombre
  },
  cardImageContainer: {
    height: 140,
    position: 'relative',
  },
  cardImagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },
  cardFooter: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDesc: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    flex: 1,
    marginRight: 8,
  },

  // Categories
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
  },
});