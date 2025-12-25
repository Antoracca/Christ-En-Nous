// app/screens/auth/ChangeEmailScreen.tsx
// VERSION FINALE v6 - Sécurisé, avec option de modification et renvoi d'email robuste

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform,
  Modal, ActivityIndicator
} from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';

import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { EmailAuthProvider, reauthenticateWithCredential, verifyBeforeUpdateEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from 'services/firebase/firebaseConfig';
import type { RootStackParamList } from '@/navigation/types';

// Sous-composant pour le modal de ré-authentification
const ResendPasswordModal = ({ visible, onClose, onConfirm, loading }: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  loading: boolean;
}) => {
  const theme = useAppTheme();
  const [password, setPassword] = useState('');

  const handleConfirm = () => {
    if (password.trim()) {
      onConfirm(password);
    }
  };
  
  useEffect(() => {
    if (!visible) {
      setPassword('');
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={20} style={StyleSheet.absoluteFill}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.custom.colors.text }]}>Confirmer votre identité</Text>
            <Text style={[styles.modalSubtitle, { color: theme.custom.colors.placeholder }]}>
              Pour votre sécurité, veuillez retaper votre mot de passe pour continuer.
            </Text>
            <TextInput
              label="Mot de passe actuel"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.modalInput}
              mode="outlined"
            />
            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={onClose} disabled={loading} style={styles.modalButton}>Annuler</Button>
              <Button mode="contained" onPress={handleConfirm} loading={loading} disabled={loading || !password.trim()} style={styles.modalButton}>Confirmer</Button>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};


