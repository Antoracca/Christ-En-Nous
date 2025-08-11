// app/index.tsx - VERSION MISE À JOUR ET CORRIGÉE
import React from 'react';
import 'react-native-reanimated';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { useFonts, Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import AppNavigator from '../navigation/AppNavigator';
import { AuthProvider } from '../app/context/AuthContext'; // Correction du chemin
import { LightAppTheme, DarkAppTheme } from '../app/constants/theme'; // On importe nos deux thèmes

// 🔇 Patch pour filtrer les erreurs de mesure React Native Paper
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    message.includes('Error measuring text field')
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

export default function App() {
  const colorScheme = useColorScheme(); // Détecte le thème du système (light/dark)

  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
  });

  // Sélectionne le bon thème en fonction du système
  const theme = colorScheme === 'dark' ? DarkAppTheme : LightAppTheme;

  if (!fontsLoaded) {
    // Un loader qui respecte le thème
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background}}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    // On passe le thème dynamique (clair ou sombre) à PaperProvider
    <PaperProvider theme={theme}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}
