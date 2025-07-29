/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Animated,
  Easing,
  Vibration,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  Pressable,
 
} from 'react-native';
import {
  Provider as PaperProvider,
  DefaultTheme,
  TextInput,
  Button,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FontAwesome5 } from '@expo/vector-icons';
import { useBiometricAuth } from 'utils/useBiometricAuth';
import {
  signInWithEmailAndPassword,
  Auth,
 
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  Firestore,
} from 'firebase/firestore';
import { auth, db } from 'services/firebase/firebaseConfig'; // Assurez-vous que ce chemin est correct

// =================================================================
// 1. COMPOSANT LeftInputIcon (AVEC MICRO-ANIMATIONS)
// =================================================================
export interface LeftInputIconProps {
  icon: React.ComponentProps<typeof FontAwesome5>['name'];
  size?: number;
  primaryColor?: string;
  accentColor?: string;
  isFocused?: boolean;
}

const LeftInputIcon = ({
  icon,
  size = 36,
  primaryColor = '#001F5B',
  accentColor = '#003B99',
  isFocused = false,
}: LeftInputIconProps) => {
  const pressAnim = React.useRef(new Animated.Value(0)).current;
  const focusAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isFocused, focusAnim]);

  const handlePressIn = () => Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, friction: 6, tension: 100 }).start();
  const handlePressOut = () => Animated.spring(pressAnim, { toValue: 0, useNativeDriver: true, friction: 6, tension: 100 }).start();

  const scale = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] });
  const rotate = focusAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '10deg'] });
  const BORDER = 2;
  const outerSize = size + BORDER * 2;

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={iconStyles.wrapper} hitSlop={6}>
      <LinearGradient colors={[primaryColor, accentColor]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[iconStyles.gradientBorder, { width: outerSize, height: outerSize, borderRadius: outerSize / 2 }]}>
        <Animated.View style={[iconStyles.innerCircle, { width: size, height: size, borderRadius: size / 2, transform: [{ scale }] }]}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <FontAwesome5 name={icon} size={size * 0.5} color={primaryColor} />
          </Animated.View>
        </Animated.View>
      </LinearGradient>
      <LinearGradient colors={[accentColor, primaryColor]} style={[iconStyles.separator, { height: outerSize + 4 }]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
    </Pressable>
  );
};

const iconStyles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingLeft: 8 },
  gradientBorder: { justifyContent: 'center', alignItems: 'center' },
  innerCircle: { backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  separator: { width: 2, borderRadius: 1.5, marginLeft: 8 },
});


// =================================================================
// 3. HOOK DE LOGIQUE MÉTIER (COMPLET)
// =================================================================
type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

