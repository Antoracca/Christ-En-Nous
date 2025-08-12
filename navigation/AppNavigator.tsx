// navigation/AppNavigator.tsx - VERSION CORRIGÉE
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

// Hooks et Context
import { useAuth } from '@/context/AuthContext';

// Écrans
import LoginScreen from '@/screens/auth/login';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@/screens/auth/forgotPassword';
import MainNavigator from './MainNavigator';

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { 
    isAuthenticated, 
    loading,
    isRegistering  // ✅ AJOUT: Récupération du flag isRegistering
  } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {isAuthenticated && !isRegistering ? (
          // ✅ Navigation vers Main SEULEMENT si connecté ET pas en cours d'inscription
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          // Écrans d'authentification
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