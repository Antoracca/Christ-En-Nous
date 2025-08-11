// navigation/AppNavigator.tsx - VERSION AVEC GESTION DU MODAL
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
import SuccessModal from '@/components/register/SuccessModal'; // Importez le modal ici

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
      postRegistrationSuccess, 
      setPostRegistrationSuccess, 
      userProfile 
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
        {isAuthenticated && !postRegistrationSuccess ? (
          // Si l'utilisateur est connecté ET que l'inscription n'est pas en cours, on montre l'app
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          // Sinon, on montre les écrans d'authentification
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>

      {/* Le Modal est rendu ici, par-dessus toute la navigation */}
      <SuccessModal
        visible={postRegistrationSuccess}
        userName={userProfile?.prenom}
        onContinue={() => {
          setPostRegistrationSuccess(false);
          // Pas besoin de naviguer, le re-render de AppNavigator s'en chargera
        }}
      />
    </NavigationContainer>
  );
}
