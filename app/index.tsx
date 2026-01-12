// app/index.tsx - Redirection selon la plateforme
import { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers (web) sur navigateur, sinon vers (tabs) sur mobile
    if (Platform.OS === 'web') {
      router.replace('/(web)');
    } else {
      // La logique mobile reste gérée par RootLayoutNav dans _layout.tsx
    }
  }, []);

  return <View style={{ flex: 1, backgroundColor: '#ffffff' }} />;
}
