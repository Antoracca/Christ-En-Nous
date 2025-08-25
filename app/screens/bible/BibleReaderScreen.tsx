// app/screens/bible/BibleReaderScreen.tsx
import React, { useState, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar, 
  Platform 
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBible } from '@/context/EnhancedBibleContext';
import { useResponsiveSafe } from '@/context/ResponsiveContext';

// Composants Bible dans le même dossier
import BibleReader from './BibleReader';
import BibleNavigation from './BibleNavigation';
import BibleSearch from './BibleSearch';

// Composant principal de l'écran de lecture de Bible
export default function BibleReaderScreen() {
  const theme = useAppTheme();
  const responsive = useResponsiveSafe();
  const navigation = useNavigation();
  const { bibleBooks } = useBible();
  
  // États locaux
  const [showNavigation, setShowNavigation] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Focus sur l'écran
  useFocusEffect(
    useCallback(() => {
      // Mettre à jour la barre de statut quand l'écran est focus
      StatusBar.setBarStyle(
        theme.dark ? 'light-content' : 'dark-content'
      );
      // TODO: Réinitialiser les résultats de recherche
      console.log('Focus sur BibleReaderScreen');
    }, [theme.dark])
  );

  // Handlers avec responsivité
  const handleNavigationPress = () => {
    setShowNavigation(true);
  };

  const handleSearchPress = () => {
    setShowSearch(true);
  };

  const handleSettingsPress = () => {
    // Navigation vers l'écran de paramètres
    navigation.navigate('BibleReaderSettings' as never);
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.colors.background,
        // Responsive padding pour tablettes
        paddingHorizontal: responsive.isTablet ? responsive.spacing.md : 0,
      }
    ]}>
      <StatusBar 
        barStyle={theme.dark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
        translucent={false}
      />
      
      <BibleReader
        onNavigationPress={handleNavigationPress}
        onSearchPress={handleSearchPress}
        onSettingsPress={handleSettingsPress}
      />

      <BibleNavigation
        visible={showNavigation}
        onClose={() => setShowNavigation(false)}
      />

      <BibleSearch
        visible={showSearch}
        onClose={() => setShowSearch(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});