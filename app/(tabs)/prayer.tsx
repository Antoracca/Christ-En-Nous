import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { MOCK_PRAYERS, type PrayerRequest } from '../data/prayerData';

export default function PrayerScreen() {
  const theme = useAppTheme();
  const [activeTab, setActiveTab] = useState<'my' | 'community'>('community');
  const [prayers, setPrayers] = useState(MOCK_PRAYERS);

  const handleIntercede = (id: string) => {
    setPrayers(prev => prev.map(p => 
      p.id === id ? { ...p, intercessionCount: p.intercessionCount + 1 } : p
    ));
    Alert.alert('Amen !', 'Votre intercession a été enregistrée. Dieu vous bénisse.');
  };

  const renderPrayerCard = ({ item }: { item: PrayerRequest }) => (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline + '20' }]}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{item.user[0]}</Text>
          </View>
          <View>
            <Text style={[styles.userName, { color: theme.colors.onSurface }]}>{item.user}</Text>
            <Text style={[styles.timestamp, { color: theme.colors.onSurfaceVariant }]}>{item.timestamp}</Text>
          </View>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: item.isAnswered ? '#10B98120' : theme.colors.secondary + '20' }]}>
          <Text style={[styles.categoryText, { color: item.isAnswered ? '#10B981' : theme.colors.secondary }]}>
            {item.isAnswered ? 'Exaucé ✨' : item.category}
          </Text>
        </View>
      </View>

      <Text style={[styles.prayerTitle, { color: theme.colors.onSurface }]}>{item.title}</Text>
      <Text style={[styles.prayerContent, { color: theme.colors.onSurfaceVariant }]}>{item.content}</Text>

      <View style={[styles.cardFooter, { borderTopColor: theme.colors.outline + '10' }]}>
        <View style={styles.footerInfo}>
          <MaterialCommunityIcons name="hands-pray" size={16} color={theme.colors.primary} />
          <Text style={[styles.intercessionCount, { color: theme.colors.onSurfaceVariant }]}>
            {item.intercessionCount} intercesseurs
          </Text>
        </View>
        
        {!item.isAnswered && (
          <TouchableOpacity 
            style={[styles.prayButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => handleIntercede(item.id)}
          >
            <Text style={styles.prayButtonText}>Je prie</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Mur de Prière</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Feather name="search" size={24} color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Hero Banner - Action de grâce */}
      <View style={{ paddingHorizontal: 20 }}>
        <LinearGradient
          colors={[theme.colors.primary, '#4F46E5']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>&quot;Demandez et vous recevrez&quot;</Text>
            <Text style={styles.heroSubtitle}>Déposez vos fardeaux et portez ceux de vos frères.</Text>
          </View>
          <MaterialCommunityIcons name="hands-pray" size={60} color="rgba(255,255,255,0.3)" />
        </LinearGradient>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'community' && { borderBottomColor: theme.colors.primary }]}
          onPress={() => setActiveTab('community')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'community' ? theme.colors.primary : theme.colors.onSurfaceVariant }]}>
            Communauté
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'my' && { borderBottomColor: theme.colors.primary }]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'my' ? theme.colors.primary : theme.colors.onSurfaceVariant }]}>
            Mes Prières
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'community' ? (
        <FlatList
          data={prayers}
          renderItem={renderPrayerCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="notebook-edit-outline" size={64} color={theme.colors.outline} />
          <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>Votre journal de prière</Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Vos requêtes privées et publiques apparaîtront ici.
          </Text>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.addBtnText}>Déposer un sujet</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.colors.secondary }]}
        onPress={() => Alert.alert('Nouveau sujet', 'Formulaire d\'ajout de prière à venir.')}
      >
        <Feather name="plus" size={28} color="white" />
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
  },
  searchButton: {
    padding: 8,
  },
  hero: {
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userName: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
  },
  prayerTitle: {
    fontSize: 17,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 6,
  },
  prayerContent: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  intercessionCount: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },
  prayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  prayButtonText: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  addBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addBtnText: {
    color: 'white',
    fontFamily: 'Nunito_700Bold',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
