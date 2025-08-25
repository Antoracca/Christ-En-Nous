// app/screens/bible/BibleSearch.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBible } from '@/context/EnhancedBibleContext';
import { useResponsiveSafe } from '@/context/ResponsiveContext';

interface BibleSearchProps {
  visible: boolean;
  onClose: () => void;
}

export default function BibleSearch({ visible, onClose }: BibleSearchProps) {
  const theme = useAppTheme();
  const responsive = useResponsiveSafe();
  const { bibleBooks } = useBible();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // TODO: Implémenter la recherche réelle
      console.log('Recherche:', searchQuery);
      setTimeout(() => setIsSearching(false), 1000);
    } catch (error) {
      console.error('Erreur recherche:', error);
      setIsSearching(false);
    }
  };

  const handleResultPress = async (result: any) => {
    try {
      // TODO: Implémenter la navigation réelle
      console.log('Navigation vers résultat:', result);
      onClose();
    } catch (error) {
      console.error('Erreur navigation:', error);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    // TODO: Nettoyer les résultats de recherche
    console.log('Clear search');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.headerTitle, { color: theme.custom.colors.text }]}>
            Recherche Bible
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={theme.custom.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Barre de recherche */}
        <View style={[styles.searchContainer, {
          paddingHorizontal: responsive.isTablet ? responsive.spacing.lg : responsive.spacing.md
        }]}>
          <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.surface }]}>
            <Feather name="search" size={20} color={theme.custom.colors.placeholder} />
            <TextInput
              style={[styles.searchInput, { 
                color: theme.custom.colors.text,
                fontSize: responsive.isTablet ? 18 : 16
              }]}
              placeholder="Rechercher des versets..."
              placeholderTextColor={theme.custom.colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Feather name="x" size={16} color={theme.custom.colors.placeholder} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.searchButton, { 
              backgroundColor: theme.colors.primary,
              opacity: searchQuery.trim() ? 1 : 0.5
            }]}
            onPress={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              <Feather name="search" size={20} color={theme.colors.onPrimary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Résultats */}
        <ScrollView style={styles.resultsContainer}>
          <View style={[styles.results, {
            paddingHorizontal: responsive.isTablet ? responsive.spacing.lg : responsive.spacing.md
          }]}>
            {/* Pas de résultats pour l'instant - logique à implémenter */}
            {searchQuery && !isSearching ? (
              <View style={styles.emptyState}>
                <Feather name="search" size={48} color={theme.custom.colors.placeholder} />
                <Text style={[styles.emptyText, { color: theme.custom.colors.placeholder }]}>
                  Aucun résultat trouvé pour "{searchQuery}"
                </Text>
              </View>
            ) : !searchQuery ? (
              <View style={styles.emptyState}>
                <Feather name="search" size={48} color={theme.custom.colors.placeholder} />
                <Text style={[styles.emptyText, { color: theme.custom.colors.placeholder }]}>
                  Saisissez un mot ou une phrase pour rechercher
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resultsContainer: {
    flex: 1,
  },
  results: {
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 16,
  },
  resultItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  resultReference: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginTop: 32,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
});