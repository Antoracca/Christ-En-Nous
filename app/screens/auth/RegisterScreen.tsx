import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Text,
  ImageBackground,
  Animated,
  Easing,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button, Provider as PaperProvider, DefaultTheme, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

// Importez vos composants d'étapes
import StepName from '../../components/register/steps/StepName';
import StepCredentials from '../../components/register/steps/StepCredentials';
import StepContact from '../../components/register/steps/StepContact';
import StepLocation from '../../components/register/steps/StepLocation';
import StepBaptism from '../../components/register/steps/StepBaptism';
import StepChurchRole from '../../components/register/steps/StepChurchRole';
import StepDiscovery from '../../components/register/steps/StepDiscovery';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from 'navigation/AppNavigator';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { isValidUsernameFormat } from 'utils/isValidUsernameFormat';
import { auth, db } from '../../../services/firebase/firebaseConfig';
import SuccessModal from '../../components/register/SuccessModal';
import { mapStepBaptismToFirestore } from 'utils/mapStepBaptismToFirestore';
import { sendCustomVerificationEmail } from 'services/email/emailService';
import { isNameAndSurnameTaken } from 'utils/isNameAndSurnameTaken';
import { validateStepNameFields } from 'utils/validateStepNameFields';
import { validateStepCredentialsFields } from 'utils/validateStepCredentialsFields';
import rolesData from 'assets/data/churchRoles.json';

// =================================================================
// THÈME ET CONSTANTES
// =================================================================
const theme = {
  ...DefaultTheme,
  roundness: 12,
  colors: { ...DefaultTheme.colors, primary: '#0A72BB', accent: '#E5B20A', background: '#F7FAFC', surface: '#FFFFFF', text: '#1A202C', error: '#E53E3E', placeholder: '#A0AEC0', onSurface: '#1A202C', success: '#2F855A' },
};
const LOGO_SIZE = 80;
const TOTAL_STEPS = 7;

const stepTitles = [
    "Qui êtes-vous ?", "Sécurisez votre compte", "Comment vous contacter ?",
    "Où vous situez-vous ?", "Votre parcours de foi", "Votre rôle dans l'église",
    "Comment nous avez-vous connus ?"
];

// =================================================================
// FONCTIONS HELPERS
// =================================================================
async function isUsernameTaken(username: string): Promise<boolean> {
  try {
    const q = query(collection(db, 'users'), where('username', '==', username.trim()));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) { console.error('❌ Erreur Firestore (isUsernameTaken):', error); throw error; }
}

async function isEmailTaken(email: string): Promise<boolean> {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) { console.error('❌ Erreur Firestore (isEmailTaken):', error); throw error; }
}

async function isPhoneTaken(phone: string): Promise<boolean> {
  try {
    const q = query(collection(db, 'users'), where('phone', '==', phone.trim()));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) { console.error('❌ Erreur Firestore (isPhoneTaken):', error); throw error; }
}

