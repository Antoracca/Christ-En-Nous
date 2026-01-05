// app/screens/auth/PostEmailChangeScreen.tsx
// VERSION FINALE CORRIGÉE - Navigation sans déconnexion

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Button } from 'react-native-paper';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/context/AuthContext';
import type { RootStackParamList } from '@/navigation/types';
import { useRouter } from 'expo-router';

type PostEmailChangeScreenRouteProp = RouteProp<RootStackParamList, 'PostEmailChange'>;

export default function PostEmailChangeScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { refreshUserProfile } = useAuth(); // Pas de logout !
  
  const route = useRoute<PostEmailChangeScreenRouteProp>();
  const { newEmail } = params;
  
  console.log('✅ PostEmailChangeScreen - Email modifié avec succès:', newEmail);

  // Rafraîchir le profil utilisateur au montage
  useEffect(() => {
    const updateProfile = async () => {
      try {
        // Tenter de rafraîchir le profil (peut échouer si token expiré)
        await refreshUserProfile();
      } catch (error) {
        console.log('Info: Rafraîchissement profil échoué (normal si token expiré)');
      }
    };
    updateProfile();
  }, [refreshUserProfile]);

  const handleProceedToLogin = async () => {
    console.log('🚀 Navigation vers Login avec email pré-rempli');
    
    try {
      // Sauvegarder l'email pour pré-remplissage
      await AsyncStorage.setItem('@prefilledEmail', newEmail);
      
      // Nettoyer les flags de changement d'email
      await AsyncStorage.removeItem('@emailChangeRequest');
      await AsyncStorage.removeItem('@newEmailForLogin');
      
      // Navigation vers Login avec l'email en paramètre
      // Utiliser reset pour nettoyer la pile de navigation
      router.reset({
        index: 0,
        routes: [{ name: 'Login', params: { email: newEmail } }],
      });
      
      console.log('✅ Navigation réussie vers Login');
      
    } catch (error) {
      console.error('❌ Erreur navigation:', error);
      // En cas d'erreur, naviguer quand même
      router.push({ pathname: '/(auth)/login', params: { email: newEmail } });
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.container}>
        {/* Icône de succès */}
        <View style={[styles.iconContainer, { backgroundColor: theme.custom.colors.success + '1A' }]}>
          <MaterialCommunityIcons 
            name="check-decagram" 
            size={80} 
            color={theme.custom.colors.success} 
          />
        </View>

        {/* Titre */}
        <Text style={[styles.title, { color: theme.custom.colors.text }]}>
          Email modifié avec succès ! 🎉
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: theme.custom.colors.placeholder }]}>
          Votre adresse email a été mise à jour. Pour des raisons de sécurité, vous devez vous reconnecter avec votre nouvelle adresse.
        </Text>

        {/* Affichage du nouvel email */}
        <View style={[styles.emailContainer, { backgroundColor: theme.colors.surface }]}>
          <Feather name="mail" size={20} color={theme.colors.primary} />
          <View style={styles.emailTextContainer}>
            <Text style={[styles.emailLabel, { color: theme.custom.colors.placeholder }]}>
              Nouvelle adresse email :
            </Text>
            <Text style={[styles.emailText, { color: theme.custom.colors.text }]}>
              {newEmail}
            </Text>
          </View>
        </View>

        {/* Note importante */}
        <View style={[styles.infoContainer, { backgroundColor: theme.colors.primary + '10' }]}>
          <Feather name="info" size={18} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.primary }]}>
            Utilisez cette nouvelle adresse email et votre mot de passe habituel pour vous connecter.
          </Text>
        </View>

        {/* Bouton de reconnexion */}
        <Button
          mode="contained"
          onPress={handleProceedToLogin}
          style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Se reconnecter
        </Button>

        {/* Lien d'aide */}
        <Text style={[styles.helpText, { color: theme.custom.colors.placeholder }]}>
          Besoin d&apos;aide ? Contactez{' '}
          <Text style={[styles.supportEmail, { color: theme.colors.primary }]}>
            teamsupport@christennous.com
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1 
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    width: '100%',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  emailTextContainer: {
    flex: 1,
  },
  emailLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    width: '100%',
    marginBottom: 32,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    flex: 1,
    lineHeight: 20,
  },
  loginButton: {
    width: '100%',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    marginTop: 24,
  },
  supportEmail: {
    fontFamily: 'Nunito_600SemiBold',
    textDecorationLine: 'underline',
  },
});
