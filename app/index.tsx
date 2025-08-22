// app/index.tsx - VERSION MISE À JOUR

import React, { useCallback, useState } from 'react'; // Ajoutez useState
import 'react-native-reanimated';
import { View, useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { useFonts, Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from '../navigation/AppNavigator';
import { AuthProvider } from '../app/context/AuthContext';
import { ThemeProvider } from '../app/context/ThemeContext';
import { LightAppTheme, DarkAppTheme } from '../app/constants/theme';
import AnimatedSplashScreen from '../app/components/AnimatedSplashScreen'; // <-- 1. Importez le nouveau composant

SplashScreen.preventAutoHideAsync();

// ... (le patch pour console.warn reste le même)

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
  });
  
  // 2. Ajoutez un état pour savoir quand l'animation est terminée
  const [isSplashAnimationFinished, setIsSplashAnimationFinished] = useState(false);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        {/* 3. Affichez l'animation ou l'application en fonction de l'état */}
        {isSplashAnimationFinished ? (
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        ) : (
          <AnimatedSplashScreen 
            onAnimationEnd={() => setIsSplashAnimationFinished(true)} 
          />
        )}
      </View>
    </ThemeProvider>
  );
}