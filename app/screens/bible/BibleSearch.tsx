// app/screens/bible/BibleSearch.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBible } from '@/context/EnhancedBibleContext';
import { useResponsiveSafe } from '@/context/ResponsiveContext';
import type { BibleSearchResult } from '@/services/bible';

// Mapping des codes OSIS vers les noms français
const OSIS_TO_FRENCH: Record<string, string> = {
  'GEN': 'Genèse',
  'EXO': 'Exode', 
  'LEV': 'Lévitique',
  'NUM': 'Nombres',
  'DEU': 'Deutéronome',
  'JOS': 'Josué',
  'JDG': 'Juges',
  'RUT': 'Ruth',
  '1SA': '1 Samuel',
  '2SA': '2 Samuel',
  '1KI': '1 Rois',
  '2KI': '2 Rois',
  '1CH': '1 Chroniques',
  '2CH': '2 Chroniques',
  'EZR': 'Esdras',
  'NEH': 'Néhémie',
  'EST': 'Esther',
  'JOB': 'Job',
  'PSA': 'Psaumes',
  'PRO': 'Proverbes',
  'ECC': 'Ecclésiaste',
  'SNG': 'Cantique des cantiques',
  'ISA': 'Ésaïe',
  'JER': 'Jérémie',
  'LAM': 'Lamentations',
  'EZK': 'Ézéchiel',
  'DAN': 'Daniel',
  'HOS': 'Osée',
  'JOL': 'Joël',
  'AMO': 'Amos',
  'OBA': 'Abdias',
  'JON': 'Jonas',
  'MIC': 'Michée',
  'NAM': 'Nahum',
  'HAB': 'Habacuc',
  'ZEP': 'Sophonie',
  'HAG': 'Aggée',
  'ZEC': 'Zacharie',
  'MAL': 'Malachie',
  'MAT': 'Matthieu',
  'MRK': 'Marc',
  'LUK': 'Luc',
  'JHN': 'Jean',
  'ACT': 'Actes',
  'ROM': 'Romains',
  '1CO': '1 Corinthiens',
  '2CO': '2 Corinthiens',
  'GAL': 'Galates',
  'EPH': 'Éphésiens',
  'PHP': 'Philippiens',
  'COL': 'Colossiens',
  '1TH': '1 Thessaloniciens',
  '2TH': '2 Thessaloniciens',
  '1TI': '1 Timothée',
  '2TI': '2 Timothée',
  'TIT': 'Tite',
  'PHM': 'Philémon',
  'HEB': 'Hébreux',
  'JAS': 'Jacques',
  '1PE': '1 Pierre',
  '2PE': '2 Pierre',
  '1JN': '1 Jean',
  '2JN': '2 Jean',
  '3JN': '3 Jean',
  'JUD': 'Jude',
  'REV': 'Apocalypse'
};

