import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { BOMI_PROJECTS, MissionProject } from '@/data/bomiData';
import { Image } from 'expo-image';

export default function AllProjectsScreen() {
  const theme = useAppTheme();
  const router = useRouter();

  const ProjectItem = ({ item }: { item: MissionProject }) => {
    const progress = item.currentAmount / item.targetAmount;
    const percent = Math.round(progress * 100);

    return (
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
        <View style={styles.content}>
          <Text style={[styles.category, { color: theme.colors.primary }]}>{item.category}</Text>
          <Text style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={1}>{item.title}</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(percent, 100)}%`, backgroundColor: theme.colors.primary }]} />
            </View>
            <Text style={[styles.percent, { color: theme.colors.outline }]}>{percent}%</Text>
          </View>
          
          <View style={styles.footer}>
            <Text style={[styles.amount, { color: theme.colors.onSurfaceVariant }]}>
              {item.currentAmount.toLocaleString()} / {item.targetAmount.toLocaleString()}
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.btnText}>Soutenir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Tous les Projets</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={BOMI_PROJECTS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ProjectItem item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold' },
  list: { padding: 20, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  category: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 15,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  percent: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  btnText: {
    color: 'white',
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
  },
});
