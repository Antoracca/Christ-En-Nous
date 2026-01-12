import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';
import type { Course } from '@/app/data/coursesData';

const { width } = Dimensions.get('window');

interface ClassroomViewProps {
  course: Course;
  onBack: () => void;
}

type Tab = 'lesson' | 'resources' | 'homework' | 'quiz';

export default function ClassroomView({ course, onBack }: ClassroomViewProps) {
  const theme = useAppTheme();
  const [activeTab, setActiveTab] = useState<Tab>('lesson');

  const renderTabButton = (id: Tab, label: string, icon: any) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === id && { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary }
      ]}
      onPress={() => setActiveTab(id)}
    >
      <Feather 
        name={icon} 
        size={16} 
        color={activeTab === id ? theme.colors.primary : theme.colors.onSurfaceVariant} 
      />
      <Text style={[
        styles.tabText, 
        { color: activeTab === id ? theme.colors.primary : theme.colors.onSurfaceVariant }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* Video Player Placeholder */}
      <View style={styles.videoContainer}>
        <Image source={{ uri: course.image }} style={styles.videoThumbnail} blurRadius={5} />
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.playButton}>
            <Feather name="play" size={32} color="white" />
          </TouchableOpacity>
          <Text style={styles.previewText}>Aperçu du cours</Text>
        </View>
        
        {/* Back Button Overlay */}
        <TouchableOpacity style={styles.videoBackButton} onPress={onBack}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Course Info Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>{course.title}</Text>
        <View style={styles.instructorRow}>
          <Image 
            source={{ uri: 'https://i.pravatar.cc/100?img=33' }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={[styles.instructorName, { color: theme.colors.onSurface }]}>{course.instructor}</Text>
            <Text style={[styles.instructorRole, { color: theme.colors.onSurfaceVariant }]}>Instructeur</Text>
          </View>
          <View style={{ flex: 1 }} />
          <View style={[styles.levelBadge, { borderColor: theme.colors.outline }]}>
            <Text style={[styles.levelText, { color: theme.colors.onSurface }]}>{course.level}</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: theme.colors.outline }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          {renderTabButton('lesson', 'Leçon', 'book-open')}
          {renderTabButton('resources', 'Ressources', 'download')}
          {renderTabButton('homework', 'Devoirs', 'edit-3')}
          {renderTabButton('quiz', 'Quiz', 'check-circle')}
        </ScrollView>
      </View>

      {/* Content Area */}
      <ScrollView contentContainerStyle={styles.content}>
        
        {activeTab === 'lesson' && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>À propos de ce cours</Text>
            <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              {course.description}
            </Text>
            
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 24 }]}>Programme</Text>
            {course.modules.length > 0 ? (
              course.modules.map((mod, index) => (
                <TouchableOpacity key={mod.id} style={[styles.moduleItem, { backgroundColor: theme.colors.surface }]}>
                  <View style={[styles.moduleIndex, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Text style={[styles.moduleIndexText, { color: theme.colors.primary }]}>{index + 1}</Text>
                  </View>
                  <View style={styles.moduleInfo}>
                    <Text style={[styles.moduleTitle, { color: theme.colors.onSurface }]}>{mod.title}</Text>
                    <Text style={[styles.moduleMeta, { color: theme.colors.onSurfaceVariant }]}>{mod.type} • {mod.duration}</Text>
                  </View>
                  <Feather name={mod.isCompleted ? "check-circle" : "lock"} size={20} color={mod.isCompleted ? theme.colors.primary : theme.colors.outline} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Feather name="clock" size={40} color={theme.colors.outline} />
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>Les modules seront bientôt disponibles.</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'resources' && (
          <View style={styles.tabPlaceholder}>
            <MaterialCommunityIcons name="file-pdf-box" size={60} color={theme.colors.error} />
            <Text style={[styles.tabTitle, { color: theme.colors.onSurface }]}>Supports de cours</Text>
            <Text style={[styles.tabDesc, { color: theme.colors.onSurfaceVariant }]}>Téléchargez les PDF et notes de l'enseignant ici.</Text>
          </View>
        )}

        {activeTab === 'homework' && (
          <View style={styles.tabPlaceholder}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={60} color={theme.colors.primary} />
            <Text style={[styles.tabTitle, { color: theme.colors.onSurface }]}>Devoirs & Travaux</Text>
            <Text style={[styles.tabDesc, { color: theme.colors.onSurfaceVariant }]}>Espace pour soumettre vos devoirs écrits.</Text>
          </View>
        )}

        {activeTab === 'quiz' && (
          <View style={styles.tabPlaceholder}>
            <MaterialCommunityIcons name="brain" size={60} color="#F59E0B" />
            <Text style={[styles.tabTitle, { color: theme.colors.onSurface }]}>Examen final</Text>
            <Text style={[styles.tabDesc, { color: theme.colors.onSurfaceVariant }]}>Validez vos acquis pour obtenir votre certificat.</Text>
          </View>
        )}

      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline }]}>
        <TouchableOpacity style={[styles.enrollButton, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.enrollText}>Commencer la formation</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  videoContainer: {
    height: 220,
    backgroundColor: 'black',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    marginBottom: 8,
  },
  previewText: {
    color: 'white',
    fontFamily: 'Nunito_700Bold',
  },
  videoBackButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 12,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  instructorName: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
  instructorRole: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
  },
  levelBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    textTransform: 'uppercase',
  },

  tabsContainer: {
    borderBottomWidth: 1,
  },
  tabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
  },

  content: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 24,
  },
  
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  moduleIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleIndexText: {
    fontFamily: 'Nunito_700Bold',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
  },
  moduleMeta: {
    fontSize: 12,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    fontFamily: 'Nunito_400Regular',
  },

  tabPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  tabTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    marginTop: 16,
    marginBottom: 4,
  },
  tabDesc: {
    textAlign: 'center',
    fontFamily: 'Nunito_400Regular',
    maxWidth: 250,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  enrollButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  enrollText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
});
