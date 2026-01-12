import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ScrollView,
  TextInput,
  StatusBar,
} from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { BUSINESS_PRODUCTS, BUSINESS_STORIES, CATEGORIES, BusinessProduct } from '@/data/markosBusinessData';
import BusinessStoryCircle from '@/components/markos/BusinessStoryCircle';
import ProductCard from '@/components/markos/ProductCard';

export default function MarkosBusinessScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrage
  const filteredProducts = BUSINESS_PRODUCTS.filter(p => 
    (selectedCategory === 'all' || p.category === selectedCategory) &&
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      
      {/* Header Créatif */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Markos Market</Text>
          <TouchableOpacity style={styles.cartButton}>
            <Feather name="shopping-bag" size={22} color={theme.colors.onSurface} />
            <View style={styles.cartBadge} />
          </TouchableOpacity>
        </View>

        {/* Search Bar Moderne */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.colors.background }]}>
            <Feather name="search" size={20} color={theme.colors.onSurfaceVariant} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.onSurface }]}
              placeholder="Que recherchez-vous ?"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Section Stories (Vitrines) */}
        <View style={styles.storiesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>Vitrines à la une</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesList}>
            <TouchableOpacity style={styles.addStory}>
              <View style={[styles.addStoryCircle, { borderColor: theme.colors.outline + '40' }]}>
                <Feather name="plus" size={24} color={theme.colors.primary} />
              </View>
              <Text style={[styles.addStoryText, { color: theme.colors.onSurface }]}>Ma vitrine</Text>
            </TouchableOpacity>
            {BUSINESS_STORIES.map(story => (
              <BusinessStoryCircle key={story.id} story={story} />
            ))}
          </ScrollView>
        </View>

        {/* Catégories Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryPill,
                selectedCategory === cat.id 
                  ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                  : { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline + '20' }
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Feather 
                name={cat.icon as any} 
                size={14} 
                color={selectedCategory === cat.id ? 'white' : theme.colors.onSurfaceVariant} 
              />
              <Text style={[
                styles.categoryText,
                { color: selectedCategory === cat.id ? 'white' : theme.colors.onSurfaceVariant }
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Grille Produits */}
        <View style={styles.productsGrid}>
          <View style={styles.gridHeader}>
            <Text style={[styles.gridTitle, { color: theme.colors.onSurface }]}>
              {selectedCategory === 'all' ? 'Tendances' : CATEGORIES.find(c => c.id === selectedCategory)?.label}
            </Text>
            <TouchableOpacity>
              <Text style={{ color: theme.colors.primary, fontFamily: 'Nunito_700Bold', fontSize: 12 }}>Filtrer</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.grid}>
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onPress={() => {}} // TODO: Ouvrir détails
              />
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    elevation: 4,
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
  headerTitle: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', letterSpacing: 0.5 },
  cartButton: { padding: 4, position: 'relative' },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  searchContainer: { paddingHorizontal: 20 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    gap: 10,
  },
  searchInput: { flex: 1, fontFamily: 'Nunito_600SemiBold', fontSize: 15 },

  scrollContent: { paddingBottom: 40 },

  storiesSection: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  storiesList: {
    paddingHorizontal: 20,
  },
  addStory: {
    alignItems: 'center',
    width: 80,
    marginRight: 15,
  },
  addStoryCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  addStoryText: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
  },

  categoriesList: {
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
  },

  productsGrid: {
    paddingHorizontal: 16,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 4,
  },
  gridTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});