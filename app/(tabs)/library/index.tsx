// Écran principal de la Bibliothèque et Archives
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StatusBar,
  TextInput,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import {
  LIBRARY_MEDIA,
  MEDIA_CATEGORIES,
  MEDIA_TYPES,
  MediaItem,
  MediaType,
  MediaCategory,
  SUBSCRIPTION_BUNDLES,
  SubscriptionBundle,
} from '@/data/libraryData';
import SectionHeader from '@/components/markos/SectionHeader';
import SubscriptionModal from '@/components/library/SubscriptionModal';

export default function LibraryScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'all'>('all');
  const [selectedType, setSelectedType] = useState<MediaType | 'all'>('all');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Filtrage des médias
  const filteredMedia = useMemo(() => {
    return LIBRARY_MEDIA.filter((item) => {
      const matchesSearch = searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesType = selectedType === 'all' || item.type === selectedType;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [searchQuery, selectedCategory, selectedType]);

  // Médias recommandés (Pour vous)
  const recommendedMedia = useMemo(() => {
    return LIBRARY_MEDIA.filter(item => item.isFeatured || item.isNew).slice(0, 6);
  }, []);

  // Médias gratuits
  const freeMedia = useMemo(() => {
    return LIBRARY_MEDIA.filter(item => item.accessType === 'free').slice(0, 6);
  }, []);

  // Médias premium
  const premiumMedia = useMemo(() => {
    return LIBRARY_MEDIA.filter(item => item.accessType === 'premium' || item.accessType === 'subscription').slice(0, 6);
  }, []);

  const handleMediaPress = (media: MediaItem) => {
    if (media.accessType === 'premium' || media.accessType === 'subscription') {
      setShowSubscriptionModal(true);
    } else if (media.accessType === 'purchase') {
      router.push(`/(tabs)/library/media/${media.id}`);
    } else {
      router.push(`/(tabs)/library/media/${media.id}`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Bibliothèque & Archives</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Enseignements, Livres, Podcasts et plus
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.subscriptionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowSubscriptionModal(true)}
        >
          <MaterialCommunityIcons name="crown" size={18} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
          <Feather name="search" size={18} color={theme.colors.onSurfaceVariant} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.onSurface }]}
            placeholder="Rechercher un livre, podcast, vidéo..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={18} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories Filter */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {MEDIA_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.filterChip,
                  selectedCategory === category.id && {
                    backgroundColor: category.color + '15',
                    borderColor: category.color,
                  },
                  { borderColor: theme.colors.outline + '40' },
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <MaterialCommunityIcons name={category.icon as any} size={14} color={selectedCategory === category.id ? category.color : theme.colors.onSurfaceVariant} />
                <Text
                  style={[
                    styles.filterText,
                    { color: selectedCategory === category.id ? category.color : theme.colors.onSurfaceVariant },
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Type Filter */}
        <View style={styles.typeFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeFilters}>
            {MEDIA_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeChip,
                  selectedType === type.id && {
                    backgroundColor: theme.colors.primary + '15',
                    borderColor: theme.colors.primary,
                  },
                  { borderColor: theme.colors.outline + '40' },
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Feather name={type.icon as any} size={14} color={selectedType === type.id ? theme.colors.primary : theme.colors.onSurfaceVariant} />
                <Text
                  style={[
                    styles.typeText,
                    { color: selectedType === type.id ? theme.colors.primary : theme.colors.onSurfaceVariant },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Pour Vous (Recommandations) */}
        {recommendedMedia.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Pour Vous"
              icon="star"
              color="#FFD700"
            />
            <FlatList
              data={recommendedMedia}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MediaCard media={item} onPress={() => handleMediaPress(item)} />
              )}
            />
          </View>
        )}

        {/* Gratuit */}
        {freeMedia.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Accès Gratuit"
              icon="gift"
              color="#10B981"
            />
            <FlatList
              data={freeMedia}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MediaCard media={item} onPress={() => handleMediaPress(item)} />
              )}
            />
          </View>
        )}

        {/* Premium */}
        {premiumMedia.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Contenus Premium"
              icon="crown"
              color="#8B5CF6"
            />
            <FlatList
              data={premiumMedia}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MediaCard media={item} onPress={() => handleMediaPress(item)} />
              )}
            />
          </View>
        )}

        {/* Tous les Médias */}
        <View style={styles.section}>
          <SectionHeader
            title="Tous les Contenus"
            icon="library"
            color={theme.colors.primary}
          />
          {filteredMedia.map((item) => (
            <MediaCard key={item.id} media={item} onPress={() => handleMediaPress(item)} />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={(bundle: SubscriptionBundle) => {
          // TODO: Implémenter la logique d'abonnement avec Firebase
          console.log('Abonnement:', bundle);
        }}
      />
    </SafeAreaView>
  );
}

// Composant MediaCard
const MediaCard = ({ media, onPress }: { media: MediaItem; onPress: () => void }) => {
  const theme = useAppTheme();
  const getTypeIcon = () => {
    switch (media.type) {
      case 'podcast': return 'microphone';
      case 'book': return 'book';
      case 'video': return 'video';
      case 'audio': return 'headphones';
      case 'text': return 'file-text';
      case 'reference': return 'bookmark';
      default: return 'file';
    }
  };

  const getAccessBadge = () => {
    switch (media.accessType) {
      case 'free':
        return { label: 'GRATUIT', color: '#10B981' };
      case 'premium':
        return { label: 'PREMIUM', color: '#8B5CF6' };
      case 'subscription':
        return { label: 'ABONNEMENT', color: '#3B82F6' };
      case 'purchase':
        return { label: `${media.price} FCFA`, color: '#F59E0B' };
      default:
        return null;
    }
  };

  const badge = getAccessBadge();

  return (
    <TouchableOpacity
      style={[styles.mediaCard, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={{ uri: media.thumbnail }} style={styles.mediaThumbnail} contentFit="cover" />
      
      {media.isNew && (
        <View style={[styles.newBadge, { backgroundColor: '#EF4444' }]}>
          <Text style={styles.newBadgeText}>NOUVEAU</Text>
        </View>
      )}
      
      {badge && (
        <View style={[styles.accessBadge, { backgroundColor: badge.color + '20', borderColor: badge.color }]}>
          <Text style={[styles.accessBadgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      )}

      <View style={styles.mediaContent}>
        <View style={styles.mediaHeader}>
          <View style={[styles.typeIcon, { backgroundColor: theme.colors.primary + '15' }]}>
            <Feather name={getTypeIcon() as any} size={14} color={theme.colors.primary} />
          </View>
          <Text style={[styles.mediaCategory, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
            {MEDIA_CATEGORIES.find(c => c.id === media.category)?.label || media.category}
          </Text>
        </View>

        <Text style={[styles.mediaTitle, { color: theme.colors.onSurface }]} numberOfLines={2}>
          {media.title}
        </Text>

        <View style={styles.mediaAuthor}>
          {media.authorAvatar && (
            <Image source={{ uri: media.authorAvatar }} style={styles.authorAvatar} contentFit="cover" />
          )}
          <Text style={[styles.authorName, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
            {media.author}
          </Text>
        </View>

        <View style={styles.mediaStats}>
          <View style={styles.statItem}>
            <Feather name="eye" size={12} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>{media.views}</Text>
          </View>
          <View style={styles.statItem}>
            <Feather name="heart" size={12} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>{media.likes}</Text>
          </View>
          {media.duration && (
            <View style={styles.statItem}>
              <Feather name="clock" size={12} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>{media.duration}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

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
  subscriptionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
  },
  filtersContainer: {
    marginBottom: 16,
    paddingVertical: 10,
  },
  filters: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  typeFiltersContainer: {
    marginBottom: 20,
    paddingVertical: 10,
  },
  typeFilters: {
    paddingHorizontal: 20,
    gap: 10,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  typeText: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
  },
  section: {
    marginBottom: 25,
  },
  horizontalList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  mediaCard: {
    width: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mediaThumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: '#E5E7EB',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 9,
    fontFamily: 'Nunito_800ExtraBold',
  },
  accessBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  accessBadgeText: {
    fontSize: 9,
    fontFamily: 'Nunito_700Bold',
  },
  mediaContent: {
    padding: 12,
  },
  mediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  typeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaCategory: {
    fontSize: 10,
    fontFamily: 'Nunito_600SemiBold',
    flex: 1,
  },
  mediaTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 6,
    lineHeight: 18,
  },
  mediaAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  authorAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  authorName: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    flex: 1,
  },
  mediaStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 10,
    fontFamily: 'Nunito_400Regular',
  },
});