const useLogin = () => {
   
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [failedAttempts, setFailedAttempts] = React.useState(0);
  const [lockoutTime, setLockoutTime] = React.useState(0);
  const [validationStatus, setValidationStatus] = React.useState<ValidationStatus>('idle');
  const [validationMessage, setValidationMessage] = React.useState<string | null>(null);
  const isLockedOut = lockoutTime > 0;

  const { promptToSaveCredentials } = useBiometricAuth(); // 🆕 AJOUTE CETTE LIGNE
  
  

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLockedOut) {
      timer = setInterval(() => {
        setLockoutTime(prev => {
          const newTime = Math.max(0, prev - 1);
          if (newTime === 0) {
            setErrorMessage(null);
            setFailedAttempts(0); 
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLockedOut]);

  React.useEffect(() => {
    const handler = setTimeout(async () => {
      const value = identifier.trim();
      if (value.length < 3) {
        setValidationStatus('idle'); setValidationMessage(null); return;
      }
      setValidationStatus('validating'); setValidationMessage(null);
      if (value.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          setValidationStatus('invalid'); setValidationMessage("Format d'email invalide.");
        } else {
          const usersQ = query(collection(db as Firestore, 'users'), where('email', '==', value.toLowerCase()), limit(1));
          const usersSnap = await getDocs(usersQ);
          setValidationStatus(usersSnap.empty ? 'invalid' : 'valid');
          setValidationMessage(usersSnap.empty ? "Cet email n'est pas reconnu." : 'Email valide ✓');
        }
      } else {
        const usersQ = query(collection(db as Firestore, 'users'), where('username', '==', value.toLowerCase()), limit(1));
        const usersSnap = await getDocs(usersQ);
        setValidationStatus(usersSnap.empty ? 'invalid' : 'valid');
        setValidationMessage(usersSnap.empty ? "Ce pseudo n'est pas reconnu." : 'Pseudo valide ✓');
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [identifier]);

  React.useEffect(() => {
    if (identifier || password) setErrorMessage(null);
  }, [identifier, password]);

  const loginWithCredentials = async (id: string, pass: string) => {
    setLoading(true);
    setErrorMessage(null);
    let emailToUse: string | null = null;
    try {
      if (!id.includes('@')) {
        const usersQ = query(collection(db as Firestore, 'users'), where('username', '==', id.toLowerCase()), limit(1));
        const usersSnap = await getDocs(usersQ);
        if (usersSnap.empty) throw new Error('auth/user-not-found');
        emailToUse = usersSnap.docs[0].data().email as string;
      } else {
        emailToUse = id;
      }
      if (emailToUse) {
        await signInWithEmailAndPassword(auth as Auth, emailToUse, pass);
        setIsSuccess(true);
      }
    } catch (err: any) {
      Vibration.vibrate(100);
      setErrorMessage("Les identifiants sauvegardés ne sont plus valides. Veuillez vous reconnecter.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (isLockedOut) {
      setErrorMessage(`Trop de tentatives. Veuillez réessayer dans ${lockoutTime} secondes.`);
      return;
    }
    setErrorMessage(null);
    setIsSuccess(false);
    Keyboard.dismiss();
    const identifierTrimmed = identifier.trim();
    if (!identifierTrimmed || !password) {
      setErrorMessage("Merci de renseigner tous les champs.");
      Vibration.vibrate(100);
      return;
    }
    setLoading(true);
    let emailToUse: string | null = null;
    try {
      if (!identifierTrimmed.includes('@')) {
        const usersQ = query(collection(db as Firestore, 'users'), where('username', '==', identifierTrimmed.toLowerCase()), limit(1));
        const usersSnap = await getDocs(usersQ);
        if (usersSnap.empty) { throw new Error('auth/user-not-found'); }
        emailToUse = usersSnap.docs[0].data().email as string;
      } else {
        emailToUse = identifierTrimmed;
      }
      if (emailToUse) {
        await signInWithEmailAndPassword(auth as Auth, emailToUse, password);
setFailedAttempts(0);
// 🆕 AJOUTE CETTE LIGNE :
await promptToSaveCredentials(identifierTrimmed, password);
setIsSuccess(true);
        
      }
    } catch (err: any) {
      Vibration.vibrate(100);
      const newAttemptCount = failedAttempts + 1;
      setFailedAttempts(newAttemptCount);
      if (newAttemptCount >= 3) {
        const lockoutDuration = 15 * (newAttemptCount - 2);
        setLockoutTime(lockoutDuration);
        setErrorMessage(`Trop de tentatives. Veuillez réessayer dans ${lockoutDuration} secondes.`);
      } else {
        if (err.code === 'auth/network-request-failed') {
          setErrorMessage("Problème de connexion.");
        } else {
          setErrorMessage("Identifiant ou mot de passe incorrect.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    identifier, setIdentifier, password, setPassword, errorMessage, handleLogin,
    isLoading: loading, isSuccess, isLockedOut, lockoutTime, validationStatus, validationMessage,
    loginWithCredentials,
  };
};

// =================================================================
// 4. THÈME ET COMPOSANTS UI AUXILIAIRES
// =================================================================
const theme = {
  ...DefaultTheme,
  roundness: 12,
  colors: { ...DefaultTheme.colors, primary: '#0A72BB', accent: '#E5B20A', background: '#F7FAFC', surface: '#FFFFFF', text: '#1A202C', error: '#E53E3E', placeholder: '#A0AEC0', onSurface: '#1A202C', success: '#2F855A' },
};

const ICON_SIZE = 30;
const LOGO_SIZE = 140;

const FormSkeleton = () => {
  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(anim, { toValue: 0, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
  }, [anim]);
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] });
  return (
    <View>
      <Animated.View style={[styles.skeletonItem, { height: 58, opacity }]} />
      <Animated.View style={[styles.skeletonItem, { height: 20, width: '60%', marginTop: 4, opacity }]} />
      <Animated.View style={[styles.skeletonItem, { height: 58, marginTop: 18, opacity }]} />
      <Animated.View style={[styles.skeletonItem, { height: 58, marginTop: 32, borderRadius: 50, opacity }]} />
    </View>
  );
};

// =================================================================
// 5. ÉCRAN DE CONNEXION PRINCIPAL (COMPLET)
// =================================================================
export default function LoginScreen() {
  const {
    identifier, setIdentifier, password, setPassword, errorMessage, handleLogin, isLoading, isSuccess,
    isLockedOut, lockoutTime, validationStatus, validationMessage, loginWithCredentials,
  } = useLogin();
  const { isBiometricSupported, biometricType, handleBiometricLogin, promptToSaveCredentials } = useBiometricAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [focusedInput, setFocusedInput] = React.useState<'identifier' | 'password' | null>(null);
  const passwordInputRef = React.useRef<any>(null);

  const masterAnim = React.useRef(new Animated.Value(0)).current;
  const shakeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(masterAnim, { toValue: 1, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [masterAnim]);

  React.useEffect(() => {
    if (errorMessage && !isLockedOut) {
      shakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 12, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -12, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 12, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    }
  }, [errorMessage, isLockedOut, shakeAnim]);
  
  React.useEffect(() => {
    if (isSuccess) {
      Animated.timing(masterAnim, { toValue: 2, duration: 500, easing: Easing.in(Easing.ease), useNativeDriver: true }).start(() => navigation.replace('Home'));
    }
  }, [isSuccess, masterAnim, navigation]);

  const triggerBiometricLogin = async () => {
    const credentials = await handleBiometricLogin();
    if (credentials) {
      await loginWithCredentials(credentials.identifier, credentials.password);
    }
  };

  const headerOpacity = masterAnim.interpolate({ inputRange: [0, 0.5, 2], outputRange: [0, 1, 0] });
  const headerTranslateY = masterAnim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0], extrapolate: 'clamp' });
  const formOpacity = masterAnim.interpolate({ inputRange: [0.3, 1, 2], outputRange: [0, 1, 0] });
  const formTranslateY = masterAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [40, 0, -40] });

  const hasValidationMessage = validationStatus !== 'idle' && validationMessage;
  const isValidationInvalid = validationStatus === 'invalid';
  const isValidationValid = validationStatus === 'valid';

  const biometricIconName = biometricType === 'face' ? 'id-badge' : 'fingerprint';
  const biometricText = biometricType === 'face' ? 'Face ID' : 'Empreinte biométrique';

  return (
    <PaperProvider theme={theme}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={require('assets/images/imagebacklogin.png')} style={styles.backgroundImage} resizeMode="cover">
        <LinearGradient colors={['rgba(6, 60, 115, 0.9)', 'rgba(10, 114, 187, 0.7)', 'rgba(180, 210, 235, 0.5)']} style={StyleSheet.absoluteFill} />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAwareScrollView style={styles.flex} contentContainerStyle={styles.scrollViewContent} enableOnAndroid extraScrollHeight={Platform.OS === 'ios' ? 20 : 0} keyboardShouldPersistTaps="handled">
            <SafeAreaView style={styles.flex} edges={['bottom']}>
              <View style={styles.contentWrapper}>
                <Animated.View style={[styles.headerContainer, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
                  <Animated.Image source={require('assets/images/logoSimpleT.png')} style={[styles.logo, { transform: [{ scale: masterAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }]} resizeMode="contain" />
                  <Text style={styles.titleText}>Christ En Nous</Text>
                  <Text style={styles.subtitle}>Shalom ! Connecte-toi à ton église.</Text>
                </Animated.View>

                <Animated.View style={[styles.formContainer, { opacity: formOpacity, transform: [{ translateY: formTranslateY }, { translateX: shakeAnim }] }]}>
                  {isLoading ? <FormSkeleton /> : (
                    <>
                      <View>
                        <TextInput
                          mode="outlined"
                          label="Email ou nom d'utilisateur"
                          value={identifier}
                          onChangeText={setIdentifier}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          style={styles.input}
                          onFocus={() => setFocusedInput('identifier')}
                          onBlur={() => setFocusedInput(null)}
                          onSubmitEditing={() => passwordInputRef.current?.focus()}
                          returnKeyType="next"
                          disabled={isLockedOut}
                          left={<TextInput.Icon forceTextInputFocus={false} icon={() => (<LeftInputIcon icon="user" size={ICON_SIZE} primaryColor={theme.colors.primary} accentColor={theme.colors.accent} isFocused={focusedInput === 'identifier'} />)}/>}
                        />
                        {validationStatus === 'validating' && <ActivityIndicator style={styles.validationLoader} size="small" />}
                      </View>
                      <HelperText type={isValidationInvalid ? 'error' : 'info'} visible={!!hasValidationMessage} style={[styles.validationText, isValidationValid && { color: theme.colors.success }]}>
                        {validationMessage || ' '}
                      </HelperText>
                      
                      <TextInput
                        ref={passwordInputRef}
                        mode="outlined"
                        label="Mot de passe"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} size={ICON_SIZE} onPress={() => setShowPassword(!showPassword)} disabled={isLockedOut} />}
                        style={styles.input}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                        returnKeyType="done"
                        onSubmitEditing={handleLogin}
                        disabled={isLockedOut}
                        left={<TextInput.Icon forceTextInputFocus={false} icon={() => (<LeftInputIcon icon="lock" size={ICON_SIZE} primaryColor={theme.colors.primary} accentColor={theme.colors.accent} isFocused={focusedInput === 'password'} />)}/>}
                      />
                      
                      <HelperText type="error" visible={!!errorMessage} style={styles.errorText}>{errorMessage || ' '}</HelperText>

                      <Button mode="contained" onPress={handleLogin} disabled={isLockedOut} style={[styles.loginButton, isLockedOut && styles.lockedButton]} contentStyle={styles.loginButtonContent} labelStyle={styles.loginButtonLabel} buttonColor={isLockedOut ? '#A0AEC0' : theme.colors.accent}>
                        {isLockedOut ? `Réessayer dans ${lockoutTime}s` : 'Se connecter'}
                      </Button>

                      {isBiometricSupported && (
                        <TouchableOpacity onPress={triggerBiometricLogin} style={styles.biometricContainer} disabled={isLockedOut}>
                          <FontAwesome5 name={biometricIconName} size={22} color={theme.colors.primary} />
                          <Text style={styles.biometricText}>{biometricText}</Text>
                        </TouchableOpacity>
                      )}

                      <View style={styles.actionsContainer}>
                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} disabled={isLockedOut}><Text style={styles.linkText}>Mot de passe oublié ?</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => Alert.alert("Aide", "Pour tout problème de connexion, veuillez contacter le support de l'église.")} disabled={isLockedOut}><Text style={styles.linkText}>Besoin d&apos;aide ?</Text></TouchableOpacity>
                      </View>
                      <TouchableOpacity style={styles.registerContainer} onPress={() => navigation.navigate('Register')} disabled={isLockedOut}><Text style={[styles.linkText, styles.registerLink]}>Première fois ? S&apos;inscrire</Text></TouchableOpacity>
                    </>
                  )}
                </Animated.View>
              </View>
            </SafeAreaView>
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
      </ImageBackground>
    </PaperProvider>
  );
}

// =================================================================
// 6. STYLES CENTRALISÉS ET DE QUALITÉ PROFESSIONNELLE
// =================================================================
const styles = StyleSheet.create({
  flex: { flex: 1 },
  backgroundImage: { flex: 1 },
  scrollViewContent: { flexGrow: 1, justifyContent: 'center', paddingBottom: 20 },
  contentWrapper: { paddingHorizontal: 24 },
  headerContainer: { alignItems: 'center', marginBottom: 24, backgroundColor: 'transparent' },
  logo: { width: LOGO_SIZE, height: LOGO_SIZE, marginBottom: 16 },
  titleText: { fontSize: 34, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  subtitle: { fontSize: 16, color: '#E0F2FE', textAlign: 'center', marginTop: 8 },
  formContainer: { backgroundColor: 'rgba(255, 255, 255, 0.95)', paddingTop: 24, paddingBottom: 16, paddingHorizontal: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  input: { backgroundColor: theme.colors.surface },
  validationLoader: { position: 'absolute', right: 16, top: 18 },
  validationText: { fontSize: 13, fontWeight: '500', minHeight: 20, marginTop: -10, marginBottom: 6, paddingHorizontal: 4 },
  loginButton: { borderRadius: 50, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  loginRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  biometricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  biometricText: {
    marginLeft: 12,
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  lockedButton: { backgroundColor: '#A0AEC0' },
  loginButtonContent: { paddingVertical: 12 },
  loginButtonLabel: { fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5, color: '#FFFFFF' },
  errorText: { textAlign: 'center', fontSize: 14, fontWeight: '500', minHeight: 20, marginTop: -8, marginBottom: 8 },
  actionsContainer: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  registerContainer: { marginTop: 8, alignItems: 'center' },
  linkText: { color: theme.colors.primary, fontSize: 14, paddingVertical: 8, fontWeight: '500' },
  registerLink: { fontWeight: 'bold', color: theme.colors.primary, fontSize: 15 },
  skeletonItem: { backgroundColor: 'rgba(200, 200, 220, 0.5)', borderRadius: 8, marginBottom: 12 },
});
