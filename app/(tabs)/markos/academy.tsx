import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MARKOS_ACADEMY, AcademyRequest } from '@/data/markosData';
import CreatePostModal from '@/components/markos/CreatePostModal';

export default function MarkosAcademyScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'demande' | 'offre'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [posts, setPosts] = useState(MARKOS_ACADEMY);

  const handleCreatePost = (newPost: any) => {
    const post: AcademyRequest = {
      id: Date.now().toString(),
      studentName: 'Moi',
      type: newPost.type,
      subject: newPost.subject,
      level: newPost.level,
      description: newPost.description,
      status: 'open',
      tags: [],
      responses: 0,
      isUrgent: newPost.isUrgent,
      postedAt: 'À l\'instant'
    };
    setPosts([post, ...posts]);
  };

  const filteredData = posts.filter(item => {
    const matchesType = filter === 'all' || item.type === filter;
    const matchesSearch = item.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const renderItem = ({ item }: { item: AcademyRequest }) => (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      
      {/* Header Card: User Info & Time */}
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: item.isVerified ? '#D1FAE5' : '#F3F4F6' }]}>
            <Text style={[styles.avatarText, { color: item.isVerified ? '#059669' : '#4B5563' }]}>
              {item.studentName.charAt(0)}
            </Text>
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.userName, { color: theme.colors.onSurface }]}>{item.studentName}</Text>
              {item.isVerified && <MaterialCommunityIcons name="check-decagram" size={14} color="#10B981" />}
            </View>
            <Text style={[styles.timeText, { color: theme.colors.outline }]}>{item.postedAt}</Text>
          </View>
        </View>
        
        {item.isUrgent && (
          <View style={styles.urgentBadge}>
            <Feather name="alert-circle" size={12} color="#EF4444" />
            <Text style={styles.urgentText}>URGENT</Text>
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.cardContent}>
        <View style={styles.titleRow}>
          <Text style={[styles.subjectText, { color: theme.colors.onSurface }]}>{item.subject}</Text>
          <View style={[styles.typeTag, { backgroundColor: item.type === 'demande' ? '#FEE2E2' : '#E0F2FE' }]}>
             <Text style={[styles.typeTagText, { color: item.type === 'demande' ? '#EF4444' : '#0284C7' }]}>
               {item.type === 'demande' ? 'Demande' : 'Offre'}
             </Text>
          </View>
        </View>
        
        <Text style={[styles.levelText, { color: theme.colors.primary }]}>{item.level}</Text>
        <Text style={[styles.descText, { color: theme.colors.onSurfaceVariant }]}>{item.description}</Text>
        
        {/* Tags */}
        <View style={styles.tagsContainer}>
          {item.tags?.map((tag, index) => (
            <Text key={index} style={[styles.tag, { color: theme.colors.outline }]}>{tag}</Text>
          ))}
        </View>
      </View>
      
      {/* Footer Actions */}
      <View style={[styles.cardFooter, { borderTopColor: theme.colors.outline + '15' }]}>
        <View style={styles.statsRow}>
          <Feather name="message-square" size={16} color={theme.colors.outline} />
          <Text style={[styles.statsText, { color: theme.colors.outline }]}>{item.responses} réponses</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.contactButton, { backgroundColor: theme.colors.background }]}
          onPress={() => router.push({ pathname: '/(tabs)/markos/dm', params: { id: item.id } })}
        >
          <Text style={[styles.contactButtonText, { color: theme.colors.onSurface }]}>Répondre</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Markos Academy</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Feather name="sliders" size={20} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>

        {/* Hero / Mentorat Section */}
        <LinearGradient
          colors={['#4F46E5', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Devenez un Mentor !</Text>
            <Text style={styles.heroSubtitle}>Partagez vos connaissances et gagnez des points XP en aidant la communauté.</Text>
            <TouchableOpacity style={styles.heroButton}>
              <Text style={styles.heroButtonText}>En savoir plus</Text>
            </TouchableOpacity>
          </View>
          <MaterialCommunityIcons name="school" size={80} color="rgba(255,255,255,0.2)" style={styles.heroIcon} />
        </LinearGradient>

        {/* Search & Filters */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.colors.background }]}>
            <Feather name="search" size={18} color={theme.colors.onSurfaceVariant} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.onSurface }]}
              placeholder="Maths, Philo, Anglais..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.tabsContainer}>
          {['all', 'demande', 'offre'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                filter === tab && { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary }
              ]}
              onPress={() => setFilter(tab as any)}
            >
              <Text style={[
                styles.tabText,
                { color: filter === tab ? theme.colors.primary : theme.colors.onSurfaceVariant }
              ]}>
                {tab === 'all' ? 'Tout' : tab === 'demande' ? 'Demandes' : 'Offres'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content List */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Feather name="plus" size={24} color="white" />
        <Text style={styles.fabText}>Poster une annonce</Text>
      </TouchableOpacity>

      {/* Create Post Modal */}
      <CreatePostModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreatePost}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold' },
  filterButton: { padding: 4 },
  
  heroCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: { flex: 1, paddingRight: 40 },
  heroTitle: { color: 'white', fontSize: 18, fontFamily: 'Nunito_800ExtraBold', marginBottom: 4 },
  heroSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontFamily: 'Nunito_600SemiBold', marginBottom: 12 },
  heroButton: { backgroundColor: 'white', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  heroButtonText: { color: '#4F46E5', fontSize: 12, fontFamily: 'Nunito_700Bold' },
  heroIcon: { position: 'absolute', right: -10, bottom: -10 },

  searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontFamily: 'Nunito_400Regular', fontSize: 15 },

  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: { fontSize: 13, fontFamily: 'Nunito_700Bold', textTransform: 'capitalize' },

  listContent: { padding: 20, paddingBottom: 100 },
  
  // New Card Style
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
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
  userInfo: { flexDirection: 'row', gap: 10 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  userName: { fontSize: 14, fontFamily: 'Nunito_700Bold' },
  timeText: { fontSize: 11, fontFamily: 'Nunito_400Regular' },
  urgentBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' },
  urgentText: { color: '#EF4444', fontSize: 10, fontFamily: 'Nunito_800ExtraBold' },
  
  cardContent: { marginBottom: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  subjectText: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', flex: 1, marginRight: 8 },
  typeTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeTagText: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', textTransform: 'uppercase' },
  levelText: { fontSize: 12, fontFamily: 'Nunito_700Bold', marginBottom: 8 },
  descText: { fontSize: 14, fontFamily: 'Nunito_400Regular', lineHeight: 20, marginBottom: 12 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', fontStyle: 'italic' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statsText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold' },
  contactButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  contactButtonText: { fontSize: 13, fontFamily: 'Nunito_700Bold' },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 32,
    elevation: 6,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    gap: 8,
  },
  fabText: { color: 'white', fontSize: 16, fontFamily: 'Nunito_800ExtraBold' },
});
