import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../services/firebase/firebaseConfig';
import { sendCustomVerificationEmail } from 'services/email/emailService';
import { mapStepBaptismToFirestore } from 'utils/mapStepBaptismToFirestore';
import { isNameAndSurnameTaken } from 'utils/isNameAndSurnameTaken';
import { validateStepNameFields } from 'utils/validateStepNameFields';
import { validateStepCredentialsFields } from 'utils/validateStepCredentialsFields';
import rolesData from 'assets/data/churchRoles.json';
import StepName from '../../components/register/steps/StepName';
import StepCredentials from '../../components/register/steps/StepCredentials';
import StepContact from '../../components/register/steps/StepContact';
import StepLocation from '../../components/register/steps/StepLocation';
import StepBaptism from '../../components/register/steps/StepBaptism';
import StepChurchRole from '../../components/register/steps/StepChurchRole';
import StepDiscovery from '../../components/register/steps/StepDiscovery';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { isValidUsernameFormat } from 'utils/isValidUsernameFormat';

const ElegantLoader = () => {
  const animations = useRef([...Array(3)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animate = (index: number) => {
      return Animated.sequence([
        Animated.timing(animations[index], { toValue: 1, duration: 600, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(animations[index], { toValue: 0, duration: 600, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
      ]);
    };
    const loop = Animated.stagger(250, animations.map((_, i) => animate(i)));
    Animated.loop(loop).start();
  }, [animations]);

  return (
    <View style={styles.loaderContainer}>
      {animations.map((animation, index) => {
        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20]
        });
        return <Animated.View key={index} style={[styles.loaderDot, { transform: [{ translateY }] }]} />;
      })}
    </View>
  );
};

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

const createFirestoreCheck = (field: string) => async (value: string): Promise<boolean> => {
  try {
    const normalizedValue = field === 'email' ? value.trim().toLowerCase() : value.trim();
    if (!normalizedValue) return false;
    const q = query(collection(db, 'users'), where(field, '==', normalizedValue));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error(`❌ Erreur Firestore (check ${field}):`, error);
    throw error;
  }
};

const isUsernameTaken = createFirestoreCheck('username');
const isEmailTaken = createFirestoreCheck('email');

function formatDateToISO(dateStr: string): string {
    if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export default function RegisterScreen() {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setShouldShowRegisterSuccess, setIsRegistering } = useAuth();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [forceValidation, setForceValidation] = useState(false);
  
  const [form, setForm] = useState({
    nom: '', prenom: '', username: '', birthdate: '', password: '', confirmPassword: '',
    email: '', phone: '', pays: '', ville: '', quartier: '', baptise: '', desire: '',
    immersion: '', statut: '', fonction: '', sousFonction: '', moyen: '',
    recommandePar: '', egliseOrigine: '',
  });

  const [validationStatus, setValidationStatus] = useState({
    checkingUsername: false,
    usernameTaken: false,
    checkingEmail: false,
    emailTaken: false,
    checkingName: false,
    nameTaken: false,
  });

  const masterAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(masterAnim, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [masterAnim]);

  useEffect(() => {
    Animated.timing(progressAnim, { toValue: step, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: false }).start();
  }, [step, progressAnim]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      const username = form.username.trim().toLowerCase();
      if (username.length < 3 || !isValidUsernameFormat(username)) {
        setValidationStatus(s => ({ ...s, usernameTaken: false, checkingUsername: false }));
        return;
      }
      setValidationStatus(s => ({ ...s, checkingUsername: true }));
      try {
        const taken = await isUsernameTaken(username);
        setValidationStatus(s => ({ ...s, usernameTaken: taken, checkingUsername: false }));
      } catch {
        setValidationStatus(s => ({ ...s, checkingUsername: false }));
      }
    }, 800);
    return () => clearTimeout(handler);
  }, [form.username]);

  useEffect(() => {
    const handler = setTimeout(async () => {
        const email = form.email.trim().toLowerCase();
        if (!/^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email)) {
            setValidationStatus(s => ({ ...s, emailTaken: false, checkingEmail: false }));
            return;
        }
        setValidationStatus(s => ({ ...s, checkingEmail: true }));
        try {
            const taken = await isEmailTaken(email);
            setValidationStatus(s => ({ ...s, emailTaken: taken, checkingEmail: false }));
        } catch {
            setValidationStatus(s => ({ ...s, checkingEmail: false }));
        }
    }, 800);
    return () => clearTimeout(handler);
  }, [form.email]);

  const handleChange = useCallback((field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleLocationChange = useCallback((field: 'country' | 'city' | 'quarter', value: string) => {
    const fieldMap = { country: 'pays', city: 'ville', quarter: 'quartier' } as const;
    handleChange(fieldMap[field], value);
  }, [handleChange]);

  const isStepValid = useMemo((): boolean => {
    switch (step) {
      case 0:
        const nameErrors = validateStepNameFields({ nom: form.nom, prenom: form.prenom, username: form.username });
        return Object.keys(nameErrors).length === 0 && !validationStatus.usernameTaken && !validationStatus.checkingUsername;
      case 1:
        const credErrors = validateStepCredentialsFields({ birthdate: form.birthdate, password: form.password, confirmPassword: form.confirmPassword });
        return Object.keys(credErrors).length === 0;
      case 2:
        let isPhoneValid = false;
        try { isPhoneValid = phoneUtil.isValidNumber(phoneUtil.parse(form.phone)); } catch {}
        return /^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(form.email) && isPhoneValid && !validationStatus.emailTaken && !validationStatus.checkingEmail;
      case 3:
        return !!form.pays && !!form.ville && form.quartier.trim().length >= 2;
      case 4:
        const { baptise, desire, immersion } = form;
        if (baptise === 'oui') return !!immersion;
        if (baptise === 'non') return !!desire;
        return false;
      case 5:
        const { statut, fonction } = form;
        if (statut === 'nouveau') return true;
        if (statut === 'ancien') {
            const subs = rolesData[fonction as keyof typeof rolesData] || [];
            return !!fonction && (subs.length > 0 ? !!form.sousFonction : true);
        }
        return false;
      case 6:
        return !!form.moyen && !!form.egliseOrigine;
      default:
        return false;
    }
  }, [step, form, validationStatus, phoneUtil]);

  const handleNext = async () => {
    setForceValidation(true);
    if (isStepValid) {
      if (step === 0) {
        setValidationStatus(s => ({ ...s, checkingName: true }));
        const taken = await isNameAndSurnameTaken(form.nom, form.prenom);
        setValidationStatus(s => ({ ...s, checkingName: false, nameTaken: taken }));
        if (taken) return;
      }

      if (step < TOTAL_STEPS - 1) {
        setStep(s => s + 1);
        setForceValidation(false);
      } else {
        await handleRegister();
      }
    }
  };

  const handleBack = () => {
    setForceValidation(false);
    if (step > 0) setStep(s => s - 1);
    else router.back();
  };

  const handleRegister = async () => {
    setLoading(true);
    setIsRegistering(true);

    const minDelayPromise = new Promise(resolve => setTimeout(resolve, 2000));

    const firestorePromise = (async () => {
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const uid = userCred.user.uid;
      await sendCustomVerificationEmail({ userId: uid, email: form.email, prenom: form.prenom, nom: form.nom });
      const baptismData = mapStepBaptismToFirestore({ baptise: form.baptise as any, immersion: form.immersion as any, desire: form.desire as any });
      await setDoc(doc(db, 'users', uid), {
        ...form,
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        username: form.username.trim().toLowerCase(),
        birthdate: formatDateToISO(form.birthdate),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        ...baptismData,
        uid,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      });
    })();

    try {
      await Promise.all([minDelayPromise, firestorePromise]);
      await new Promise(resolve => setTimeout(resolve, 500));

      setShouldShowRegisterSuccess({
        show: true,
        userName: form.prenom.trim(),
        userEmail: form.email.trim(),
      });
      
    } catch (error: any) {
      setShouldShowRegisterSuccess(null);
      let msg = "Une erreur s'est produite. Veuillez réessayer.";
      if (error.code === 'auth/email-already-in-use') msg = "Cet email est déjà utilisé.";
      if (error.code === 'auth/weak-password') msg = "Le mot de passe est trop faible.";
      Alert.alert("Erreur d'inscription", msg);
      setLoading(false);
      setIsRegistering(false);
    }
  };

  const renderStep = () => {
    const commonProps = { onChange: handleChange, forceValidation };
    switch (step) {
      case 0: return <StepName {...commonProps} nom={form.nom} prenom={form.prenom} username={form.username} nameDuplicateError={validationStatus.nameTaken} usernameAvailable={!validationStatus.usernameTaken} checkingUsername={validationStatus.checkingUsername || validationStatus.checkingName} />;
      case 1: return <StepCredentials {...commonProps} birthdate={form.birthdate} password={form.password} confirmPassword={form.confirmPassword} />;
      case 2: return <StepContact {...commonProps} email={form.email} phone={form.phone} country={form.pays} emailDuplicateError={validationStatus.emailTaken} phoneDuplicateError={false} emailAvailable={!validationStatus.emailTaken} phoneAvailable={true} checkingEmail={validationStatus.checkingEmail} checkingPhone={false} />;
      case 3: return <StepLocation {...commonProps} country={form.pays} city={form.ville} quarter={form.quartier} onChange={handleLocationChange} />;
      case 4: return <StepBaptism {...commonProps} baptise={form.baptise as any} desire={form.desire as any} immersion={form.immersion as any} />;
      case 5: return <StepChurchRole {...commonProps} statut={form.statut as any} fonction={form.fonction} sousFonction={form.sousFonction} />;
      case 6: return <StepDiscovery {...commonProps} moyen={form.moyen} recommandePar={form.recommandePar} egliseOrigine={form.egliseOrigine} />;
      default: return null;
    }
  };

  const progressWidth = progressAnim.interpolate({ inputRange: [0, TOTAL_STEPS - 1], outputRange: [`${100 / TOTAL_STEPS}%`, '100%'] });
  const headerOpacity = masterAnim.interpolate({ inputRange: [0, 0.5], outputRange: [0, 1] });
  const headerTranslateY = masterAnim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0], extrapolate: 'clamp' });
  const formOpacity = masterAnim.interpolate({ inputRange: [0.3, 1], outputRange: [0, 1] });
  const formTranslateY = masterAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  
  const isNextDisabled = loading || !isStepValid;

  return (
    <PaperProvider theme={theme}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={require('assets/images/imagebacklogin.png')} style={styles.backgroundImage} resizeMode="cover">
        <LinearGradient colors={['rgba(6, 60, 115, 0.9)', 'rgba(10, 114, 187, 0.7)', 'rgba(180, 210, 235, 0.5)']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
          <KeyboardAwareScrollView style={styles.flex} contentContainerStyle={styles.scrollViewContent} enableOnAndroid keyboardShouldPersistTaps="always" extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}>
            
            <Animated.View style={[styles.headerContainer, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
              <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}><Ionicons name="close" size={28} color="#FFFFFF" /></TouchableOpacity>
              <ImageBackground source={require('assets/images/logoSimpleT.png')} style={styles.logo} resizeMode="contain" />
              <Text style={styles.headerTitle}>Rejoignez la communauté</Text>
              <Text style={styles.stepTitle}>{`Étape ${step + 1} sur ${TOTAL_STEPS}`}</Text>
              <Text style={styles.stepSubtitle}>{stepTitles[step]}</Text>
              <View style={styles.progressBarContainer}><Animated.View style={[styles.progressBar, { width: progressWidth }]} /></View>
            </Animated.View>

            <Animated.View style={[styles.formContainer, { opacity: formOpacity, transform: [{ translateY: formTranslateY }] }]}>
              {renderStep()}
            </Animated.View>
            
            <View style={styles.navigationContainer}>
              {step > 0 && (
                <TouchableOpacity onPress={handleBack} style={styles.backButton} disabled={loading}>
                  <Ionicons name="arrow-back-circle-outline" size={32} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleNext} disabled={isNextDisabled} style={[styles.nextButton, isNextDisabled && styles.disabledButton]}>
                <LinearGradient colors={isNextDisabled ? ['#B0B0B0', '#909090'] : ['#1e40af', '#3b82f6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.nextButtonGradient}>
                  <Text style={styles.nextButtonLabel}>{step === TOTAL_STEPS - 1 ? "Terminer" : 'Suivant'}</Text>
                  <Ionicons name={step === TOTAL_STEPS - 1 ? "checkmark-done-circle" : "arrow-forward"} size={22} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </KeyboardAwareScrollView>
        </SafeAreaView>

        <Modal visible={loading} transparent={true} animationType="fade">
          <BlurView intensity={Platform.OS === 'ios' ? 80 : 60} tint="dark" style={styles.loadingOverlay}>
            <ElegantLoader />
            <Text style={styles.loadingText}>Création de votre compte...</Text>
          </BlurView>
        </Modal>

      </ImageBackground>
    </PaperProvider>
  );
}

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
    marginTop: 25,
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loaderDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'white',
    marginHorizontal: 6,
  },
});
