// app/_layout.tsx - ROOT LAYOUT EXPO ROUTER
import React, { useCallback, useState, useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import 'react-native-reanimated';
import { View } from 'react-native';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
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
    console.log('🔍 [RootLayoutNav] Auth State:', {
      authLoading,
      isAuthenticated,
      isRegistering,
      segments: segments.join('/'),
      shouldShowRegisterSuccess
    });

    if (authLoading) {
      console.log('⏳ [RootLayoutNav] Waiting for auth to load...');
      return;
    }

    // Gestion RegisterSuccess
    if (shouldShowRegisterSuccess?.show) {
      console.log('✅ [RootLayoutNav] Redirecting to register-success');
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
      console.log('🔐 [RootLayoutNav] Not authenticated, redirecting to login');
      router.replace('/(auth)/login');
    } else if (isAuthenticated && !isRegistering && inAuthGroup) {
      // User authentifié dans auth screens → Rediriger vers app
      console.log('🏠 [RootLayoutNav] Authenticated, redirecting to tabs');
      router.replace('/(tabs)');
    } else {
      console.log('✨ [RootLayoutNav] No redirect needed, current state is correct');
    }
  }, [isAuthenticated, authLoading, segments, isRegistering, shouldShowRegisterSuccess, router]);

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
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
