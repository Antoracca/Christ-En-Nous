// app/(modals)/_layout.tsx - MODALS LAYOUT
import { Stack } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function ModalsLayout() {
  const theme = useAppTheme();

  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTitleStyle: {
          fontFamily: 'Nunito_700Bold',
          color: theme.custom.colors.text,
        },
        headerTintColor: theme.custom.colors.text,
      }}
    >
      <Stack.Screen
        name="modifier-profil"
        options={{ title: 'Modifier mon profil' }}
      />
      <Stack.Screen
        name="security"
        options={{ title: 'Sécurité et confidentialité' }}
      />
    </Stack>
  );
}
