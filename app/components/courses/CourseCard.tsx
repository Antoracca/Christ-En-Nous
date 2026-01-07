import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';
import type { Course } from '@/app/data/coursesData';

interface CourseCardProps {
  course: Course;
  onPress: () => void;
  width?: number;
}

export default function CourseCard({ course, onPress, width }: CourseCardProps) {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.container,
        { 
          backgroundColor: theme.colors.surface,
          width: width || 280,
          borderColor: theme.colors.outline + '20'
        }
      ]}
    >
      {/* Image Cover */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: course.image }} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.badgeText}>{course.level}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={2}>
          {course.title}
        </Text>
        
        <View style={styles.instructorRow}>
          <Feather name="user" size={14} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.instructor, { color: theme.colors.onSurfaceVariant }]}>
            {course.instructor}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.metaItem}>
            <Feather name="clock" size={14} color={theme.colors.primary} />
            <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              {course.duration}
            </Text>
          </View>
          
          {course.progress > 0 ? (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { backgroundColor: theme.colors.primary, width: `${course.progress}%` }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: theme.colors.primary }]}>
                {course.progress}%
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={[styles.startButton, { borderColor: theme.colors.primary }]}>
              <Text style={[styles.startText, { color: theme.colors.primary }]}>S'inscrire</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginBottom: 8,
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    textTransform: 'uppercase',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 8,
    lineHeight: 22,
    height: 44, // Forcer 2 lignes
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  instructor: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },
  startButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  startText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginLeft: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
  },
});
