// app/(tabs)/cantiques.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
  RefreshControl,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '@/context/ThemeContext';
import CantiqueCard from '@/components/cantiques/CantiqueCard';
import AudioPlayer from '@/components/cantiques/AudioPlayer';
import JoinMinistryForm from '@/components/cantiques/JoinMinistryForm';
import BottomSheetModal from '@/components/cantiques/BottomSheetModal';
import { useMusic } from '@/context/MusicContext';
import {
  CATEGORIES,
  CANTIQUES_DATA,
  Cantique,
  CantiqueCategory,
} from '@/data/cantiquesData';

const { width } = Dimensions.get('window');

export default function CantiquesScreen() {
  const theme = useAppTheme();
  const { isDarkMode } = useThemeContext();
  const {
    isFavorite,
    toggleFavorite,
    getRecentlyPlayedCantiques,
  } = useMusic();

  const [languageFilter, setLanguageFilter] = useState<'all' | 'fr' | 'sg'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCantique, setSelectedCantique] = useState<Cantique | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Détermine la langue d'affichage (fr par défaut si 'all')
  const displayLanguage = languageFilter === 'all' ? 'fr' : languageFilter;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handlePlayCantique = (cantique: Cantique) => {
    setSelectedCantique(cantique);
    setShowPlayer(true);
  };

  // Filtrer par catégorie et langue
  let filteredCantiques = selectedCategory
    ? CANTIQUES_DATA.filter((c) => c.category === selectedCategory)
    : CANTIQUES_DATA;

  // Filtre par langue (futur: à adapter quand les cantiques auront une propriété language)
  // Pour l'instant, on garde tous les cantiques

  const cantiquesWithFavorites = filteredCantiques.map((c) => ({
    ...c,
    isFavorite: isFavorite(c.id),
  }));

  const featuredCantiques = cantiquesWithFavorites.filter(
    (c) => c.releaseYear === new Date().getFullYear()
  );

  const favoritesCantiques = cantiquesWithFavorites.filter((c) => c.isFavorite);

  // Écoutes récentes
  const recentlyPlayedIds = getRecentlyPlayedCantiques(10);
  const recentlyPlayedCantiques = recentlyPlayedIds
    .map((id) => cantiquesWithFavorites.find((c) => c.id === id))
    .filter((c) => c !== undefined) as Cantique[];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            Cantiques Nouveaux
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Louez l'Éternel d'un chant nouveau
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.languageButton,
            {
              backgroundColor: languageFilter !== 'all' ? theme.colors.primary : theme.colors.primary + '20',
            },
          ]}
          onPress={() => {
            if (languageFilter === 'all') setLanguageFilter('fr');
            else if (languageFilter === 'fr') setLanguageFilter('sg');
            else setLanguageFilter('all');
          }}
        >
          <Feather
            name="globe"
            size={16}
            color={languageFilter !== 'all' ? 'white' : theme.colors.primary}
          />
          <Text
            style={[
              styles.languageButtonText,
              { color: languageFilter !== 'all' ? 'white' : theme.colors.primary },
            ]}
          >
            {languageFilter === 'all' ? 'TOUS' : languageFilter.toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Hero Section */}
        <LinearGradient colors={['#EC4899', '#D946EF']} style={styles.hero}>
          <MaterialCommunityIcons name="music-note" size={60} color="white" style={styles.heroIcon} />
          <Text style={styles.heroTitle}>
            Adorons Le Roi
          </Text>
          <Text style={styles.heroSubtitle}>
            {CANTIQUES_DATA.length} cantiques disponibles
          </Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => {
              if (featuredCantiques.length > 0) {
                handlePlayCantique(featuredCantiques[0]);
              }
            }}
          >
            <Feather name="play" size={20} color="#EC4899" />
            <Text style={styles.heroButtonText}>
              Découvrir les nouveautés
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Catégories
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === null ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.outline + '40',
                },
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Feather
                name="grid"
                size={18}
                color={selectedCategory === null ? 'white' : theme.colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  {
                    color: selectedCategory === null ? 'white' : theme.colors.onSurfaceVariant,
                  },
                ]}
              >
                {displayLanguage === 'fr' ? 'Tous' : 'Kɔ̈kɔ̈'}
              </Text>
            </TouchableOpacity>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      selectedCategory === category.id ? category.color : theme.colors.surface,
                    borderColor: theme.colors.outline + '40',
                  },
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Feather
                  name={category.icon as any}
                  size={18}
                  color={selectedCategory === category.id ? 'white' : theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color:
                        selectedCategory === category.id ? 'white' : theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {category.name[displayLanguage]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Nouveaux Cantiques */}
        {featuredCantiques.length > 0 && !selectedCategory && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Nouveaux Morceaux
              </Text>
              <Feather name="star" size={20} color="#10B981" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cantiquesContainer}
            >
              {featuredCantiques.map((cantique) => (
                <CantiqueCard
                  key={cantique.id}
                  cantique={cantique}
                  onPress={() => handlePlayCantique(cantique)}
                  onFavorite={() => toggleFavorite(cantique.id)}
                  onPlay={() => handlePlayCantique(cantique)}
                  language={displayLanguage}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Écoutes récentes */}
        {recentlyPlayedCantiques.length > 0 && !selectedCategory && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Écoutés récemment
              </Text>
              <Feather name="clock" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.favoritesGrid}>
              {recentlyPlayedCantiques.map((cantique) => (
                <CantiqueCard
                  key={cantique.id}
                  cantique={cantique}
                  onPress={() => handlePlayCantique(cantique)}
                  onFavorite={() => toggleFavorite(cantique.id)}
                  onPlay={() => handlePlayCantique(cantique)}
                  language={displayLanguage}
                  horizontal
                />
              ))}
            </View>
          </View>
        )}

        {/* Mes Favoris */}
        {favoritesCantiques.length > 0 && !selectedCategory && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Mes Favoris
              </Text>
              <Feather name="heart" size={20} color={theme.colors.error} />
            </View>
            <View style={styles.favoritesGrid}>
              {favoritesCantiques.map((cantique) => (
                <CantiqueCard
                  key={cantique.id}
                  cantique={cantique}
                  onPress={() => handlePlayCantique(cantique)}
                  onFavorite={() => toggleFavorite(cantique.id)}
                  onPlay={() => handlePlayCantique(cantique)}
                  language={displayLanguage}
                  horizontal
                />
              ))}
            </View>
          </View>
        )}

        {/* Tous les Cantiques */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            {selectedCategory
              ? CATEGORIES.find((c) => c.id === selectedCategory)?.name[displayLanguage]
              : 'Tous les Cantiques'}
          </Text>
          <View style={styles.allCantiquesGrid}>
            {cantiquesWithFavorites.map((cantique) => (
              <CantiqueCard
                key={cantique.id}
                cantique={cantique}
                onPress={() => handlePlayCantique(cantique)}
                onFavorite={() => toggleFavorite(cantique.id)}
                onPlay={() => handlePlayCantique(cantique)}
                language={displayLanguage}
                horizontal
              />
            ))}
          </View>
        </View>

        {/* Rejoignez-nous CTA */}
        <TouchableOpacity
          style={[styles.joinCTA, { backgroundColor: theme.colors.surface }]}
          onPress={() => setShowJoinForm(true)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#EC4899', '#D946EF']}
            style={styles.joinCTAGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.joinCTAContent}>
              <Feather name="users" size={32} color="white" />
              <View style={styles.joinCTAText}>
                <Text style={styles.joinCTATitle}>
                  Rejoignez le Ministère Cantiques Nouveaux
                </Text>
                <Text style={styles.joinCTASubtitle}>
                  Utilisez vos talents pour glorifier Dieu
                </Text>
              </View>
              <Feather name="arrow-right" size={24} color="white" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Audio Player Modal */}
      <Modal
        visible={showPlayer}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowPlayer(false)}
      >
        {selectedCantique && (
          <AudioPlayer
            cantique={selectedCantique}
            language={displayLanguage}
            onClose={() => setShowPlayer(false)}
          />
        )}
      </Modal>

      {/* Join Ministry Form Bottom Sheet */}
      <BottomSheetModal
        visible={showJoinForm}
        onClose={() => setShowJoinForm(false)}
      >
        <JoinMinistryForm
          language={displayLanguage}
          onSubmit={() => {
            setShowJoinForm(false);
          }}
        />
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Nunito_800ExtraBold',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    marginTop: 2,
  },
  languageButton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  languageButtonText: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  hero: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  heroIcon: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  heroButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#EC4899',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
  },
  cantiquesContainer: {
    paddingHorizontal: 20,
  },
  favoritesGrid: {
    paddingHorizontal: 20,
  },
  allCantiquesGrid: {
    paddingHorizontal: 20,
  },
  joinCTA: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  joinCTAGradient: {
    padding: 24,
  },
  joinCTAContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  joinCTAText: {
    flex: 1,
  },
  joinCTATitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: 'white',
    marginBottom: 4,
  },
  joinCTASubtitle: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(255,255,255,0.9)',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'flex-end',
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
