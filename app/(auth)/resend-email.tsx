// app/screens/auth/ResendEmailScreen.tsx
// 📧 Écran de renvoi d'email de vérification
// Version 1.0 - Intégré avec l'API email existante

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar, 
  ActivityIndicator, Alert, TouchableOpacity, ScrollView
} from 'react-native';
import { Button } from 'react-native-paper';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Hooks et services
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { sendCustomVerificationEmail } from 'services/email/emailService';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from 'services/firebase/firebaseConfig';

// =================================================================
// COMPOSANT PRINCIPAL
// =================================================================

export default function ResendEmailScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // =================================================================
  // FONCTION D'ENVOI D'EMAIL
  // =================================================================
  
  const handleResendEmail = async () => {
    if (!user || !userProfile) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    setLoading(true);
    try {
      // Méthode 1: Essayer d'abord le service email custom (template personnalisé)
      console.log('🎯 Tentative d\'envoi via le service email custom...');
      const customSuccess = await sendCustomVerificationEmail({
        userId: user.uid,
        email: user.email || '',
        prenom: userProfile.prenom || '',
        nom: userProfile.nom || '',
      });

      if (customSuccess) {
        setEmailSent(true);
        Alert.alert(
          'Email envoyé !', 
          'Un nouveau lien de vérification a été envoyé à votre adresse email. Vérifiez votre boîte de réception et vos spams.'
        );
        return;
      }

      // Méthode 2: Fallback avec Firebase (email standard)
      console.log('⚠️ Service custom échoué, tentative avec Firebase...');
      await sendEmailVerification(user);
      
      setEmailSent(true);
      Alert.alert(
        'Email envoyé !', 
        'Un lien de vérification a été envoyé à votre adresse email. Vérifiez votre boîte de réception et vos spams.'
      );

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi (toutes méthodes):', error);
      Alert.alert(
        'Erreur', 
        'Impossible d\'envoyer l\'email de vérification. Vérifiez votre connexion internet ou contactez le support.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header avec bouton retour */}
      <View style={[styles.header, { borderBottomColor: theme.colors.outline }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color={theme.custom.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.custom.colors.text }]}>
          Vérification email
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Contenu principal */}
      <View style={styles.mainContent}>
        {/* Icône principale */}
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '1A' }]}>
          <MaterialCommunityIcons 
            name={emailSent ? "email-check" : "email-outline"} 
            size={50} 
            color={emailSent ? '#10B981' : theme.colors.primary} 
          />
        </View>

        {/* Titre principal */}
        <Text style={[styles.title, { color: theme.custom.colors.text }]}>
          {emailSent ? 'Email envoyé !' : 'Vérifiez votre email'}
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: theme.custom.colors.placeholder }]}>
          {emailSent 
            ? 'Un nouveau lien de vérification a été envoyé à votre adresse email.'
            : 'Un email de vérification va être envoyé à l\'adresse suivante :'
          }
        </Text>

        {/* Adresse email */}
        <View style={[styles.emailContainer, { backgroundColor: theme.colors.surface }]}>
          <Feather name="mail" size={18} color={theme.colors.primary} />
          <Text style={[styles.emailText, { color: theme.custom.colors.text }]}>
            {user?.email}
          </Text>
        </View>
      </View>

      {/* Zone du milieu - flexible */}
      <View style={styles.middleContent}>
        {emailSent ? (
          /* Instructions après envoi */
          <View style={styles.instructionsContainer}>
            <Text style={[styles.instructionsTitle, { color: theme.custom.colors.text }]}>
              Étapes suivantes :
            </Text>
            <View style={styles.instructionItem}>
              <Text style={[styles.instructionNumber, { color: theme.colors.primary }]}>1.</Text>
              <Text style={[styles.instructionText, { color: theme.custom.colors.placeholder }]}>
                Vérifiez votre boîte de réception
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={[styles.instructionNumber, { color: theme.colors.primary }]}>2.</Text>
              <Text style={[styles.instructionText, { color: theme.custom.colors.placeholder }]}>
                Consultez également vos spams
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={[styles.instructionNumber, { color: theme.colors.primary }]}>3.</Text>
              <Text style={[styles.instructionText, { color: theme.custom.colors.placeholder }]}>
                Cliquez sur le lien de vérification
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Zone du bas - toujours visible */}
      <View style={styles.bottomContent}>
        {/* Actions */}
        <View style={styles.actionsContainer}>
          {!emailSent ? (
            <Button
              mode="contained"
              onPress={handleResendEmail}
              loading={loading}
              disabled={loading}
              style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
              contentStyle={styles.buttonContent}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer l\'email'}
            </Button>
          ) : (
            <>
              <Button
                mode="outlined"
                onPress={handleResendEmail}
                loading={loading}
                disabled={loading}
                style={styles.resendButton}
                contentStyle={styles.buttonContent}
              >
                Renvoyer l&apos;email
              </Button>
              <Button
                mode="contained"
                onPress={() => router.back()}
                style={[styles.backToSecurityButton, { backgroundColor: theme.colors.primary }]}
                contentStyle={styles.buttonContent}
              >
                Retour à la sécurité
              </Button>
            </>
          )}
        </View>

        {/* Note informative */}
        <View style={[styles.noteContainer, { backgroundColor: '#F3F4F6' }]}>
          <Feather name="info" size={16} color="#6B7280" />
          <Text style={[styles.noteText, { color: '#6B7280' }]}>
            Si vous ne recevez pas l&apos;email dans les 5 minutes, vérifiez vos spams ou contactez le support à{' '}
            <Text style={[styles.supportEmail, { color: theme.colors.primary }]}>
              teamsupport@christennous.com
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// =================================================================
// STYLES
// =================================================================

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
  },
  placeholder: { width: 40 },
  mainContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  middleContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  bottomContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 10,
    width: '100%',
  },
  emailText: {
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
  },
  instructionsContainer: {
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionNumber: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    width: 24,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    flex: 1,
    marginLeft: 12,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  sendButton: {
    borderRadius: 12,
  },
  resendButton: {
    borderRadius: 12,
  },
  backToSecurityButton: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    width: '100%',
  },
  noteText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 20,
    flex: 1,
  },
  supportEmail: {
    fontFamily: 'Nunito_600SemiBold',
    textDecorationLine: 'underline',
  },
});