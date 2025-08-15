import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import LoginScreen from '@/screens/auth/login';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import RegisterSuccessScreen from '@/screens/auth/RegisterSuccessScreen';
import ForgotPasswordScreen from '@/screens/auth/forgotPassword';
import MainNavigator from './MainNavigator';
import ModifierProfilScreen from '@/screens/profile/ModifierProfilScreen';


export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  RegisterSuccess: { userName: string; userEmail: string };
  ForgotPassword: undefined;
  ModifierProfil: undefined;
  
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { 
    isAuthenticated, 
    loading,
    shouldShowRegisterSuccess,
    isRegistering
  } = useAuth();
  
  const theme = useAppTheme();

  if (loading && !isRegistering) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {shouldShowRegisterSuccess?.show ? (
          <Stack.Screen 
            name="RegisterSuccess" 
            component={RegisterSuccessScreen}
            initialParams={{
              userName: shouldShowRegisterSuccess.userName,
              userEmail: shouldShowRegisterSuccess.userEmail
            }}
            options={{
              animation: 'slide_from_right',
              presentation: 'transparentModal',
              gestureEnabled: false,
            }}
          />
        ) : isAuthenticated && !isRegistering ? (
          // --- DÉBUT DE LA CORRECTION ---
          // 3. Ajouter l'écran au groupe des écrans accessibles après connexion
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen 
              name="ModifierProfil" 
              component={ModifierProfilScreen} 
              options={{
                headerShown: true, // On veut un en-tête pour cet écran
                title: 'Modifier le profil',
                headerStyle: {
                  backgroundColor: theme.colors.surface,
                },
                headerTitleStyle: {
                  fontFamily: 'Nunito_700Bold',
                  color: theme.custom.colors.text,
                },
                headerTintColor: theme.custom.colors.text,
              }}
            />
          </>
          // --- FIN DE LA CORRECTION ---
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
