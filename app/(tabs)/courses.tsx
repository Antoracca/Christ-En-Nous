import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  LayoutAnimation,
  TouchableOpacity
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';

// Data & Components
import { COURSES_DATA, type Course, type CourseCategory } from '../data/coursesData';
import CourseCard from '../components/courses/CourseCard';
import CategoryHeader from '../components/courses/CategoryHeader';
import ClassroomView from '../components/courses/ClassroomView';

const { width } = Dimensions.get('window');

type ViewState = 'home' | 'classroom' | 'category';

export default function CoursesScreen() {
  const theme = useAppTheme();
  
  // Navigation State
  const [viewState, setViewState] = useState<ViewState>('home');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | null>(null);

  // Handlers
  const openClassroom = (course: Course) => {
    setSelectedCourse(course);
    setViewState('classroom');
  };

  const openCategory = (category: CourseCategory) => {
    setSelectedCategory(category);
    setViewState('category');
  };

  const goBack = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (viewState === 'classroom') {
      setSelectedCourse(null);
      // Si on venait d'une catégorie, on y retourne, sinon home
      setViewState(selectedCategory ? 'category' : 'home');
    } else {
      setSelectedCategory(null);
      setViewState('home');
    }
  };

  // --- RENDERERS ---

  if (viewState === 'classroom' && selectedCourse) {
    return <ClassroomView course={selectedCourse} onBack={goBack} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      
      {/* Header Principal */}
      <View style={[styles.header, { borderBottomColor: theme.colors.outline }]}>
        {viewState === 'category' ? (
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="school" size={28} color={theme.colors.primary} />
          </View>
        )}
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            {viewState === 'category' ? selectedCategory?.title : 'Christ Academy'}
          </Text>
          {viewState === 'home' && (
            <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Formation & Équipement
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.profileButton}>
          <Feather name="user" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* VUE: HOME (DASHBOARD) */}
        {viewState === 'home' && (
          <>
            {/* Hero Section */}
            <LinearGradient
              colors={[theme.colors.primary, '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <View>
                <Text style={styles.heroTitle}>Espace Étudiant</Text>
                <Text style={styles.heroText}>Continuez votre formation là où vous l&apos;avez laissée.</Text>
                <TouchableOpacity style={styles.resumeButton}>
                  <Text style={styles.resumeText}>Reprendre &quot;Vie de Prière&quot;</Text>
                  <Feather name="play-circle" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Liste des Catégories */}
            {COURSES_DATA.map((category) => (
              <View key={category.id} style={styles.categorySection}>
                <CategoryHeader
                  title={category.title}
                  subtitle={category.description}
                  icon={category.icon}
                  color={category.color}
                  onPressAll={() => openCategory(category)}
                />
                
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                >
                  {category.courses.slice(0, 3).map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onPress={() => openClassroom(course)}
                    />
                  ))}
                  {category.courses.length > 3 && (
                    <TouchableOpacity 
                      style={[styles.seeMoreCard, { backgroundColor: theme.colors.surface }]}
                      onPress={() => openCategory(category)}
                    >
                      <Feather name="arrow-right" size={24} color={theme.colors.primary} />
                      <Text style={[styles.seeMoreText, { color: theme.colors.primary }]}>Voir tout</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            ))}
          </>
        )}

        {/* VUE: CATEGORY DETAIL */}
        {viewState === 'category' && selectedCategory && (
          <View style={styles.gridContainer}>
            <Text style={[styles.categoryDesc, { color: theme.colors.onSurfaceVariant }]}>
              {selectedCategory.description}
            </Text>
            
            {selectedCategory.courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onPress={() => openClassroom(course)}
                width={width - 40} // Full width
              />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  logoContainer: {
    marginRight: 12,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },
  profileButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  
  // Hero
  hero: {
    margin: 20,
    padding: 24,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  heroTitle: {
    color: 'white',
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 8,
  },
  heroText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 16,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  resumeText: {
    color: '#4F46E5', // Primary
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
  },

  // Lists
  categorySection: {
    marginBottom: 8,
  },
  horizontalList: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  seeMoreCard: {
    width: 140,
    height: 140, // Match CourseCard height roughly
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  seeMoreText: {
    marginTop: 8,
    fontFamily: 'Nunito_700Bold',
  },

  // Grid
  gridContainer: {
    padding: 20,
  },
  categoryDesc: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 20,
    lineHeight: 24,
  },
});