// Fonctions utilitaires
const getLocalizedBookName = (osisCode: string, version: any): string => {
  // Si c'est une version française, utiliser les noms français
  if (version?.language?.toLowerCase().includes('fr') || version?.language === 'French') {
    return OSIS_TO_FRENCH[osisCode] || osisCode;
  }
  
  // Pour les versions anglaises, garder les codes OSIS ou les convertir
  const OSIS_TO_ENGLISH: Record<string, string> = {
    'GEN': 'Genesis',
    'EXO': 'Exodus',
    'LEV': 'Leviticus',
    'NUM': 'Numbers',
    'DEU': 'Deuteronomy',
    'JOS': 'Joshua',
    'JDG': 'Judges',
    'RUT': 'Ruth',
    '1SA': '1 Samuel',
    '2SA': '2 Samuel',
    '1KI': '1 Kings',
    '2KI': '2 Kings',
    '1CH': '1 Chronicles',
    '2CH': '2 Chronicles',
    'EZR': 'Ezra',
    'NEH': 'Nehemiah',
    'EST': 'Esther',
    'JOB': 'Job',
    'PSA': 'Psalms',
    'PRO': 'Proverbs',
    'ECC': 'Ecclesiastes',
    'SNG': 'Song of Songs',
    'ISA': 'Isaiah',
    'JER': 'Jeremiah',
    'LAM': 'Lamentations',
    'EZK': 'Ezekiel',
    'DAN': 'Daniel',
    'HOS': 'Hosea',
    'JOL': 'Joel',
    'AMO': 'Amos',
    'OBA': 'Obadiah',
    'JON': 'Jonah',
    'MIC': 'Micah',
    'NAM': 'Nahum',
    'HAB': 'Habakkuk',
    'ZEP': 'Zephaniah',
    'HAG': 'Haggai',
    'ZEC': 'Zechariah',
    'MAL': 'Malachi',
    'MAT': 'Matthew',
    'MRK': 'Mark',
    'LUK': 'Luke',
    'JHN': 'John',
    'ACT': 'Acts',
    'ROM': 'Romans',
    '1CO': '1 Corinthians',
    '2CO': '2 Corinthians',
    'GAL': 'Galatians',
    'EPH': 'Ephesians',
    'PHP': 'Philippians',
    'COL': 'Colossians',
    '1TH': '1 Thessalonians',
    '2TH': '2 Thessalonians',
    '1TI': '1 Timothy',
    '2TI': '2 Timothy',
    'TIT': 'Titus',
    'PHM': 'Philemon',
    'HEB': 'Hebrews',
    'JAS': 'James',
    '1PE': '1 Peter',
    '2PE': '2 Peter',
    '1JN': '1 John',
    '2JN': '2 John',
    '3JN': '3 John',
    'JUD': 'Jude',
    'REV': 'Revelation'
  };
  
  return OSIS_TO_ENGLISH[osisCode] || osisCode;
};

const createHighlightedText = (text: string, searchQuery: string): React.ReactNode[] => {
  if (!searchQuery.trim()) return [text];
  
  // Nettoyer le texte des balises HTML si elles existent
  const cleanText = text.replace(/<\/?mark>/g, '');
  
  // Normaliser la requête de recherche
  const normalizeText = (str: string) => str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Supprimer les accents
  
  // Mots à surligner - seulement la requête originale et ses variantes exactes
  const getWordsToHighlight = (query: string) => {
    const words = [];
    const lowerQuery = query.toLowerCase();
    
    // Ajouter la requête originale
    words.push(query);
    
    // Ajouter seulement les variantes de la même racine (accents, casse)
    if (lowerQuery === 'jésus') {
      words.push('jésus', 'Jésus', 'JÉSUS', 'jesus', 'Jesus', 'JESUS');
    } else if (lowerQuery === 'jesus') {
      words.push('jesus', 'Jesus', 'JESUS', 'jésus', 'Jésus', 'JÉSUS');
    } else if (lowerQuery === 'christ') {
      words.push('christ', 'Christ', 'CHRIST');
    } else if (lowerQuery === 'marie') {
      words.push('marie', 'Marie', 'MARIE');
    } else if (lowerQuery === 'dieu') {
      words.push('dieu', 'Dieu', 'DIEU');
    }
    
    return [...new Set(words.flatMap(w => w.split(' ')).filter(w => w.length > 1))];
  };
  
  const wordsToHighlight = getWordsToHighlight(searchQuery);
  
  if (wordsToHighlight.length === 0) return [cleanText];
  
  // Créer une regex pour tous les mots (avec et sans accents)
  const pattern = wordsToHighlight.map(word => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return `(${escaped})`;
  }).join('|');
  const regex = new RegExp(pattern, 'gi');
  
  const parts = cleanText.split(regex);
  const result: React.ReactNode[] = [];
  
  parts.forEach((part, index) => {
    if (!part) return;
    
    const isMatch = wordsToHighlight.some(word => 
      normalizeText(part) === normalizeText(word) || 
      (part.toLowerCase() === word.toLowerCase())
    );
    
    if (isMatch) {
      result.push(
        <Text key={index} style={{ backgroundColor: 'yellow', color: 'black', fontWeight: 'bold' }}>
          {part}
        </Text>
      );
    } else {
      result.push(part);
    }
  });
  
  return result.length > 0 ? result : [cleanText];
};

