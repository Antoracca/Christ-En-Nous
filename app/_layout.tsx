// app/_layout.tsx - ROOT LAYOUT EXPO ROUTER
import React, { useCallback, useState, useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import 'react-native-reanimated';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from './context/ThemeContext';
import { ResponsiveProvider } from './context/ResponsiveContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import UniversalSplashScreen from './components/UniversalSplashScreen';
import { Provider as PaperProvider } from 'react-native-paper';

SplashScreen.preventAutoHideAsync();

// Composant interne pour gérer la navigation auth
function RootLayoutNav() {
  const { isAuthenticated, loading: authLoading, shouldShowRegisterSuccess, isRegistering } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // ⚠️ Sur web, ne pas gérer la navigation ici - c'est géré par (web)/_layout
    if (Platform.OS === 'web') {
      console.log('🌐 [RootLayoutNav] Web platform - skipping auth navigation logic');
      return;
    }

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
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <ThemeProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          {isSplashAnimationFinished ? (
            <ResponsiveProvider>
              <AuthProvider>
                <RootLayoutNav />
              </AuthProvider>
            </ResponsiveProvider>
          ) : (
            <UniversalSplashScreen
              onAnimationEnd={() => setIsSplashAnimationFinished(true)}
            />
          )}
        </View>
      </ThemeProvider>
    </PaperProvider>
  );
}
