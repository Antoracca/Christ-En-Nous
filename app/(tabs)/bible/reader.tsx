// app/screens/bible/BibleReaderScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBible } from '@/context/EnhancedBibleContext';
import { useResponsiveSafe } from '@/context/ResponsiveContext';
import { progress } from '@/services/bible/tracking/progressTracking';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import BibleReader from './BibleReader';
import BibleNavigation from './BibleNavigation';
import BibleSearch from './BibleSearch';
import BibleProgressModal from './BibleProgressModal';
import AIModalScreen from './AIModalScreen';

export default function BibleReaderScreen() {
  const theme = useAppTheme();
  const responsive = useResponsiveSafe();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { navigateToChapter } = useBible();
  const tabBarHeight = useBottomTabBarHeight();

  const { verse } = (params as any) || {};
  const [showNavigation, setShowNavigation] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [currentTargetVerse, setCurrentTargetVerse] = useState<number | undefined>(verse);

  useEffect(() => {
    if (currentTargetVerse) {
      const t = setTimeout(() => setCurrentTargetVerse(undefined), 2000);
      return () => clearTimeout(t);
    }
  }, [currentTargetVerse]);

  // Focus/Unfocus : reprendre le timer au focus, arrêter au blur
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(theme.dark ? 'light-content' : 'dark-content');
      // Reprendre automatiquement le timer si une session existe déjà
      const activeSession = progress.getActiveSession();
      if (activeSession) {
        try { 
          progress.switchTo(activeSession.ref.bookId, activeSession.ref.chapter);
          console.log('\u{1F503} Focus BibleReader - timer repris:', activeSession.ref.bookId, activeSession.ref.chapter);
        } catch (err) {
          console.error('Erreur reprise timer au focus:', err);
        }
      }
      return () => {
        try { progress.pause(); } catch {}
        progress.persist?.().catch(() => {});
      };
    }, [theme.dark])
  );

  const handleNavigationPress = () => setShowNavigation(true);
  const handleSearchPress = () => {
    console.log('🔍 [Reader] Loupe cliquée, ouverture du modal...');
    setShowSearch(true);
  };
  const handleProgressPress = () => setShowProgress(true);
  const handleAiPress = () => setShowAiAssistant(true);

  const handleNavigateToVerse = useCallback(
    async (reference: { book: string; chapter: number; verse?: number }) => {
      try {
        setShowSearch(false);
        setCurrentTargetVerse(undefined);
        await navigateToChapter({
          book: reference.book, chapter: reference.chapter,
          end: undefined
        });
        if (reference.verse) setTimeout(() => setCurrentTargetVerse(reference.verse), 100);
      } catch (error) {
        console.error('Navigation vers verset — erreur:', error);
      }
    },
    [navigateToChapter]
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingHorizontal: responsive.isTablet ? responsive.spacing.md : 0,
          paddingBottom: tabBarHeight + 38,
        },
      ]}
    >
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <BibleReader
        onNavigationPress={handleNavigationPress}
        onSearchPress={handleSearchPress}
        onProgressPress={handleProgressPress}
        onSettingsPress={() => router.push('/bible/reader-settings')}
        onAiPress={handleAiPress}
        targetVerse={currentTargetVerse}
      />

      <BibleNavigation visible={showNavigation} onClose={() => setShowNavigation(false)} />

      <BibleSearch
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        onNavigateToVerse={handleNavigateToVerse}
      />

      <BibleProgressModal visible={showProgress} onClose={() => setShowProgress(false)} />
      
      <AIModalScreen visible={showAiAssistant} onClose={() => setShowAiAssistant(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