interface BibleSearchProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToVerse?: (reference: { book: string; chapter: number; verse?: number }) => void;
}

export default function BibleSearch({ visible, onClose, onNavigateToVerse }: BibleSearchProps) {
  const theme = useAppTheme();
  const responsive = useResponsiveSafe();
  const { 
    searchVerses, 
    searchResults, 
    isSearching, 
    clearSearch,
    navigateToChapter,
    currentVersion // Récupérer la version actuelle pour la localisation
  } = useBible();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const SEARCH_HISTORY_KEY = '@bible_search_history';
  const MAX_HISTORY_ITEMS = 15;

  // Charger l'historique au démarrage
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const historyStr = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (historyStr) {
        const history = JSON.parse(historyStr);
        setSearchHistory(history);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  };

  const saveToHistory = useCallback(async (query: string) => {
    try {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return;

      // Éviter les doublons et mettre le plus récent en premier
      const newHistory = [trimmedQuery, ...searchHistory.filter(item => item !== trimmedQuery)]
        .slice(0, MAX_HISTORY_ITEMS);
      
      setSearchHistory(newHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'historique:', error);
    }
  }, [searchHistory]);

  const clearSearchHistory = async () => {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
      setSearchHistory([]);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'historique:', error);
    }
  };

  const handleHistoryItemPress = useCallback((historyItem: string) => {
    setSearchQuery(historyItem);
    // Déclencher la recherche automatiquement sans sauvegarder à nouveau dans l'historique
    setTimeout(async () => {
      try {
        console.log('🔍 Recherche depuis historique:', historyItem);
        await searchVerses(historyItem, 25);
      } catch (error) {
        console.error('❌ Erreur lors de la recherche depuis l\'historique:', error);
        setError(error instanceof Error ? error.message : 'Erreur lors de la recherche');
      }
    }, 100);
  }, [searchVerses]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setError(null);
    
    try {
      console.log('🔍 Recherche Bible:', searchQuery);
      
      // Sauvegarder dans l'historique
      await saveToHistory(searchQuery);
      
      await searchVerses(searchQuery, 25); // Limiter à 25 résultats
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la recherche');
      
      Alert.alert(
        'Erreur de recherche',
        'Impossible de rechercher dans la Bible actuellement. Vérifiez votre connexion et réessayez.',
        [
          { text: 'Réessayer', onPress: () => handleSearch() },
          { text: 'Annuler', style: 'cancel' }
        ]
      );
    }
  }, [searchQuery, searchVerses, saveToHistory]);

  const handleResultPress = useCallback(async (result: BibleSearchResult) => {
    try {
      console.log('📍 Navigation vers verset:', result.verse);
      
      const reference = {
        book: result.verse.book,
        chapter: result.verse.chapter,
        verse: result.verse.verse
      };
      
      // Si on a une fonction de navigation personnalisée (depuis BibleReaderScreen)
      if (onNavigateToVerse) {
        onNavigateToVerse(reference);
        return;
      }
      
      // Fallback : utiliser la navigation du contexte Bible
      await navigateToChapter({
        book: reference.book,
        chapter: reference.chapter,
        verse: reference.verse
      });
      
      onClose();
    } catch (error) {
      console.error('❌ Erreur navigation vers verset:', error);
      Alert.alert(
        'Erreur de navigation',
        'Impossible de naviguer vers ce verset. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    }
  }, [onNavigateToVerse, navigateToChapter, onClose]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setError(null);
    clearSearch(); // Nettoie les résultats dans le contexte
  }, [clearSearch]);

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
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
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

        {/* Historique de recherche */}
        {searchHistory.length > 0 && (
          <View style={[styles.historyContainer, {
            paddingHorizontal: responsive.isTablet ? responsive.spacing.lg : responsive.spacing.md
          }]}>
            <View style={styles.historyHeader}>
              <Text style={[styles.historyTitle, { color: theme.custom.colors.text }]}>
                Recherches récentes
              </Text>
              <TouchableOpacity onPress={clearSearchHistory} style={styles.clearHistoryButton}>
                <Feather name="trash-2" size={16} color={theme.custom.colors.placeholder} />
                <Text style={[styles.clearHistoryText, { color: theme.custom.colors.placeholder }]}>
                  Effacer
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
              {searchHistory.map((historyItem, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.historyItem, { backgroundColor: theme.colors.surface }]}
                  onPress={() => handleHistoryItemPress(historyItem)}
                >
                  <Feather name="clock" size={12} color={theme.custom.colors.placeholder} />
                  <Text style={[styles.historyItemText, { color: theme.custom.colors.text }]}>
                    {historyItem}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Résultats */}
        <ScrollView style={styles.resultsContainer}>
          <View style={[styles.results, {
            paddingHorizontal: responsive.isTablet ? responsive.spacing.lg : responsive.spacing.md
          }]}>
            {error && (
              <View style={[styles.errorState, { backgroundColor: theme.colors.error + '10' }]}>
                <Feather name="alert-circle" size={24} color={theme.colors.error} />
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {error}
                </Text>
              </View>
            )}
            
            {isSearching ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.custom.colors.placeholder }]}>
                  Recherche en cours...
                </Text>
              </View>
            ) : searchResults && searchResults.length > 0 ? (
              <>
                <Text style={[styles.resultsCount, { color: theme.custom.colors.text }]}>
                  {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} pour &quot;{searchQuery}&quot;
                </Text>
                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={`${result.verse.id}-${index}`}
                    style={[styles.resultItem, { backgroundColor: theme.colors.surface }]}
                    onPress={() => handleResultPress(result)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.resultReference, { color: theme.colors.primary }]}>
                      {getLocalizedBookName(result.verse.book, currentVersion)} {result.verse.chapter}:{result.verse.verse}
                    </Text>
                    <Text style={[styles.resultText, { color: theme.custom.colors.text }]}>
                      {createHighlightedText(result.verse.text, searchQuery)}
                    </Text>
                    {result.matchType && (
                      <Text style={[styles.matchType, { color: theme.custom.colors.placeholder }]}>
                        Correspondance {result.matchType}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </>
            ) : searchQuery && !isSearching ? (
              <View style={styles.emptyState}>
                <Feather name="search" size={48} color={theme.custom.colors.placeholder} />
                <Text style={[styles.emptyText, { color: theme.custom.colors.placeholder }]}>
                  Aucun résultat trouvé pour &quot;{searchQuery}&quot;
                </Text>
                <Text style={[styles.emptySubText, { color: theme.custom.colors.placeholder }]}>
                  Essayez avec d&apos;autres mots-clés
                </Text>
              </View>
            ) : !searchQuery ? (
              <View style={styles.emptyState}>
                <Feather name="book-open" size={48} color={theme.custom.colors.placeholder} />
                <Text style={[styles.emptyText, { color: theme.custom.colors.placeholder }]}>
                  Saisissez un mot ou une phrase pour rechercher
                </Text>
                <Text style={[styles.emptySubText, { color: theme.custom.colors.placeholder }]}>
                  Par exemple : &quot;amour&quot;, &quot;paix&quot;, &quot;Jean 3:16&quot;
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
  emptySubText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  errorState: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 20,
  },
  loadingState: {
    alignItems: 'center',
    padding: 32,
    marginTop: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    marginTop: 12,
  },
  matchType: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    marginTop: 6,
    fontStyle: 'italic',
  },
  historyContainer: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
  },
  clearHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  clearHistoryText: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
  },
  historyScroll: {
    marginTop: 4,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    gap: 6,
  },
  historyItemText: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    maxWidth: 120,
  },
});