function formatDateToISO(dateStr: string): string {
  if (!dateStr || !dateStr.includes('/')) return '';
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// =================================================================
// COMPOSANT PRINCIPAL
// =================================================================
export default function RegisterScreen() {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const [step, setStep] = useState(0);
  const [forceValidation, setForceValidation] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // ✅ MODIFICATION 1: Simplification du useAuth
  const { refreshUserProfile, setIsRegistering } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [nameDuplicateError, setNameDuplicateError] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [emailDuplicateError, setEmailDuplicateError] = useState(false);
  const [phoneDuplicateError, setPhoneDuplicateError] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  // ✅ MODIFICATION 2: Ajout des états locaux pour le modal
  const [showLocalSuccessModal, setShowLocalSuccessModal] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  
  const [form, setForm] = useState({
    nom: '', prenom: '', username: '', birthdate: '', password: '', confirmPassword: '',
    email: '', phone: '', pays: '', ville: '', quartier: '', baptise: '', desire: '',
    immersion: '', statut: '', fonction: '', sousFonction: '', moyen: '',
    recommandePar: '', egliseOrigine: '',
  });

  const masterAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(masterAnim, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [masterAnim]);

  useEffect(() => {
    Animated.timing(progressAnim, { toValue: step, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: false }).start();
  }, [step, progressAnim]);
  
  // ✅ MODIFICATION 3: Bloquer le retour arrière après inscription
  useEffect(() => {
    if (registrationComplete) {
      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        // Empêcher le retour arrière
        e.preventDefault();
      });
      return unsubscribe;
    }
  }, [navigation, registrationComplete]);

  // --- LOGIQUE DE VALIDATION EN TEMPS RÉEL ---
  useEffect(() => {
    const username = form.username.trim().toLowerCase();
    if (!username || username.length < 3 || !isValidUsernameFormat(username)) {
      setUsernameAvailable(null); setCheckingUsername(false); return;
    }
    setCheckingUsername(true);
    const timeoutId = setTimeout(async () => {
      try { setUsernameAvailable(!(await isUsernameTaken(username))); } 
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      catch (e) { setUsernameAvailable(null); } 
      finally { setCheckingUsername(false); }
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [form.username]);

  useEffect(() => {
    const email = form.email.trim().toLowerCase();
    if (!email || !/^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setEmailAvailable(null); setCheckingEmail(false); setEmailDuplicateError(false); return;
    }
    setCheckingEmail(true); setEmailDuplicateError(false);
    const timeoutId = setTimeout(async () => {
      try {
        const taken = await isEmailTaken(email);
        setEmailAvailable(!taken); setEmailDuplicateError(taken);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setEmailAvailable(null); setEmailDuplicateError(false);
      } finally {
        setCheckingEmail(false);
      }
    }, 800);
    return () => clearTimeout(timeoutId);
  }, [form.email]);

  useEffect(() => {
    const phone = form.phone.trim();
    if (!phone || phone.length < 8) {
      setPhoneAvailable(null); setCheckingPhone(false); setPhoneDuplicateError(false); return;
    }
    try {
      if (!phoneUtil.isValidNumber(phoneUtil.parse(phone))) {
        setPhoneAvailable(null); setCheckingPhone(false); setPhoneDuplicateError(false); return;
      }
    } catch {
      setPhoneAvailable(null); setCheckingPhone(false); setPhoneDuplicateError(false); return;
    }
    setCheckingPhone(true); setPhoneDuplicateError(false);
    const timeoutId = setTimeout(async () => {
      try {
        const taken = await isPhoneTaken(phone);
        setPhoneAvailable(!taken); setPhoneDuplicateError(taken);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setPhoneAvailable(null); setPhoneDuplicateError(false);
      } finally {
        setCheckingPhone(false);
      }
    }, 800);
    return () => clearTimeout(timeoutId);
  }, [form.phone, phoneUtil]);
  
  // ✅ CORRECTION: `handleChange` est maintenant mémorisée avec useCallback
  const handleChange = useCallback((field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (nameDuplicateError && (field === 'nom' || field === 'prenom')) setNameDuplicateError(false);
    if (emailDuplicateError && field === 'email') setEmailDuplicateError(false);
    if (phoneDuplicateError && field === 'phone') setPhoneDuplicateError(false);
  }, [nameDuplicateError, emailDuplicateError, phoneDuplicateError]);

  // ✅ CORRECTION: Callback mémorisée spécifique pour StepLocation
  const handleLocationChange = useCallback((field: 'country' | 'city' | 'quarter', value: string) => {
      const fieldMap = {
          country: 'pays',
          city: 'ville',
          quarter: 'quartier',
      } as const;
      handleChange(fieldMap[field], value);
  }, [handleChange]);

  const validateCurrentStep = async (): Promise<boolean> => {
    // Cette fonction est maintenant utilisée pour la validation finale au clic
    switch (step) {
      case 0: {
        setNameDuplicateError(false);
        const errs = validateStepNameFields({ nom: form.nom, prenom: form.prenom, username: form.username });
        if (Object.keys(errs).length > 0) return false;
        if (checkingUsername || usernameAvailable === false) return false;
        if (form.username.length >= 3 && usernameAvailable === null) return false;
        const duplicate = await isNameAndSurnameTaken(form.nom, form.prenom);
        setNameDuplicateError(duplicate);
        return !duplicate;
      }
      case 1: {
        const errs = validateStepCredentialsFields({ birthdate: form.birthdate, password: form.password, confirmPassword: form.confirmPassword });
        return Object.keys(errs).length === 0;
      }
      case 2: {
        const isValidEmailFormat = (e: string) => /^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(e.trim());
        if (!form.email.trim() || !isValidEmailFormat(form.email)) return false;
        try { if (!phoneUtil.isValidNumber(phoneUtil.parse(form.phone))) return false; } catch { return false; }
        if (checkingEmail || checkingPhone) return false;
        if (emailAvailable === false || phoneAvailable === false) return false;
        if (emailAvailable === null || phoneAvailable === null) return false;
        return true;
      }
      case 3: return !!form.pays && !!form.ville && form.quartier.trim().length >= 2;
      case 4: {
        const { baptise, desire, immersion } = form;
        if (!baptise) return false;
        if (baptise === 'non' && !desire) return false;
        if (baptise === 'oui' && !immersion) return false;
        if (baptise === 'oui' && immersion === 'non' && !desire) return false;
        return true;
      }
      case 5: {
        const { statut, fonction, sousFonction } = form;
        if (!statut) return false;
        if (statut === 'nouveau') return true;
        if (statut === 'ancien') {
          if (!fonction) return false;
          const subs = rolesData[fonction as keyof typeof rolesData] || [];
          if (subs.length > 0 && !sousFonction) return false;
        }
        return true;
      }
      case 6: {
        const { moyen, recommandePar, egliseOrigine } = form;
        if (!moyen) return false;
        if (moyen === 'Autre' && !recommandePar.trim()) return false;
        if (!egliseOrigine) return false;
        return true;
      }
      default: return true;
    }
  };

  const isNextButtonDisabled = () => {
    if (loading) return true;
    switch (step) {
        case 0:
            const nameErrors = validateStepNameFields({ nom: form.nom, prenom: form.prenom, username: form.username });
            return Object.keys(nameErrors).length > 0 || checkingUsername || usernameAvailable !== true || nameDuplicateError;
        case 1:
            const credErrors = validateStepCredentialsFields({ birthdate: form.birthdate, password: form.password, confirmPassword: form.confirmPassword });
            return Object.keys(credErrors).length > 0;
        case 2:
            const isValidEmailFormat = (e: string) => /^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(e.trim());
            let isPhoneInvalid = true;
            try { isPhoneInvalid = !phoneUtil.isValidNumber(phoneUtil.parse(form.phone)); } catch {}
            return !form.email.trim() || !isValidEmailFormat(form.email) || isPhoneInvalid || checkingEmail || checkingPhone || emailAvailable !== true || phoneAvailable !== true;
        default:
            return false;
    }
  };

  const handleRegister = async () => {
  if (!(await validateCurrentStep())) {
    setForceValidation(true);
    return;
  }
  
  setLoading(true);
  let userCred: any = null;
  setIsRegistering(true); // ✅ Bloquer la navigation auto
  
  try {
    // 1. Mapper les données baptême
    const baptismData = mapStepBaptismToFirestore({ 
      baptise: form.baptise as any, 
      immersion: form.immersion as any, 
      desire: form.desire as any 
    });
    
    // 2. Créer le compte Firebase Auth
    userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
    const uid = userCred.user.uid;
    
    // 3. Envoyer l'email de vérification
    const emailSent = await sendCustomVerificationEmail({ 
      userId: uid, 
      email: form.email.trim(), 
      prenom: form.prenom.trim(), 
      nom: form.nom.trim() 
    });
    
    if (!emailSent) {
      throw new Error('EMAIL_SEND_FAILED');
    }
    
    // 4. Créer le document Firestore
    await setDoc(doc(db, 'users', uid), {
      ...form,
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      username: form.username.trim().toLowerCase(),
      birthdate: formatDateToISO(form.birthdate),
      email: form.email.trim(),
      phone: form.phone.trim(),
      ...baptismData,
      uid,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    });
    
    // 5. Rafraîchir le profil utilisateur
    await refreshUserProfile();
    
    // 6. Marquer l'inscription comme complète et afficher le modal
    setRegistrationComplete(true);
    setShowLocalSuccessModal(true);
    // ✅ NE PAS FAIRE LA NAVIGATION ICI !
    // ✅ NE PAS METTRE setIsRegistering(false) ICI !
    
  } catch (error: any) {
    // ⚠️ En cas d'erreur, débloquer la navigation
    setIsRegistering(false);
    
    // Nettoyer en cas d'erreur
    if (userCred && userCred.user) {
      await userCred.user.delete();
    }
    
    let msg = "Une erreur s'est produite.";
    if (error.message === 'EMAIL_SEND_FAILED') {
      msg = "Impossible d'envoyer l'email de confirmation. Veuillez réessayer.";
    } else if (error.code === 'auth/email-already-in-use') {
      msg = "Cet email est déjà utilisé.";
    } else if (error.code === 'auth/weak-password') {
      msg = "Le mot de passe est trop faible (6 caractères min).";
    }
    
    Alert.alert("Erreur d'inscription", msg);
  } finally {
    setLoading(false);
  }
};

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setForceValidation(false);
      if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
      else handleRegister();
    } else {
      setForceValidation(true);
    }
  };

  const handleBack = () => {
    setForceValidation(false);
    if (step > 0) setStep(s => s - 1);
    else navigation.goBack();
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <StepName nom={form.nom} prenom={form.prenom} username={form.username} onChange={handleChange} forceValidation={forceValidation} nameDuplicateError={nameDuplicateError} usernameAvailable={usernameAvailable} checkingUsername={checkingUsername} />;
      case 1: return <StepCredentials birthdate={form.birthdate} password={form.password} confirmPassword={form.confirmPassword} onChange={handleChange} forceValidation={forceValidation} />;
      case 2: return <StepContact email={form.email} phone={form.phone} country={form.pays} onChange={handleChange} forceValidation={forceValidation} emailDuplicateError={emailDuplicateError} phoneDuplicateError={phoneDuplicateError} emailAvailable={emailAvailable} phoneAvailable={phoneAvailable} checkingEmail={checkingEmail} checkingPhone={checkingPhone} />;
      // ✅ CORRECTION: Utilisation du callback mémorisé
      case 3: return <StepLocation country={form.pays} city={form.ville} quarter={form.quartier} onChange={handleLocationChange} forceValidation={forceValidation} />;
      case 4: return <StepBaptism baptise={form.baptise as any} desire={form.desire as any} immersion={form.immersion as any} onChange={handleChange} forceValidation={forceValidation} />;
      case 5: return <StepChurchRole statut={form.statut as any} fonction={form.fonction} sousFonction={form.sousFonction} onChange={handleChange} forceValidation={forceValidation} />;
      case 6: return <StepDiscovery moyen={form.moyen} recommandePar={form.recommandePar} egliseOrigine={form.egliseOrigine} onChange={handleChange} forceValidation={forceValidation} />;
      default: return null;
    }
  };

  const progressWidth = progressAnim.interpolate({ inputRange: [0, TOTAL_STEPS - 1], outputRange: [`${100 / TOTAL_STEPS}%`, '100%'] });
  const headerOpacity = masterAnim.interpolate({ inputRange: [0, 0.5], outputRange: [0, 1] });
  const headerTranslateY = masterAnim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0], extrapolate: 'clamp' });
  const formOpacity = masterAnim.interpolate({ inputRange: [0.3, 1], outputRange: [0, 1] });
  const formTranslateY = masterAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });

  return (
    <PaperProvider theme={theme}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={require('assets/images/imagebacklogin.png')} style={styles.backgroundImage} resizeMode="cover">
        <LinearGradient colors={['rgba(6, 60, 115, 0.9)', 'rgba(10, 114, 187, 0.7)', 'rgba(180, 210, 235, 0.5)']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
          <KeyboardAwareScrollView style={styles.flex} contentContainerStyle={styles.scrollViewContent} enableOnAndroid keyboardShouldPersistTaps="handled">
            <Animated.View style={[styles.headerContainer, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}><Ionicons name="close" size={28} color="#FFFFFF" /></TouchableOpacity>
              <ImageBackground source={require('assets/images/logoSimpleT.png')} style={styles.logo} resizeMode="contain" />
              <Text style={styles.headerTitle}>Rejoignez la communauté</Text>
              <Text style={styles.stepTitle}>{`Étape ${step + 1} sur ${TOTAL_STEPS}`}</Text>
              <Text style={styles.stepSubtitle}>{stepTitles[step]}</Text>
              <View style={styles.progressBarContainer}><Animated.View style={[styles.progressBar, { width: progressWidth }]} /></View>
            </Animated.View>
            <Animated.View style={[styles.formContainer, { opacity: formOpacity, transform: [{ translateY: formTranslateY }] }]}>{renderStep()}</Animated.View>
            
            <View style={styles.navigationContainer}>
              {step > 0 && (
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <Ionicons name="arrow-back-circle-outline" size={32} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleNext}
                disabled={isNextButtonDisabled()}
                style={[styles.nextButton, isNextButtonDisabled() && styles.disabledButton]}
              >
                <LinearGradient
                  colors={isNextButtonDisabled() ? ['#B0B0B0', '#909090'] : ['#1e40af', '#3b82f6']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.nextButtonGradient}
                >
                  <Text style={styles.nextButtonLabel}>{step === TOTAL_STEPS - 1 ? "Terminer" : 'Suivant'}</Text>
                  <Ionicons name={step === TOTAL_STEPS - 1 ? "checkmark-done-circle" : "arrow-forward"} size={22} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </KeyboardAwareScrollView>
        </SafeAreaView>
        
       {/* ✅ MODIFICATION 5: Modal avec gestion locale et navigation */}
<SuccessModal 
  visible={showLocalSuccessModal} 
  userName={form.prenom}
  onContinue={() => {
    setShowLocalSuccessModal(false);
    
    // Attendre que le modal se ferme avant de débloquer
    setTimeout(() => {
      setIsRegistering(false); // ✅ Déclenche la navigation auto après 300ms
    }, 300);
  }}
/>

        <Modal
          visible={loading}
          transparent={true}
          animationType="fade"
        >
          <BlurView intensity={Platform.OS === 'ios' ? 80 : 60} tint="dark" style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Inscription en cours...</Text>
          </BlurView>
        </Modal>

      </ImageBackground>
    </PaperProvider>
  );
}

// =================================================================
// STYLES
// =================================================================
const styles = StyleSheet.create({
  flex: { flex: 1 },
  backgroundImage: { flex: 1 },
  scrollViewContent: { flexGrow: 1, paddingBottom: 20 },
  headerContainer: { alignItems: 'center', paddingTop: 20, paddingHorizontal: 20, marginBottom: 24 },
  closeButton: { position: 'absolute', left: 16, top: Platform.OS === 'ios' ? 10 : 20, padding: 8, zIndex: 10 },
  logo: { width: LOGO_SIZE, height: LOGO_SIZE, marginBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  stepTitle: { fontSize: 14, color: '#E0F2FE', textAlign: 'center', marginTop: 12, fontWeight: '600', opacity: 0.9 },
  stepSubtitle: { fontSize: 18, color: '#FFFFFF', textAlign: 'center', marginTop: 4, fontWeight: '700' },
  progressBarContainer: { width: '80%', height: 6, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 3, marginTop: 16, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#FFD700', borderRadius: 3 },
  formContainer: { backgroundColor: 'rgba(255, 255, 255, 0.95)', marginHorizontal: 16, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 'auto',
    paddingTop: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  nextButton: {
    flex: 1,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  disabledButton: {
    elevation: 0,
    shadowOpacity: 0.1,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 50,
    gap: 8,
  },
  nextButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

