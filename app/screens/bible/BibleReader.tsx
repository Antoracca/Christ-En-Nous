// app/screens/bible/BibleReader.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBible } from '@/context/EnhancedBibleContext';
import { useResponsiveSafe } from '@/context/ResponsiveContext';
import { progress } from '@/services/bible/tracking/progressTracking';

interface BibleReaderProps {
  onNavigationPress: () => void;
  onSearchPress: () => void;
  onProgressPress: () => void;
  onSettingsPress: () => void;
  onAiPress: () => void;
  targetVerse?: number;
}

export default function BibleReader({
  onNavigationPress,
  onSearchPress,
  onProgressPress,
  onSettingsPress,
  onAiPress,
  targetVerse,
}: BibleReaderProps) {
  const theme = useAppTheme();
  const responsive = useResponsiveSafe();
  const {
    bibleBooks,
    currentVersion,
    userProgress,
    currentChapter,
    navigateToChapter,
    goToNextChapter,
    goToPreviousChapter,
    loading,
    error,
  } = useBible();

  const [isInitializing, setIsInitializing] = useState(true);
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const highlightAnimation = useRef(new Animated.Value(0)).current;
  const containerHeight = useRef(0);
  const verseRefs = useRef<Map<number, any>>(new Map());
  const versePositionsRef = useRef<Map<number, { y: number; height: number }>>(new Map());
  const swipeX = useRef(new Animated.Value(0)).current;

  // Boot minimal: si rien n'est chargé, on commence à Gen 1 (le Provider démarre le tracking)
  useEffect(() => {
    const init = async () => {
      try {
        if (!currentChapter && !userProgress.currentBook) {
          await navigateToChapter({ book: 'GEN', chapter: 1 });
        }
      } catch (err) {
        console.error('Init BibleReader:', err);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [currentChapter, userProgress.currentBook, navigateToChapter]);

  // Timer automatique : démarre le tracking dès qu'un chapitre est chargé
  useEffect(() => {
    if (currentChapter && !loading) {
      try {
        progress.switchTo(currentChapter.book, currentChapter.chapter);
        console.log('🔄 Timer automatique démarré pour:', currentChapter.book, currentChapter.chapter);
      } catch (err) {
        console.error('Erreur démarrage timer:', err);
      }
    }
  }, [currentChapter?.book, currentChapter?.chapter, loading, currentChapter]);

  // Nettoyage des refs à chaque nouveau chapitre + repositionnement du scroll
  useEffect(() => {
    verseRefs.current.clear();
    versePositionsRef.current.clear();
    
    // ✅ NOUVEAU: Repositionner le scroll au début pour chaque nouveau chapitre
    if (scrollViewRef.current && currentChapter) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }, 100);
    }
  }, [currentChapter?.book, currentChapter?.chapter, currentChapter]);

  // Mesure + scroll + highlight
  const measureVerseInScrollView = useCallback(
    (verseNumber: number, callback: (scrollPosition: number) => void) => {
      if (!currentChapter || !scrollViewRef.current) {
        callback(0);
        return;
      }
      const verseRef = verseRefs.current.get(verseNumber);
      if (!verseRef) {
        callback(0);
        return;
      }
      try {
        verseRef.measureLayout(
          scrollViewRef.current as any,
          (x: number, y: number, width: number, height: number) => {
            const screenHeight = containerHeight.current || 600;
            const optimalPosition = Math.max(0, y + height / 2 - screenHeight / 2);
            callback(optimalPosition);
          },
          () => {
            const idx = currentChapter.verses.findIndex(v => v.verse === verseNumber);
            callback(Math.max(0, idx * 100));
          }
        );
      } catch {
        const idx = currentChapter.verses.findIndex(v => v.verse === verseNumber);
        callback(Math.max(0, idx * 100));
      }
    },
    [currentChapter]
  );

  const scrollToVerseAndHighlight = useCallback(
    (verseNumber: number) => {
      if (!currentChapter || !currentChapter.verses.find(v => v.verse === verseNumber)) return;
      setHighlightedVerse(null);
      highlightAnimation.stopAnimation();
      highlightAnimation.setValue(0);
      requestAnimationFrame(() => {
        setTimeout(() => {
          measureVerseInScrollView(verseNumber, scrollPosition => {
            scrollViewRef.current?.scrollTo({ y: scrollPosition, animated: true });
            setTimeout(() => {
              setHighlightedVerse(verseNumber);
              Animated.sequence([
                Animated.timing(highlightAnimation, { toValue: 1, duration: 600, useNativeDriver: false }),
                Animated.timing(highlightAnimation, { toValue: 0.1, duration: 500, useNativeDriver: false }),
                Animated.timing(highlightAnimation, { toValue: 1, duration: 600, useNativeDriver: false }),
                Animated.timing(highlightAnimation, { toValue: 0.1, duration: 500, useNativeDriver: false }),
                Animated.timing(highlightAnimation, { toValue: 1, duration: 600, useNativeDriver: false }),
                Animated.timing(highlightAnimation, { toValue: 0, duration: 800, useNativeDriver: false }),
              ]).start(() => setHighlightedVerse(null));
            }, 800);
          });
        }, 100);
      });
    },
    [currentChapter, highlightAnimation, measureVerseInScrollView]
  );

  useEffect(() => {
    if (targetVerse && currentChapter && !loading && currentChapter.verses.length > 0) {
      setTimeout(() => {
        scrollToVerseAndHighlight(targetVerse);
      }, 200);
    }
  }, [targetVerse, currentChapter?.id, loading, scrollToVerseAndHighlight, currentChapter]);

  // Gestures: on laisse le Provider gérer la complétion du chapitre au "Suivant"
  const handleSwipe = Animated.event([{ nativeEvent: { translationX: swipeX } }], { useNativeDriver: false });

  const handleSwipeStateChange = useCallback(
    async (event: any) => {
      if (event.nativeEvent.state === State.END) {
        const { translationX, velocityX } = event.nativeEvent;
        if (Math.abs(translationX) > 100 || Math.abs(velocityX) > 500) {
          if (translationX > 0) {
            // ← vers chapitre précédent (pas de completeChapter ici)
            goToPreviousChapter();
          } else {
            // → vers chapitre suivant (le Provider fera completeChapter)
            goToNextChapter();
          }
        }
        Animated.spring(swipeX, { toValue: 0, useNativeDriver: false }).start();
      }
    },
    [goToNextChapter, goToPreviousChapter, swipeX]
  );

  // Supprimé: ancien système de suivi automatique des versets

  // Supprimé: ancien système onScroll qui trackait automatiquement les versets

  if (isInitializing || loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity onPress={onNavigationPress} style={styles.headerButton}>
            <Feather name="book-open" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.custom.colors.text }]}>Bible</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={onSearchPress} style={styles.headerButton}>
              <Feather name="search" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onAiPress} style={[styles.headerButton, styles.aiButton]}>
              <Feather name="cpu" size={16} color={theme.colors.secondary} />
              <Text style={[styles.aiButtonText, { color: theme.colors.secondary }]}>ᴬᴵ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onProgressPress} style={styles.headerButton}>
              <Feather name="trending-up" size={20} color={theme.colors.primary} />
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

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity onPress={onNavigationPress} style={styles.headerButton}>
            <Feather name="book-open" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.custom.colors.text }]}>Bible</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={onSearchPress} style={styles.headerButton}>
              <Feather name="search" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onAiPress} style={[styles.headerButton, styles.aiButton]}>
              <Feather name="cpu" size={16} color={theme.colors.secondary} />
              <Text style={[styles.aiButtonText, { color: theme.colors.secondary }]}>ᴬᴵ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onProgressPress} style={styles.headerButton}>
              <Feather name="trending-up" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onSettingsPress} style={styles.headerButton}>
              <Feather name="settings" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.centerContent}>
          <Feather name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={[styles.emptyText, { color: theme.colors.error, marginTop: 16 }]}>{error}</Text>
          <TouchableOpacity
            onPress={() => navigateToChapter({ book: 'GEN', chapter: 1 })}
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={[styles.retryButtonText, { color: 'white' }]}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getBookName = (osisCode: string) => {
    const book = bibleBooks.find(b => b.id === osisCode.toLowerCase());
    return book?.name || osisCode;
  };

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            paddingHorizontal: responsive.isTablet ? responsive.spacing.md : responsive.spacing.sm,
          },
        ]}
      >
        <TouchableOpacity onPress={onNavigationPress} style={styles.headerButton}>
          <Feather name="book-open" size={20} color={theme.colors.primary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.custom.colors.text }]}>
            {currentChapter ? `${getBookName(currentChapter.book)} ${currentChapter.chapter}` : 'Bible'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onSearchPress} style={styles.headerButton}>
            <Feather name="search" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onAiPress} style={styles.headerButton}>
            <Text style={[styles.aiButtonText, { color: theme.colors.secondary }]}>AI</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onProgressPress} style={styles.headerButton}>
            <Feather name="trending-up" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onSettingsPress} style={styles.headerButton}>
            <Feather name="settings" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <PanGestureHandler
        onGestureEvent={handleSwipe}
        onHandlerStateChange={handleSwipeStateChange}
        simultaneousHandlers={scrollViewRef}
        shouldCancelWhenOutside={true}
        minPointers={1}
        maxPointers={1}
        avgTouches={true}
        activeOffsetX={[-30, 30]}
        failOffsetY={[-20, 20]}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: responsive.isTablet ? responsive.spacing.lg : responsive.spacing.md },
          ]}
          showsVerticalScrollIndicator={true}
          onLayout={event => {
            const { height } = event.nativeEvent.layout;
            containerHeight.current = height;
          }}
          // Supprimé: onScroll automatique - validation uniquement sur "Suivant"
        >
          {currentChapter && currentChapter.verses ? (
            currentChapter.verses.map(verse => {
              const isHighlighted = highlightedVerse === verse.verse;
              const animatedBackgroundColor = isHighlighted
                ? highlightAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [theme.colors.surface, theme.colors.primary + '30'],
                  })
                : theme.colors.surface;

              return (
                <Animated.View
                  key={`${verse.book}-${verse.chapter}-${verse.verse}`}
                  ref={ref => {
                    verseRefs.current.set(verse.verse, ref);
                  }}
                  style={[
                    styles.verseContainer,
                    {
                      backgroundColor: animatedBackgroundColor as any,
                      borderColor:
                        isHighlighted
                          ? theme.colors.primary + '50'
                          : theme.custom?.colors?.border + '20' || 'rgba(0,0,0,0.1)',
                      borderWidth: isHighlighted ? 2 : 1,
                    },
                  ]}
                  onLayout={() => {
                    const ref = verseRefs.current.get(verse.verse);
                    if (ref && scrollViewRef.current) {
                      try {
                        ref.measureLayout(
                          scrollViewRef.current as any,
                          (x: number, y: number, w: number, h: number) => {
                            versePositionsRef.current.set(verse.verse, { y, height: h });
                          },
                          () => {}
                        );
                      } catch {}
                    }
                  }}
                >
                  <Text style={[styles.verseNumber, { color: theme.colors.primary }]}>{verse.verse}</Text>
                  <Text
                    style={[
                      styles.verseText,
                      { color: theme.custom.colors.text, fontWeight: isHighlighted ? '600' : 'normal' },
                    ]}
                  >
                    {verse.text}
                  </Text>
                </Animated.View>
              );
            })
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={[styles.placeholderText, { color: theme.custom.colors.placeholder }]}>Aucun verset disponible</Text>
              <Text style={[styles.placeholderSubText, { color: theme.custom.colors.placeholder }]}>
                Version: {currentVersion.name}
              </Text>
            </View>
          )}

          {currentChapter && (
            <View style={[styles.chapterNavigation, { backgroundColor: theme.colors.surface }]}>
              <TouchableOpacity
                style={[styles.navButton, styles.prevButton]}
                onPress={() => {
                  // Précédent (aucune complétion ici)
                  goToPreviousChapter();
                }}
                activeOpacity={0.7}
              >
                <Feather name="chevron-left" size={20} color={theme.colors.primary} />
                <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>Précédent</Text>
              </TouchableOpacity>

              <View style={styles.navCenter}>
                <Text style={[styles.chapterInfo, { color: theme.custom.colors.placeholder }]}>
                  {getBookName(currentChapter.book)} {currentChapter.chapter}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={() => {
                  // ✅ NOUVEAU: Déléguer la validation complète au Provider
                  goToNextChapter();
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>Suivant</Text>
                <Feather name="chevron-right" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  headerButton: { padding: 8 },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  aiButtonText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    fontWeight: 'bold',
  },
  headerCenter: { flex: 1, alignItems: 'center', marginHorizontal: 16 },
  headerTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold' },
  headerActions: { flexDirection: 'row' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, fontFamily: 'Nunito_400Regular', textAlign: 'center', lineHeight: 24 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
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
  verseText: { flex: 1, fontSize: 16, fontFamily: 'Nunito_400Regular', lineHeight: 24 },
  placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  placeholderText: { fontSize: 18, fontFamily: 'Nunito_700Bold', textAlign: 'center', marginBottom: 8 },
  placeholderSubText: { fontSize: 14, fontFamily: 'Nunito_400Regular', textAlign: 'center', marginBottom: 4 },
  retryButton: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { fontSize: 16, fontFamily: 'Nunito_700Bold', textAlign: 'center' },
  chapterNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
    marginTop: 16,
  },
  navButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  prevButton: { flex: 1, justifyContent: 'flex-start' },
  nextButton: { flex: 1, justifyContent: 'flex-end' },
  navButtonText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', marginHorizontal: 4 },
  navCenter: { flex: 1, alignItems: 'center' },
  chapterInfo: { fontSize: 12, fontFamily: 'Nunito_500Medium' },
});