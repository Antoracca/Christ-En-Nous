// app/(tabs)/bible/_layout.tsx - BIBLE STACK LAYOUT
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBible } from '@/context/EnhancedBibleContext';

export default function BibleLayout() {
  const theme = useAppTheme();
  const { initialize, isInitialized } = useBible();

  // ✅ LAZY INIT : On ne charge la Bible que quand l'utilisateur entre ici
  useEffect(() => {
    if (!isInitialized) {
      console.log('📖 Entrée dans la section Bible -> Démarrage des services...');
      initialize();
    }
  }, []);

  // ⏳ PROTECTION : Tant que le service n'est pas prêt, on affiche un loader
  // Cela évite l'erreur "BibleService must be initialized before use" dans les écrans enfants
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        animation: 'slide_from_right',
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: {
          color: theme.custom.colors.text,
          fontFamily: 'Nunito_700Bold',
        },
        headerTintColor: theme.colors.primary,
        headerBackTitle: 'Retour',
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Accueil Bible' }}
      />
      <Stack.Screen
        name="reader"
        options={{ title: 'Lecture de la Bible' }}
      />
      <Stack.Screen
        name="search"
        options={{ title: 'Recherche Biblique' }}
      />
      <Stack.Screen
        name="version-selector"
        options={{ title: 'Choisir votre version' }}
      />
      <Stack.Screen
        name="reader-settings"
        options={{ title: 'Paramètres de lecture' }}
      />
      <Stack.Screen
        name="meditation"
        options={{ title: 'Méditation' }}
      />
      <Stack.Screen
        name="meditation-settings"
        options={{ title: 'Paramètres de méditation' }}
      />
      <Stack.Screen
        name="learning"
        options={{ title: 'Apprentissage' }}
      />
      <Stack.Screen
        name="plan"
        options={{ title: 'Plan de lecture' }}
      />
      <Stack.Screen
        name="settings"
        options={{ title: 'Paramètres Bible' }}
      />
    </Stack>
  );
}
