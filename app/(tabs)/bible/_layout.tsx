// app/(tabs)/bible/_layout.tsx - BIBLE STACK LAYOUT
import { Stack } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function BibleLayout() {
  const theme = useAppTheme();

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
