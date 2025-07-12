// src/App.tsx (ou index.tsx selon ton arborescence)

import React from 'react';
import 'react-native-reanimated';
import { Text } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { useFonts, Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import AppNavigator from '../navigation/AppNavigator'; // ajuste le chemin si besoin

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

// 🎨 Thème personnalisé
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#002366',
    accent: '#FFD700',
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
  });

  if (!fontsLoaded) {
    return <Text>Chargement des polices...</Text>;
  }

  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
    </PaperProvider>
  );
}
