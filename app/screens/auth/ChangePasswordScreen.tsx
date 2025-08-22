// app/screens/auth/ChangePasswordScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import * as Crypto from 'expo-crypto';

import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { auth, db } from 'services/firebase/firebaseConfig';
import type { RootStackParamList } from 'navigation/AppNavigator';
import PasswordStrengthIndicator from '@/components/forms/PasswordStrengthIndicator';

const hashPassword = async (password: string) => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
};

export default function ChangePasswordScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, userProfile } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasStartedTypingPassword, setHasStartedTypingPassword] = useState(false);
  const [isForgotPasswordMode, setForgotPasswordMode] = useState(false);

  const lastPasswordUpdateDate = userProfile?.lastPasswordUpdate
    ? new Date(userProfile.lastPasswordUpdate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : 'Jamais';

  const validatePassword = (password: string): boolean => {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/\d/.test(password)) return false;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
    return true;
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!currentPassword.trim()) newErrors.current = 'Mot de passe actuel requis';
    if (!newPassword.trim()) newErrors.new = 'Nouveau mot de passe requis';
    else if (newPassword === currentPassword) newErrors.new = 'Le nouveau mot de passe doit être différent de l\'ancien.';
    else if (!validatePassword(newPassword)) newErrors.new = 'Le mot de passe est trop faible.';
    if (newPassword !== confirmPassword) newErrors.confirm = 'Les mots de passe ne correspondent pas';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!user) return;
    if (!validateForm()) return;

    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error('Utilisateur non connecté');
      }

      const hashedNewPassword = await hashPassword(newPassword);
      const passwordHistory = userProfile?.passwordHistory || [];

      if (passwordHistory.includes(hashedNewPassword)) {
        setErrors({ new: 'Vous ne pouvez pas réutiliser un ancien mot de passe.' });
        setLoading(false);
        return;
      }

      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      await updatePassword(currentUser, newPassword);

      const newPasswordHistory = [hashedNewPassword, ...passwordHistory].slice(0, 5);

      await updateDoc(doc(db, 'users', currentUser.uid), {
        lastPasswordUpdate: new Date().toISOString(),
        passwordHistory: newPasswordHistory,
      });

      Alert.alert('Succès', 'Votre mot de passe a été mis à jour avec succès.');
      navigation.goBack();

    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setErrors({ current: 'Mot de passe actuel incorrect' });
      } else {
        Alert.alert('Erreur', 'Impossible de changer le mot de passe. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetLink = async () => {
    if (!userProfile?.email) return;

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, userProfile.email);
            Alert.alert('Lien envoyé', `Un e-mail de réinitialisation a été envoyé à ${userProfile.email}. Veuillez consulter votre boîte de réception.`);
      setForgotPasswordMode(false);
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'envoyer le lien de réinitialisation. Veuillez contacter le support.");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (
    field: 'newPassword',
    value: string
  ) => {
    if (field === 'newPassword') {
        setNewPassword(value);
      if (value.length > 0 && !hasStartedTypingPassword) {
        setHasStartedTypingPassword(true);
      }
      if (value.length === 0) {
        setHasStartedTypingPassword(false);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.header, { borderBottomColor: theme.colors.outline }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color={theme.custom.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.custom.colors.text }]}>
              Changer le mot de passe
            </Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.mainContent}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '1A' }]}>
              <MaterialCommunityIcons
                name="lock-reset"
                size={60}
                color={theme.colors.primary}
              />
            </View>

            <Text style={[styles.title, { color: theme.custom.colors.text }]}>
              {isForgotPasswordMode ? 'Réinitialisation en un clic' : 'Sécurisez votre compte'}
            </Text>

            <Text style={[styles.description, { color: theme.custom.colors.placeholder }]}>
              {isForgotPasswordMode
                ? 'Confirmez votre adresse e-mail pour recevoir un lien de réinitialisation.'
                : `Dernière mise à jour : ${lastPasswordUpdateDate}`
              }
            </Text>
          </View>

          <View style={styles.middleContent}>
            {isForgotPasswordMode ? (
              <View style={styles.formContainer}>
                <Text style={styles.emailLabel}>Votre adresse e-mail :</Text>
                <Text style={styles.emailText}>{userProfile?.email}</Text>

                {userProfile?.emailVerified ? (
                  <View>
                    <Button
                      mode="contained"
                      onPress={handleSendResetLink}
                      loading={loading}
                      disabled={loading}
                      style={styles.changeButton}
                    >
                      Recevoir le lien
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('ChangeEmail')}
                      style={styles.changeButton}
                    >
                      Modifier l\&apos;e-mail
                    </Button>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.warningText}>Votre adresse e-mail n\&apos;est pas vérifiée. Veuillez la vérifier avant de continuer.</Text>
                    <Button
                      mode="contained"
                      onPress={() => navigation.navigate('ResendEmail')}
                      style={styles.changeButton}
                    >
                      Renvoyer l\&apos;e-mail de vérification
                    </Button>
                  </View>
                )}
                <View style={styles.supportContainer}>
                    <Text style={styles.supportText}>En cas de problème, contactez le support :</Text>
                    <Text style={styles.supportEmail}>support@christennous.com</Text>
                    <Text style={styles.supportText}>Ou l\&apos;administrateur :</Text>
                    <Text style={styles.supportEmail}>admin@christennous.com</Text>
                </View>
                <Button onPress={() => setForgotPasswordMode(false)} style={styles.backButtonforgot}>Retour</Button>
              </View>
            ) : (
              <View style={styles.formContainer}>
                <TextInput
                  label="Mot de passe actuel"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.current}
                  disabled={loading}
                  right={
                    <TextInput.Icon
                      icon={showCurrentPassword ? "eye-off" : "eye"}
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    />
                  }
                />
                <HelperText type="error" visible={!!errors.current}>{errors.current}</HelperText>
                <TouchableOpacity onPress={() => setForgotPasswordMode(true)}>
                  <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
                </TouchableOpacity>

                <TextInput
                  label="Nouveau mot de passe"
                  value={newPassword}
                  onChangeText={(value) => handleFieldChange('newPassword', value)}
                  secureTextEntry={!showNewPassword}
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.new}
                  disabled={loading}
                  right={
                    <TextInput.Icon
                      icon={showNewPassword ? "eye-off" : "eye"}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    />
                  }
                />
                <PasswordStrengthIndicator 
                  password={newPassword} 
                  showDetails={hasStartedTypingPassword}
                  mode="creation"
                />
                <HelperText type="error" visible={!!errors.new}>{errors.new}</HelperText>

                <TextInput
                  label="Confirmer le nouveau mot de passe"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.confirm}
                  disabled={loading}
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? "eye-off" : "eye"}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  }
                />
                <HelperText type="error" visible={!!errors.confirm}>{errors.confirm}</HelperText>
              </View>
            )}
          </View>

          {!isForgotPasswordMode && (
            <View style={styles.bottomContent}>
              <Button
                mode="contained"
                onPress={handleChangePassword}
                loading={loading}
                disabled={loading || !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
                style={styles.changeButton}
                contentStyle={styles.buttonContent}
              >
                Mettre à jour le mot de passe
              </Button>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardAvoidingView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold' },
  placeholder: { width: 40 },
  mainContent: { paddingHorizontal: 24, paddingTop: 20, alignItems: 'center' },
  middleContent: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  bottomContent: { paddingHorizontal: 24, paddingBottom: 20, paddingTop: 10 },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20
  },
  title: {
    fontSize: 22,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
    marginBottom: 12
  },
  description: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 8
  },
  formContainer: { width: '100%' },
  input: { marginBottom: 4, backgroundColor: 'transparent' },
  changeButton: { borderRadius: 12, marginBottom: 12, marginTop: 12 },
  buttonContent: { paddingVertical: 6 },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    width: '100%'
  },
  noteText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 20,
    flex: 1
  },
  forgotPasswordText: {
    textAlign: 'right',
    color: '#0A72BB',
    fontFamily: 'Nunito_600SemiBold',
    paddingVertical: 8,
  },
  emailLabel: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 16,
  },
  warningText: {
    color: '#D97706',
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  supportContainer: {
      marginTop: 24,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
  },
  supportText: {
    textAlign: 'center',
    color: '#6B7280',
    fontFamily: 'Nunito_400Regular',
    marginBottom: 4,
  },
  supportEmail: {
      textAlign: 'center',
      color: '#0A72BB',
      fontFamily: 'Nunito_600SemiBold',
      marginBottom: 12,
  },
  backButtonforgot: {
      marginTop: 16,
  }
});
