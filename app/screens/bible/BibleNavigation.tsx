// app/screens/bible/BibleNavigation.tsx
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBible } from '@/context/EnhancedBibleContext';
import { useResponsiveSafe } from '@/context/ResponsiveContext';

const { width, height } = Dimensions.get('window');

interface BibleNavigationProps {
  visible: boolean;
  onClose: () => void;
}

interface BookSectionProps {
  title: string;
  books: any[];
  onBookSelect: (book: any) => void;
  selectedBook?: any | null;
  theme: any;
  responsive: any;
}

interface ChapterGridProps {
  book: any;
  selectedChapter: number;
  onChapterSelect: (chapter: number) => void;
  onChapterNavigate?: (chapter: number) => void;
  theme: any;
  responsive: any;
}

interface VerseGridProps {
  book: any;
  chapter: number;
  selectedVerse: number;
  onVerseSelect: (verse: number) => void;
  theme: any;
  responsive: any;
}

/**
 * Section de livres (AT/NT) — Design moderne et responsive
 */
const BookSection = ({ title, books, onBookSelect, selectedBook, theme, responsive }: BookSectionProps) => {
  const itemWidth = responsive.isTablet 
    ? (width - 80) / 3  // 3 colonnes sur tablette
    : (width - 60) / 2; // 2 colonnes sur mobile

  return (
    <View style={styles.bookSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>{title}</Text>
      <View style={styles.booksGrid}>
        {books.map((book) => {
          const isActive = selectedBook?.id === book.id;
          return (
            <TouchableOpacity
              key={book.id}
              style={[
                styles.bookItem,
                {
                  width: itemWidth,
                  backgroundColor: isActive ? theme.colors.primary + '20' : theme.colors.surface,
                  borderColor: isActive ? theme.colors.primary : 'rgba(0,0,0,0.1)',
                  elevation: isActive ? 4 : 2,
                  shadowOpacity: isActive ? 0.15 : 0.05,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onBookSelect(book);
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Livre ${book.name}`}
            >
              <Text
                style={[
                  styles.bookName,
                  {
                    color: isActive ? theme.colors.primary : theme.custom.colors.text,
                    fontFamily: isActive ? 'Nunito_700Bold' : 'Nunito_600SemiBold',
                    fontSize: responsive.isTablet ? 16 : 15,
                  },
                ]}
                numberOfLines={1}
              >
                {book.name}
              </Text>
              <Text style={[styles.bookChapters, { color: theme.custom.colors.placeholder }]}>
                {book.chapters} ch.
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

/**
 * Grille des chapitres pour le livre sélectionné - Design amélioré
 */
const ChapterGrid = ({ book, selectedChapter, onChapterSelect, onChapterNavigate, theme, responsive }: ChapterGridProps) => {
  const chapters = useMemo(() => Array.from({ length: book.chapters }, (_, i) => i + 1), [book.chapters]);
  
  const chapterWidth = responsive.isTablet 
    ? (width - 100) / 8  // 8 colonnes sur tablette
    : (width - 80) / 5;  // 5 colonnes sur mobile

  return (
    <View style={styles.chapterSection}>
      <View style={styles.chapterHeader}>
        <Text style={[styles.chapterTitle, { 
          color: theme.custom.colors.text,
          fontSize: responsive.isTablet ? 20 : 18 
        }]}>
          {book.name}
        </Text>
        <Text style={[styles.chapterSubtitle, { color: theme.custom.colors.placeholder }]}>
          {chapters.length} chapitres disponibles
        </Text>
      </View>
      
      <ScrollView style={styles.chapterScrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.chaptersGrid}>
          {chapters.map((chapter) => {
            const isActive = selectedChapter === chapter;
            return (
              <TouchableOpacity
                key={chapter}
                style={[
                  styles.chapterItem,
                  {
                    width: chapterWidth,
                    height: responsive.isTablet ? 50 : 45,
                    backgroundColor: isActive ? theme.colors.primary : theme.colors.surface,
                    borderColor: isActive ? theme.colors.primary : 'rgba(0,0,0,0.1)',
                    elevation: isActive ? 3 : 1,
                    shadowOpacity: isActive ? 0.2 : 0.05,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onChapterSelect(chapter);
                }}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  if (onChapterNavigate) {
                    onChapterNavigate(chapter);
                  }
                }}
                delayLongPress={500}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Chapitre ${chapter}`}
              >
                <Text
                  style={[
                    styles.chapterNumber,
                    { 
                      color: isActive ? 'white' : theme.custom.colors.text,
                      fontSize: responsive.isTablet ? 18 : 16,
                    },
                  ]}
                >
                  {chapter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

/**
 * Grille des versets pour le chapitre sélectionné - Design premium
 */
const VerseGrid = ({ book, chapter, selectedVerse, onVerseSelect, theme, responsive }: VerseGridProps) => {
  const { getChapter } = useBible();
  const [verseCount, setVerseCount] = useState(25); // Valeur par défaut
  const [loading, setLoading] = useState(true);
  
  // Charger le nombre réel de versets depuis l'API
  useEffect(() => {
    const loadVerseCount = async () => {
      try {
        setLoading(true);
        // Convertir le nom français vers le code OSIS
        const osisCode = book.id?.toUpperCase() || 'GEN';
        const chapterData = await getChapter({ book: osisCode, chapter });
        
        if (chapterData && chapterData.verses) {
          setVerseCount(chapterData.verses.length);
        } else {
          setVerseCount(25); // Fallback
        }
      } catch (error) {
        console.error('Erreur lors du chargement des versets:', error);
        setVerseCount(25); // Fallback en cas d'erreur
      } finally {
        setLoading(false);
      }
    };
    
    loadVerseCount();
  }, [book, chapter, getChapter]);
  const verses = useMemo(() => Array.from({ length: verseCount }, (_, i) => i + 1), [verseCount]);
  
  // Affichage de loading pendant le chargement des versets
  if (loading) {
    return (
      <View style={styles.verseSection}>
        <View style={styles.verseHeader}>
          <Text style={[styles.verseTitle, { 
            color: theme.custom.colors.text,
            fontSize: responsive.isTablet ? 20 : 18 
          }]}>
            {book.name} {chapter}
          </Text>
          <Text style={[styles.verseSubtitle, { color: theme.custom.colors.placeholder }]}>
            Chargement des versets...
          </Text>
        </View>
        <View style={[styles.centerContent, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }
  
  const verseWidth = responsive.isTablet 
    ? (width - 100) / 10  // 10 colonnes sur tablette
    : (width - 80) / 6;   // 6 colonnes sur mobile

  return (
    <View style={styles.verseSection}>
      <View style={styles.verseHeader}>
        <Text style={[styles.verseTitle, { 
          color: theme.custom.colors.text,
          fontSize: responsive.isTablet ? 20 : 18 
        }]}>
          {book.name} {chapter}
        </Text>
        <Text style={[styles.verseSubtitle, { color: theme.custom.colors.placeholder }]}>
          {verses.length} versets disponibles
        </Text>
      </View>
      
      <ScrollView style={styles.verseScrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.versesGrid}>
          {verses.map((verse) => {
            const isActive = selectedVerse === verse;
            return (
              <TouchableOpacity
                key={verse}
                style={[
                  styles.verseItem,
                  {
                    width: verseWidth,
                    height: responsive.isTablet ? 45 : 40,
                    backgroundColor: isActive ? theme.colors.primary : theme.colors.surface,
                    borderColor: isActive ? theme.colors.primary : 'rgba(0,0,0,0.1)',
                    elevation: isActive ? 3 : 1,
                    shadowOpacity: isActive ? 0.2 : 0.05,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  onVerseSelect(verse);
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Verset ${verse}`}
              >
                <Text
                  style={[
                    styles.verseNumber,
                    { 
                      color: isActive ? 'white' : theme.custom.colors.text,
                      fontSize: responsive.isTablet ? 16 : 14,
                    },
                  ]}
                >
                  {verse}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default function BibleNavigation({ visible, onClose }: BibleNavigationProps) {
  const theme = useAppTheme();
  const responsive = useResponsiveSafe();
  const navigation = useNavigation();
  const { bibleBooks, userProgress, navigateToChapter, availableVersions, currentVersion, setCurrentVersion } = useBible();

  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'ancien' | 'nouveau'>('ancien');

  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // Animations d'ouverture/fermeture avec spring
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { 
          toValue: 0, 
          useNativeDriver: true, 
          tension: 120,
          friction: 8 
        }),
        Animated.timing(backdropAnim, { 
          toValue: 1, 
          duration: 300, 
          useNativeDriver: true 
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { 
          toValue: height, 
          duration: 250, 
          useNativeDriver: true 
        }),
        Animated.timing(backdropAnim, { 
          toValue: 0, 
          duration: 200, 
          useNativeDriver: true 
        }),
      ]).start(() => {
        // Reset en fermeture
        setSelectedBook(null);
        setSelectedChapter(null);
        setActiveTab('ancien');
      });
    }
  }, [visible, slideAnim, backdropAnim]);

  // Séparation AT/NT
  const oldTestamentBooks = useMemo(
    () => bibleBooks.filter((b) => b.testament === 'ancien'),
    [bibleBooks]
  );
  const newTestamentBooks = useMemo(
    () => bibleBooks.filter((b) => b.testament === 'nouveau'),
    [bibleBooks]
  );

  // Sélection d'un livre
  const handleBookSelect = useCallback((book: any) => {
    setSelectedBook(book);
    setActiveTab(book.testament);
  }, []);

  // Sélection d'un chapitre -> Aller aux versets  
  const handleChapterSelect = useCallback((chapter: number) => {
    setSelectedChapter(chapter);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  // Navigation directe vers un chapitre (sans passer par les versets)
  const handleChapterNavigate = useCallback(async (chapter: number) => {
    if (!selectedBook) return;

    try {
      const osisCode = selectedBook.id?.toUpperCase() || 'GEN';
      await navigateToChapter({ book: osisCode, chapter });
      
      console.log(`Navigation directe vers: ${selectedBook.name} ${chapter}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la navigation directe:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [selectedBook, navigateToChapter, onClose]);

  // Sélection d'un verset -> Navigation finale
  const handleVerseSelect = useCallback(
    async (verse: number) => {
      if (!selectedBook || !selectedChapter) return;

      try {
        // Convertir vers le format OSIS et naviguer réellement
        const osisCode = selectedBook.id?.toUpperCase() || 'GEN';
        await navigateToChapter({ 
          book: osisCode, 
          chapter: selectedChapter, 
          verse 
        });
        
        console.log(`Navigation réelle vers: ${selectedBook.name} ${selectedChapter}:${verse}`);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onClose();
      } catch (error) {
        console.error('Erreur lors de la navigation:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [selectedBook, selectedChapter, navigateToChapter, onClose]
  );

  // Navigation rapide - Livres populaires
  const QUICK_BOOKS = ['Genèse', 'Psaumes', 'Matthieu', 'Jean', 'Romains', 'Apocalypse'];

  const handleQuickNavigation = useCallback(
    (bookName: string) => {
      const book = bibleBooks.find((b) => b.name === bookName);
      if (book) {
        setSelectedBook(book);
        setActiveTab(book.testament);
      }
    },
    [bibleBooks]
  );


  if (!visible) return null;

  // Référence actuelle et navigation
  const getCurrentBookName = () => {
    if (userProgress.currentBook) {
      // Chercher par code OSIS d'abord
      const bookByOsis = bibleBooks.find(b => 
        b.id?.toUpperCase() === userProgress.currentBook?.toUpperCase() ||
        b.name?.toUpperCase() === userProgress.currentBook?.toUpperCase()
      );
      return bookByOsis?.name || userProgress.currentBook;
    }
    return null;
  };
  
  const currentBookName = getCurrentBookName();
  const currentRefText = currentBookName && userProgress.currentChapter
    ? `${currentBookName} ${userProgress.currentChapter}${userProgress.currentVerse ? ':' + userProgress.currentVerse : ''}`
    : (currentBookName || 'Aucune lecture en cours');

  // Texte du header selon le niveau de navigation
  const getHeaderText = () => {
    if (!selectedBook) {
      return {
        title: 'Navigation Bible',
        subtitle: 'Choisissez un livre et un chapitre'
      };
    } else if (!selectedChapter) {
      return {
        title: selectedBook.name,
        subtitle: 'Choisissez un chapitre'
      };
    } else {
      return {
        title: `${selectedBook.name} ${selectedChapter}`,
        subtitle: 'Choisissez un verset'
      };
    }
  };

  const headerText = getHeaderText();

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Backdrop avec BlurView */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: backdropAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1}>
            <BlurView intensity={20} tint={theme.dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          </TouchableOpacity>
        </Animated.View>

        {/* Contenu principal */}
        <Animated.View
          style={[
            styles.modalContent,
            { 
              backgroundColor: theme.colors.background, 
              transform: [{ translateY: slideAnim }],
              marginTop: responsive.isTablet ? height * 0.05 : height * 0.1,
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* En-tête moderne */}
            <View style={[styles.header, { borderBottomColor: theme.colors.outline }]}>
              <View style={styles.headerLeft}>
                <Text style={[styles.headerTitle, { 
                  color: theme.custom.colors.text,
                  fontSize: responsive.isTablet ? 22 : 20 
                }]}>
                  {headerText.title}
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.custom.colors.placeholder }]}>
                  {headerText.subtitle}
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.closeButton, { backgroundColor: theme.colors.surface }]} 
                onPress={onClose} 
                accessibilityRole="button"
              >
                <Feather name="x" size={24} color={theme.custom.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Référence actuelle et Version - Design amélioré */}
            <View style={styles.infoSection}>
              {/* Lecture actuelle - Style harmonisé */}
              <View style={[styles.versionSelector, { 
                backgroundColor: theme.colors.surface, 
                flex: 1,
                borderColor: theme.colors.primary + '30'
              }]}>
                <View style={[styles.versionIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Feather name="bookmark" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.versionContent}>
                  <Text style={[styles.versionLabel, { color: theme.custom.colors.placeholder }]}>
                    LECTURE ACTUELLE
                  </Text>
                  <View style={styles.versionTextRow}>
                    <Text style={[styles.versionText, { 
                      color: theme.custom.colors.text,
                      fontSize: responsive.isTablet ? 16 : 14 
                    }]} numberOfLines={2}>
                      {currentRefText}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Version Bible - Améliorée */}
              <TouchableOpacity 
                style={[styles.versionSelector, { 
                  backgroundColor: theme.colors.surface, 
                  flex: 1, 
                  marginLeft: 12,
                  borderColor: theme.colors.primary + '30'
                }]}
                onPress={() => {
                  onClose(); // Fermer la navigation actuelle
                  navigation.navigate('BibleVersionSelector' as never);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.versionIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Feather name="book-open" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.versionContent}>
                  <Text style={[styles.versionLabel, { color: theme.custom.colors.placeholder }]}>
                    VERSION BIBLE
                  </Text>
                  <View style={styles.versionTextRow}>
                    <Text style={[styles.versionText, { 
                      color: theme.colors.primary,
                      fontSize: responsive.isTablet ? 16 : 14 
                    }]} numberOfLines={2}>
                      {currentVersion.name || currentVersion.abbrev}
                    </Text>
                    {currentVersion.id === 'a93a92589195411f-01' && (
                      <View style={[styles.defaultIndicator, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.defaultIndicatorText}>DÉFAUT</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={[styles.selectorArrow, { backgroundColor: theme.colors.primary + '10' }]}>
                  <Feather name="chevron-right" size={16} color={theme.colors.primary} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Navigation rapide - Design premium */}
            <View style={styles.quickNavigation}>
              <Text style={[styles.quickNavTitle, { 
                color: theme.custom.colors.placeholder,
                fontSize: responsive.isTablet ? 14 : 12 
              }]}>
                NAVIGATION RAPIDE
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickNavContent}
              >
                {QUICK_BOOKS.map((bookName) => (
                  <TouchableOpacity
                    key={bookName}
                    style={[styles.quickNavItem, { 
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.primary + '30' 
                    }]}
                    onPress={() => handleQuickNavigation(bookName)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.quickNavText, { 
                      color: theme.colors.primary,
                      fontSize: responsive.isTablet ? 14 : 12 
                    }]}>
                      {bookName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.content}>
              {!selectedBook ? (
                <>
                  {/* Tabs Testament - Design moderne */}
                  <View style={[styles.tabContainer, { backgroundColor: theme.colors.surface }]}>
                    <TouchableOpacity
                      style={[
                        styles.tab, 
                        activeTab === 'ancien' && { 
                          backgroundColor: theme.colors.primary,
                          elevation: 2,
                          shadowOpacity: 0.1,
                        }
                      ]}
                      onPress={() => {
                        setActiveTab('ancien');
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      activeOpacity={0.9}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          { 
                            color: activeTab === 'ancien' ? 'white' : theme.custom.colors.text,
                            fontSize: responsive.isTablet ? 16 : 14 
                          },
                        ]}
                      >
                        Ancien Testament
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.tab, 
                        activeTab === 'nouveau' && { 
                          backgroundColor: theme.colors.primary,
                          elevation: 2,
                          shadowOpacity: 0.1,
                        }
                      ]}
                      onPress={() => {
                        setActiveTab('nouveau');
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      activeOpacity={0.9}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          { 
                            color: activeTab === 'nouveau' ? 'white' : theme.custom.colors.text,
                            fontSize: responsive.isTablet ? 16 : 14 
                          },
                        ]}
                      >
                        Nouveau Testament
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Liste des livres */}
                  <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {activeTab === 'ancien' ? (
                      <BookSection
                        title="Ancien Testament"
                        books={oldTestamentBooks}
                        onBookSelect={handleBookSelect}
                        selectedBook={selectedBook}
                        theme={theme}
                        responsive={responsive}
                      />
                    ) : (
                      <BookSection
                        title="Nouveau Testament"
                        books={newTestamentBooks}
                        onBookSelect={handleBookSelect}
                        selectedBook={selectedBook}
                        theme={theme}
                        responsive={responsive}
                      />
                    )}
                  </ScrollView>
                </>
              ) : !selectedChapter ? (
                <>
                  {/* Retour aux livres */}
                  <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
                    onPress={() => {
                      setSelectedBook(null);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather name="chevron-left" size={20} color={theme.colors.primary} />
                    <Text style={[styles.backButtonText, { 
                      color: theme.colors.primary,
                      fontSize: responsive.isTablet ? 18 : 16 
                    }]}>
                      Retour aux livres
                    </Text>
                  </TouchableOpacity>

                  {/* Grille chapitres */}
                  <ChapterGrid
                    book={selectedBook}
                    selectedChapter={userProgress.currentChapter || 1}
                    onChapterSelect={handleChapterSelect}
                    onChapterNavigate={handleChapterNavigate}
                    theme={theme}
                    responsive={responsive}
                  />
                </>
              ) : (
                <>
                  {/* Retour aux chapitres */}
                  <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
                    onPress={() => {
                      setSelectedChapter(null);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather name="chevron-left" size={20} color={theme.colors.primary} />
                    <Text style={[styles.backButtonText, { 
                      color: theme.colors.primary,
                      fontSize: responsive.isTablet ? 18 : 16 
                    }]}>
                      Retour aux chapitres
                    </Text>
                  </TouchableOpacity>

                  {/* Grille versets */}
                  <VerseGrid
                    book={selectedBook}
                    chapter={selectedChapter}
                    selectedVerse={userProgress.currentVerse || 1}
                    onVerseSelect={handleVerseSelect}
                    theme={theme}
                    responsive={responsive}
                  />
                </>
              )}
            </View>
          </SafeAreaView>
        </Animated.View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalContent: {
    flex: 1,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 20, fontFamily: 'Nunito_700Bold' },
  headerSubtitle: { 
    fontSize: 12, 
    fontFamily: 'Nunito_400Regular', 
    marginTop: 4,
    opacity: 0.8 
  },
  closeButton: { 
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  // Styles pour les cartes d'information améliorées
  infoSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: { marginLeft: 12, flex: 1 },
  infoLabel: { 
    fontSize: 10, 
    fontFamily: 'Nunito_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoText: { 
    fontSize: 14, 
    fontFamily: 'Nunito_700Bold', 
    marginTop: 2,
  },
  
  // Styles améliorés pour le sélecteur de version (appliqué aux deux cards)
  versionSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    borderWidth: 1,
    minHeight: 70,
  },
  versionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  versionContent: { 
    flex: 1,
    justifyContent: 'center',
  },
  versionLabel: { 
    fontSize: 10, 
    fontFamily: 'Nunito_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  versionTextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    minHeight: 20,
  },
  versionText: { 
    fontSize: 14, 
    fontFamily: 'Nunito_800ExtraBold', 
    lineHeight: 20,
    marginRight: 12,
    flex: 1,
  },
  defaultIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  defaultIndicatorText: {
    fontSize: 8,
    fontFamily: 'Nunito_700Bold',
    color: 'white',
    letterSpacing: 0.3,
  },
  selectorArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },


  quickNavigation: { paddingVertical: 20 },
  quickNavTitle: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quickNavContent: { paddingHorizontal: 20, gap: 12 },
  quickNavItem: { 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  quickNavText: { fontSize: 12, fontFamily: 'Nunito_700Bold' },

  content: { flex: 1 },

  tabContainer: { 
    flexDirection: 'row', 
    marginHorizontal: 20, 
    marginBottom: 20, 
    borderRadius: 16, 
    padding: 6, 
    gap: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tab: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 12,
  },
  tabText: { fontSize: 14, fontFamily: 'Nunito_700Bold' },

  scrollView: { flex: 1 },

  bookSection: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'Nunito_700Bold', marginBottom: 16 },
  booksGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  bookItem: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    minHeight: 80,
    justifyContent: 'center',
  },
  bookName: { fontSize: 15, textAlign: 'center', lineHeight: 20 },
  bookChapters: { fontSize: 11, fontFamily: 'Nunito_400Regular', marginTop: 4 },

  backButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backButtonText: { marginLeft: 8, fontFamily: 'Nunito_700Bold' },

  chapterSection: { flex: 1, paddingHorizontal: 20 },
  chapterHeader: { alignItems: 'center', marginBottom: 20 },
  chapterTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', textAlign: 'center' },
  chapterSubtitle: { 
    fontSize: 12, 
    fontFamily: 'Nunito_400Regular', 
    marginTop: 4,
    textAlign: 'center' 
  },
  chapterScrollView: { flex: 1 },
  chaptersGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  chapterItem: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  chapterNumber: { fontSize: 16, fontFamily: 'Nunito_700Bold' },

  // Styles pour les versets
  verseSection: { flex: 1, paddingHorizontal: 20 },
  verseHeader: { alignItems: 'center', marginBottom: 20 },
  verseTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', textAlign: 'center' },
  verseSubtitle: { 
    fontSize: 12, 
    fontFamily: 'Nunito_400Regular', 
    marginTop: 4,
    textAlign: 'center' 
  },
  verseScrollView: { flex: 1 },
  versesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 6 },
  verseItem: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    marginBottom: 6,
  },
  verseNumber: { fontSize: 14, fontFamily: 'Nunito_700Bold' },
  
  // Style manquant pour le loading
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});