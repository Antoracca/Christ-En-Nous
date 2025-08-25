// app/screens/bible/BibleReader.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBible } from '@/context/EnhancedBibleContext';
import { useResponsiveSafe } from '@/context/ResponsiveContext';

interface BibleReaderProps {
  onNavigationPress: () => void;
  onSearchPress: () => void;
  onSettingsPress: () => void;
}

export default function BibleReader({ 
  onNavigationPress, 
  onSearchPress, 
  onSettingsPress 
}: BibleReaderProps) {
  const theme = useAppTheme();
  const responsive = useResponsiveSafe();
  const { 
    bibleBooks, 
    currentVersion, 
    userProgress,
    currentChapter,
    navigateToChapter,
    loading,
    error 
  } = useBible();

  const [isInitializing, setIsInitializing] = useState(true);

  // Charger automatiquement Genèse 1 au démarrage
  useEffect(() => {
    const loadDefaultChapter = async () => {
      try {
        // Si aucun chapitre n'est chargé, charger Genèse 1
        if (!currentChapter && !userProgress.currentBook) {
          console.log('Navigation vers: Genèse 1:1');
          await navigateToChapter({ book: 'GEN', chapter: 1 });
        }
      } catch (err) {
        console.error('Erreur lors du chargement du chapitre par défaut:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    loadDefaultChapter();
  }, [currentChapter, userProgress.currentBook, navigateToChapter]);

  // Affichage du loading pendant l'initialisation
  if (isInitializing || loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity onPress={onNavigationPress} style={styles.headerButton}>
            <Feather name="book-open" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.custom.colors.text }]}>
            Bible
          </Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={onSearchPress} style={styles.headerButton}>
              <Feather name="search" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onSettingsPress} style={styles.headerButton}>
              <Feather name="settings" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.emptyText, { color: theme.custom.colors.placeholder, marginTop: 16 }]}>
            Chargement du chapitre...
          </Text>
        </View>
      </View>
    );
  }

  // Affichage d'erreur
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity onPress={onNavigationPress} style={styles.headerButton}>
            <Feather name="book-open" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.custom.colors.text }]}>
            Bible
          </Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={onSearchPress} style={styles.headerButton}>
              <Feather name="search" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onSettingsPress} style={styles.headerButton}>
              <Feather name="settings" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.centerContent}>
          <Feather name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={[styles.emptyText, { color: theme.colors.error, marginTop: 16 }]}>
            {error}
          </Text>
          <TouchableOpacity 
            onPress={() => navigateToChapter({ book: 'GEN', chapter: 1 })}
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={[styles.retryButtonText, { color: 'white' }]}>
              Réessayer
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Obtenir le nom français du livre
  const getBookName = (osisCode: string) => {
    const book = bibleBooks.find(b => b.id === osisCode.toLowerCase());
    return book?.name || osisCode;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header avec navigation */}
      <View style={[styles.header, { 
        backgroundColor: theme.colors.surface,
        paddingHorizontal: responsive.isTablet ? responsive.spacing.md : responsive.spacing.sm
      }]}>
        <TouchableOpacity onPress={onNavigationPress} style={styles.headerButton}>
          <Feather name="book-open" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.custom.colors.text }]}>
            {currentChapter ? 
              `${getBookName(currentChapter.book)} ${currentChapter.chapter}` : 
              'Bible'
            }
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onSearchPress} style={styles.headerButton}>
            <Feather name="search" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onSettingsPress} style={styles.headerButton}>
            <Feather name="settings" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenu des versets */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, {
          paddingHorizontal: responsive.isTablet ? responsive.spacing.lg : responsive.spacing.md
        }]}
      >
        {currentChapter && currentChapter.verses ? (
          currentChapter.verses.map((verse) => (
            <View key={`${verse.book}-${verse.chapter}-${verse.verse}`} 
                  style={[styles.verseContainer, { 
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.custom?.colors?.border + '20' || 'rgba(0,0,0,0.1)'
                  }]}>
              <Text style={[styles.verseNumber, { color: theme.colors.primary }]}>
                {verse.verse}
              </Text>
              <Text style={[styles.verseText, { color: theme.custom.colors.text }]}>
                {verse.text}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={[styles.placeholderText, { color: theme.custom.colors.placeholder }]}>
              Aucun verset disponible
            </Text>
            <Text style={[styles.placeholderSubText, { color: theme.custom.colors.placeholder }]}>
              Version: {currentVersion.name}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  verseContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  verseNumber: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    marginRight: 12,
    marginTop: 2,
    minWidth: 22,
    textAlign: 'right',
  },
  verseText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 24,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderText: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    marginBottom: 4,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
  },
});