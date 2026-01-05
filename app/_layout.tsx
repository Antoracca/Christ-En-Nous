// app/_layout.tsx - ROOT LAYOUT EXPO ROUTER
import React, { useCallback, useState, useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import 'react-native-reanimated';
import { View } from 'react-native';
import { useFonts, Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from './context/ThemeContext';
import { ResponsiveProvider } from './context/ResponsiveContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EnhancedBibleProvider } from './context/EnhancedBibleContext';
import { ReadingSettingsProvider } from './context/ReadingSettingsContext';
import { HomeMenuProvider } from './context/HomeMenuContext';
import UniversalSplashScreen from './components/UniversalSplashScreen';

SplashScreen.preventAutoHideAsync();

// Composant interne pour gérer la navigation auth
function RootLayoutNav() {
  const { isAuthenticated, loading: authLoading, shouldShowRegisterSuccess, isRegistering } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    // Gestion RegisterSuccess
    if (shouldShowRegisterSuccess?.show) {
      router.replace({
        pathname: '/(auth)/register-success',
        params: {
          userName: shouldShowRegisterSuccess.userName || '',
          userEmail: shouldShowRegisterSuccess.userEmail || '',
        },
      });
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !isRegistering && !inAuthGroup) {
      // User non authentifié → Rediriger vers login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && !isRegistering && inAuthGroup) {
      // User authentifié dans auth screens → Rediriger vers app
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, authLoading, segments, isRegistering, shouldShowRegisterSuccess]);

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
  });

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
        {isSplashAnimationFinished ? (
          <ResponsiveProvider>
            <AuthProvider>
              <EnhancedBibleProvider>
                <ReadingSettingsProvider>
                  <HomeMenuProvider>
                    <RootLayoutNav />
                  </HomeMenuProvider>
                </ReadingSettingsProvider>
              </EnhancedBibleProvider>
            </AuthProvider>
          </ResponsiveProvider>
        ) : (
          <UniversalSplashScreen
            onAnimationEnd={() => setIsSplashAnimationFinished(true)}
          />
        )}
      </View>
    </ThemeProvider>
  );
}