export default function ChangeEmailScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, userProfile, isAuthenticated } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [emailChangeRequested, setEmailChangeRequested] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isResendModalVisible, setIsResendModalVisible] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cooldown]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('Login', {});
    }
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    const checkPendingRequest = async () => {
      try {
        const requestData = await AsyncStorage.getItem('@emailChangeRequest');
        if (requestData) {
          const request = JSON.parse(requestData);
          setNewEmail(request.newEmail);
          setEmailChangeRequested(true);
        }
      } catch (error) {
        console.error('Erreur vérification demande:', error);
      }
    };
    checkPendingRequest();
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!currentPassword.trim()) newErrors.password = 'Mot de passe actuel requis';
    if (!newEmail.trim()) newErrors.email = 'Nouvelle adresse email requise';
    else if (!validateEmail(newEmail)) newErrors.email = 'Format d&apos;email invalide';
    else if (newEmail.toLowerCase() === user?.email?.toLowerCase()) {
      newErrors.email = 'La nouvelle adresse doit être différente de l&apos;actuelle';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangeEmail = async () => {
    console.log('🚀 Début demande changement email');

    if (!user || !userProfile) return;
    if (!validateForm()) return;

    setLoading(true);
    const finalNewEmail = newEmail.toLowerCase().trim();

    try {
      // ✅ SÉCURITÉ : Vérifier si le nouvel email est déjà utilisé
      console.log(`🔍 Vérification de l'email: ${finalNewEmail}`);
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", finalNewEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log('⚠️ Email déjà utilisé.');
        setErrors({ email: 'Cette adresse email est déjà utilisée par un autre compte.' });
        setLoading(false);
        return;
      }
      console.log('✅ Email disponible.');

      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error('Utilisateur non connecté');
      }

      console.log('📝 Réauthentification...');
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      console.log('💾 Sauvegarde demande dans AsyncStorage');
      const emailChangeRequest = {
        uid: currentUser.uid,
        newEmail: finalNewEmail,
      };
      await AsyncStorage.setItem('@emailChangeRequest', JSON.stringify(emailChangeRequest));

      console.log('📧 Envoi email vérification');
      await verifyBeforeUpdateEmail(currentUser, finalNewEmail);

      setEmailChangeRequested(true);
      Alert.alert(
        'Email envoyé !',
        `Un lien de vérification a été envoyé à ${finalNewEmail}. Cliquez sur le lien pour valider votre nouvelle adresse.`
      );

    } catch (error: any) {
      console.error('❌ Erreur:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setErrors({ password: 'Mot de passe incorrect' });
      } else {
        Alert.alert('Erreur', 'Impossible de changer l&apos;adresse email.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteEmailChange = async () => {
    // Cette fonction reste inchangée
    console.log('🎯 Tentative de finalisation');
    if (!user) return;

    setLoading(true);
    setVerificationError('');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Session expirée. Veuillez vous reconnecter.");

      await currentUser.reload();
      const refreshedUser = auth.currentUser;
      if (!refreshedUser) throw new Error("Session expirée.");

      const requestDataString = await AsyncStorage.getItem('@emailChangeRequest');
      if (!requestDataString) throw new Error("Aucune demande de changement d'email en cours.");

      const requestData = JSON.parse(requestDataString);
      const finalEmail = requestData.newEmail;

      if (refreshedUser.email?.toLowerCase() !== finalEmail.toLowerCase()) {
        setVerificationError(
          "⚠️ Veuillez d'abord cliquer sur le lien de vérification envoyé à votre nouvelle adresse email.\n\nVérifiez votre boîte de réception et vos spams."
        );
        setLoading(false);
        return;
      }

      console.log('✅ Email validé. Préparation de la synchronisation post-reconnexion.');
      await AsyncStorage.setItem('@firestoreSyncPending', JSON.stringify({
        uid: refreshedUser.uid,
        email: finalEmail,
      }));

      await AsyncStorage.removeItem('@emailChangeRequest');

      console.log('🚀 Navigation vers PostEmailChange');
      navigation.replace('PostEmailChange', { newEmail: finalEmail });

    } catch (error: any) {
      if (error.code === 'auth/user-token-expired' || error.message?.includes('token')) {
        console.log('✅ [INFO] Token expiré = Email validé. Préparation de la synchronisation.');
        try {
          const requestDataString = await AsyncStorage.getItem('@emailChangeRequest');
          if (requestDataString) {
            const requestData = JSON.parse(requestDataString);
            const finalEmail = requestData.newEmail;

            await AsyncStorage.setItem('@firestoreSyncPending', JSON.stringify({
              uid: user.uid,
              email: finalEmail,
            }));

            await AsyncStorage.removeItem('@emailChangeRequest');
            navigation.replace('PostEmailChange', { newEmail: finalEmail });
          }
        } catch (cleanupError) {
          console.error('❌ Erreur lors du nettoyage:', cleanupError);
        }
      } else {
        console.error('❌ Erreur inattendue de finalisation:', error);
        setVerificationError("Une erreur s'est produite. Veuillez réessayer.");
        setLoading(false);
      }
    }
  };

  const confirmAndResendEmail = async (password: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      Alert.alert("Erreur", "Session expirée.");
      return;
    }

    setResendLoading(true);
    setIsResendModalVisible(false);

    try {
      console.log('📝 Ré-authentification pour le renvoi...');
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);

      console.log('📧 Renvoi de l&apos;email de vérification...');
      const finalNewEmail = newEmail.toLowerCase().trim();
      await verifyBeforeUpdateEmail(currentUser, finalNewEmail);
      
      Alert.alert("Email renvoyé", `Un nouveau lien a été envoyé à ${finalNewEmail}.`);
      setCooldown(60);

    } catch (error: any) {
      console.error("Erreur renvoi:", error);
      if(error.code === 'auth/wrong-password') {
        Alert.alert("Erreur", "Mot de passe incorrect. Veuillez réessayer.");
      } else {
        Alert.alert("Erreur", "Impossible de renvoyer l'email.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  // ✅ NOUVEAU : Fonction pour annuler la demande et corriger l'email
  const handleModifyEmail = async () => {
    await AsyncStorage.removeItem('@emailChangeRequest');
    setEmailChangeRequested(false);
    setNewEmail('');
    setCurrentPassword('');
    setErrors({});
    setVerificationError('');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <Modal
        transparent={true}
        visible={loading && emailChangeRequested}
        animationType="fade"
      >
        <BlurView intensity={20} style={StyleSheet.absoluteFill}>
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.custom.colors.text }]}>
              Finalisation en cours...
            </Text>
          </View>
        </BlurView>
      </Modal>

      <ResendPasswordModal
        visible={isResendModalVisible}
        onClose={() => setIsResendModalVisible(false)}
        onConfirm={confirmAndResendEmail}
        loading={resendLoading}
      />

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
              Changer l&apos;email
            </Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.mainContent}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '1A' }]}>
              <MaterialCommunityIcons
                name={emailChangeRequested ? "email-check" : "email-edit"}
                size={60}
                color={emailChangeRequested ? '#10B981' : theme.colors.primary}
              />
            </View>

            <Text style={[styles.title, { color: theme.custom.colors.text }]}>
              {emailChangeRequested ? 'Vérification requise' : 'Changer votre email'}
            </Text>

            <Text style={[styles.description, { color: theme.custom.colors.placeholder }]}>
              {emailChangeRequested
                ? 'Un email de vérification a été envoyé. Cliquez sur le lien pour valider votre nouvelle adresse.'
                : 'Saisissez votre mot de passe actuel et la nouvelle adresse email.'
              }
            </Text>

            <View style={[styles.emailContainer, { backgroundColor: theme.colors.surface }]}>
              <Feather name="mail" size={18} color={theme.colors.primary} />
              <Text style={[styles.emailText, { color: theme.custom.colors.text }]}>
                {emailChangeRequested ? newEmail : userProfile?.email}
              </Text>
            </View>
          </View>

          <View style={styles.middleContent}>
            {!emailChangeRequested ? (
              <View style={styles.formContainer}>
                <TextInput
                  label="Mot de passe actuel"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.password}
                  disabled={loading}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
                <HelperText type="error" visible={!!errors.password}>{errors.password}</HelperText>

                <TextInput
                  label="Nouvelle adresse email"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.email}
                  disabled={loading}
                />
                <HelperText type="error" visible={!!errors.email}>{errors.email}</HelperText>
              </View>
            ) : (
              <View style={styles.instructionsContainer}>
                <Text style={[styles.instructionsTitle, { color: theme.custom.colors.text }]}>
                  Étapes suivantes :
                </Text>
                <View style={styles.instructionItem}>
                  <Text style={[styles.instructionNumber, { color: theme.colors.primary }]}>1.</Text>
                  <Text style={[styles.instructionText, { color: theme.custom.colors.placeholder }]}>
                    Ouvrez votre nouvelle boîte mail
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <Text style={[styles.instructionNumber, { color: theme.colors.primary }]}>2.</Text>
                  <Text style={[styles.instructionText, { color: theme.custom.colors.placeholder }]}>
                    Cliquez sur le lien de vérification
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <Text style={[styles.instructionNumber, { color: theme.colors.primary }]}>3.</Text>
                  <Text style={[styles.instructionText, { color: theme.custom.colors.placeholder }]}>
                    Revenez ici et cliquez sur &quot;Finaliser&quot;
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.bottomContent}>
            {verificationError ? (
              <View style={[styles.errorContainer, { backgroundColor: '#FEF2F2', borderColor: '#F87171' }]}>
                <Feather name="alert-circle" size={20} color="#EF4444" />
                <Text style={[styles.errorText, { color: '#EF4444' }]}>
                  {verificationError}
                </Text>
              </View>
            ) : null}
            
            <View style={styles.actionsContainer}>
              {!emailChangeRequested ? (
                <Button
                  mode="contained"
                  onPress={handleChangeEmail}
                  loading={loading}
                  disabled={loading || !currentPassword.trim() || !newEmail.trim()}
                  style={styles.changeButton}
                  contentStyle={styles.buttonContent}
                >
                  Changer l&apos;email
                </Button>
              ) : (
                <>
                  <Button
                    mode="text"
                    onPress={handleModifyEmail}
                    disabled={resendLoading || loading}
                    labelStyle={{textDecorationLine: 'underline'}}
                  >
                    Modifier l&apos;adresse
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => setIsResendModalVisible(true)}
                    loading={resendLoading}
                    disabled={resendLoading || loading || cooldown > 0}
                    style={styles.resendButton}
                    contentStyle={styles.buttonContent}
                  >
                    {cooldown > 0 ? `Attendre ${cooldown}s` : "Renvoyer l'email"}
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleCompleteEmailChange}
                    disabled={loading || resendLoading}
                    style={styles.backToSecurityButton}
                    contentStyle={styles.buttonContent}
                  >
                    Finaliser la modification
                  </Button>
                </>
              )}
            </View>

            <View style={[styles.noteContainer, { backgroundColor: '#F3F4F6' }]}>
              <Feather name="info" size={16} color="#6B7280" />
              <Text style={[styles.noteText, { color: '#6B7280' }]}>
                {!emailChangeRequested
                  ? 'Votre mot de passe est requis pour des raisons de sécurité.'
                  : 'Vérifiez vos spams si vous ne recevez pas l&apos;email.'
                }
              </Text>
            </View>
          </View>
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
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 10,
    width: '100%'
  },
  emailText: { fontSize: 15, fontFamily: 'Nunito_600SemiBold' },
  formContainer: { width: '100%' },
  input: { marginBottom: 4, backgroundColor: 'transparent' },
  instructionsContainer: { width: '100%' },
  instructionsTitle: { fontSize: 16, fontFamily: 'Nunito_700Bold', marginBottom: 12 },
  instructionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  instructionNumber: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    width: 24,
    textAlign: 'center'
  },
  instructionText: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    flex: 1,
    marginLeft: 12
  },
  actionsContainer: { width: '100%', marginBottom: 20, gap: 12 },
  changeButton: { borderRadius: 12 },
  resendButton: { borderRadius: 12 },
  backToSecurityButton: { borderRadius: 12 },
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    flex: 1,
    lineHeight: 20
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: '#FFFFFF'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalInput: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
