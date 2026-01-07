import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';

const GROUPS = [
  { id: '1', name: 'Lève-tôt pour Jésus', members: 124, active: true },
  { id: '2', name: 'Mamans en prière', members: 56, active: false },
  { id: '3', name: 'Jeunes Pro', members: 89, active: true },
  { id: '4', name: 'Intercession Mondiale', members: 312, active: true },
];

export default function BibleCommunityScreen() {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: theme.colors.primary + '15' }]}>
          <Feather name="users" size={32} color={theme.colors.primary} />
          <Text style={[styles.heroTitle, { color: theme.colors.onSurface }]}>Prier ensemble</Text>
          <Text style={[styles.heroText, { color: theme.colors.onSurfaceVariant }]}>
            Rejoignez un groupe ou créez le vôtre pour partager des sujets de prière et méditer en communauté.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Groupes actifs</Text>

        {GROUPS.map((group) => (
          <TouchableOpacity 
            key={group.id} 
            style={[styles.groupItem, { backgroundColor: theme.colors.surface }]}
          >
            <View style={[styles.groupIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Feather name="message-circle" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.groupInfo}>
              <Text style={[styles.groupName, { color: theme.colors.onSurface }]}>{group.name}</Text>
              <Text style={[styles.groupMeta, { color: theme.colors.onSurfaceVariant }]}>
                {group.members} membres {group.active && '• En ligne'}
              </Text>
            </View>
            <View style={[styles.joinBtn, { borderColor: theme.colors.primary }]}>
              <Text style={[styles.joinText, { color: theme.colors.primary }]}>Rejoindre</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 20,
  },
  hero: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    marginVertical: 8,
  },
  heroText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 16,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  groupMeta: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    marginTop: 2,
  },
  joinBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  joinText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
});