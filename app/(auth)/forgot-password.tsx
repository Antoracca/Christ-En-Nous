import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Platform,
  Animated,
  Easing,
  Vibration,
  Keyboard,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TouchableWithoutFeedback,
  Pressable,
  GestureResponderEvent,
  Linking,
  Alert,
} from 'react-native';
import {
  Provider as PaperProvider,
  DefaultTheme,
  TextInput,
  Button,
  HelperText,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import NetInfo from '@react-native-community/netinfo';
import { auth, db } from 'services/firebase/firebaseConfig';

// =================================================================
// 1. COMPONENT LeftInputIcon
// =================================================================
function LeftInputIcon({
  icon,
  size = 36,
  primaryColor = '#001F5B',
  accentColor = '#003B99',
  onPress,
}: {
  icon: React.ComponentProps<typeof FontAwesome5>['name'];
  size?: number;
  primaryColor?: string;
  accentColor?: string;
  onPress?: () => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  const handlePressIn = (_event: GestureResponderEvent) => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 6, tension: 100 }).start();
  };

  const handlePressOut = (_event: GestureResponderEvent) => {
    Animated.spring(anim, { toValue: 0, useNativeDriver: true, friction: 6, tension: 100 }).start();
    onPress?.();
  };

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] });
  const BORDER = 2;
  const outerSize = size + BORDER * 2;

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={iconStyles.wrapper} hitSlop={6}>
      <LinearGradient
        colors={[primaryColor, accentColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[iconStyles.gradientBorder, { width: outerSize, height: outerSize, borderRadius: outerSize / 2 }]}
      >
        <Animated.View style={[iconStyles.innerCircle, { width: size, height: size, borderRadius: size / 2, transform: [{ scale }] }]}>
          <FontAwesome5 name={icon} size={size * 0.6} color={primaryColor} />
        </Animated.View>
      </LinearGradient>
    </Pressable>
  );
}

const iconStyles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', paddingLeft: 8 },
  gradientBorder: { justifyContent: 'center', alignItems: 'center' },
  innerCircle: { backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
});


// =================================================================
// 2. HOOK DE LOGIQUE MÉTIER
// =================================================================
const useForgotPassword = () => {
  const [email, setEmail] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    setErrorMessage(null);

    // ✅ CORRIGÉ: Vérification réseau plus fiable
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      console.error("[ERREUR] Pas de connexion réseau active (WiFi ou cellulaire).");
      setErrorMessage("Aucune connexion réseau. Veuillez vérifier vos paramètres et réessayer.");
      Vibration.vibrate(100);
      return;
    }

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setErrorMessage("Votre adresse e-mail est requise.");
      Vibration.vibrate(100);
      return;
    }
    
    setLoading(true);

    try {
      console.log(`[LOG] Étape 2: Vérification de l'email '${emailTrimmed}' dans Firestore.`);
      const usersQuery = query(collection(db, 'users'), where('email', '==', emailTrimmed.toLowerCase()));
      const querySnapshot = await getDocs(usersQuery);

      if (querySnapshot.empty) {
        console.warn(`[LOG] Email non trouvé dans Firestore.`);
        setErrorMessage("Désolé, cette adresse e-mail n'existe pas. Veuillez vérifier et réessayer.");
        Vibration.vibrate(100);
        setLoading(false);
        return;
      }

      console.log(`[LOG] Étape 3: Email trouvé. Tentative d'envoi du lien de réinitialisation.`);
      await sendPasswordResetEmail(auth, emailTrimmed);
      
      console.log(`[LOG] Succès: Email de réinitialisation envoyé à ${emailTrimmed}.`);
      setIsSuccess(true);
      Vibration.vibrate([0, 50, 100, 50]);

    } catch (error: any) {
      console.error("[ERREUR] Une erreur est survenue durant le processus:", error);
      Vibration.vibrate(100);
      if (error.code === 'auth/network-request-failed') {
        setErrorMessage("Problème de connexion réseau. Veuillez vérifier votre connexion.");
      } else if (error.code === 'auth/too-many-requests') {
          setErrorMessage("Trop de tentatives. Veuillez patienter avant de réessayer.");
      } else {
        setErrorMessage("Une erreur est survenue. Impossible d'envoyer le lien.");
      }
    } finally {
      if (!isSuccess) {
          setLoading(false);
      }
    }
  };

  return { email, setEmail, errorMessage, loading, isSuccess, handleResetPassword };
};

// =================================================================
// 3. THÈME ET CONSTANTES
// =================================================================
const theme = {
  ...DefaultTheme,
  roundness: 12,
  colors: { ...DefaultTheme.colors, primary: '#0A72BB', accent: '#E5B20A', background: '#F7FAFC', surface: '#FFFFFF', text: '#1A202C', error: '#E53E3E', placeholder: '#A0AEC0', onSurface: '#1A202C', success: '#2F855A' },
};
const ICON_SIZE = 30;
const LOGO_SIZE = 140;


// =================================================================
// 4. ÉCRAN PRINCIPAL
// =================================================================
export default function ForgotPasswordScreen() {
  const { email, setEmail, errorMessage, loading, isSuccess, handleResetPassword } = useForgotPassword();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { isAuthenticated } = useAuth();
  const masterAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(masterAnim, { toValue: 1, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [masterAnim]);

  useEffect(() => {
    if (errorMessage) {
      shakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 12, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -12, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 12, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    }
  }, [errorMessage, shakeAnim]);

  useEffect(() => {
    if (isSuccess) {
      Animated.timing(successAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
    }
  }, [isSuccess, successAnim]);
  
  const showHelpDialog = () => {
     Alert.alert(
       "Besoin d'aide ?",
       "Si vous ne recevez pas l'email, vérifiez vos spams ou contactez directement le support de l'église.",
       [
         {
           text: "Contacter le support",
           onPress: () => Linking.openURL('mailto:teamsupport@christennous.com?subject=Aide%20-%20Mot%20de%20passe%20oublié'),
         },
         { text: "Compris", style: "cancel" }
       ]
     );
  };

  const headerOpacity = masterAnim.interpolate({ inputRange: [0, 0.5], outputRange: [0, 1] });
  const headerTranslateY = masterAnim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0], extrapolate: 'clamp' });
  const formOpacity = masterAnim.interpolate({ inputRange: [0.3, 1], outputRange: [0, 1] });
  const formTranslateY = masterAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });

  const isButtonDisabled = !email.trim() || loading;

  return (
    <PaperProvider theme={theme}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={require('assets/images/imagebacklogin.png')} style={styles.backgroundImage} resizeMode="cover">
        <LinearGradient colors={['rgba(6, 60, 115, 0.9)', 'rgba(10, 114, 187, 0.7)', 'rgba(180, 210, 235, 0.5)']} style={StyleSheet.absoluteFill} />
        <KeyboardAwareScrollView style={styles.flex} contentContainerStyle={styles.scrollViewContent} enableOnAndroid keyboardShouldPersistTaps="handled">
          <SafeAreaView style={styles.flex} edges={['bottom']}>
            <View style={styles.contentWrapper}>
              
              <Animated.View style={[styles.headerContainer, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
                <Animated.Image source={require('assets/images/logoSimpleT.png')} style={[styles.logo, { transform: [{ scale: masterAnim }] }]} resizeMode="contain" />
                <Text style={styles.titleText}>Christ En Nous</Text>
                <Text style={styles.subtitle}>Récupération de compte</Text>
              </Animated.View>

              <Animated.View style={[styles.formContainer, { opacity: formOpacity, transform: [{ translateY: formTranslateY }, { translateX: shakeAnim }] }]}>
                {isSuccess ? (
                  <Animated.View style={[styles.successContainer, { opacity: successAnim }]}>
                    <Ionicons name="checkmark-circle" size={60} color={theme.colors.success} style={{ marginBottom: 16 }} />
                    <Text style={styles.successTitle}>Email envoyé !</Text>
                    <Text style={styles.successMessage}>
                      Un lien pour réinitialiser votre mot de passe a été envoyé à <Text style={{ fontWeight: 'bold' }}>{email}</Text>.
                    </Text>
                    <Text style={styles.successSubMessage}>Veuillez vérifier votre boîte de réception et vos spams.</Text>
                    <Button mode="contained" onPress={() => isAuthenticated ? router.back() : router.push('/(auth)/login')} style={styles.actionButton} contentStyle={styles.actionButtonContent} labelStyle={styles.actionButtonLabel} buttonColor={theme.colors.primary}>
                      Retour
                    </Button>
                  </Animated.View>
                ) : (
                  <>
                    <View style={styles.keyIconContainer}>
                        <Ionicons name="key-outline" size={38} color={theme.colors.accent} />
                    </View>
                    <Text style={styles.formTitle}>Mot de passe oublié ?</Text>
                    <Text style={styles.formSubtitle}>Pas de souci ! Entrez votre adresse email et nous vous enverrons un lien pour le réinitialiser.</Text>
                    
                    <TextInput
                      mode="outlined" label="Adresse email" value={email} onChangeText={setEmail}
                      keyboardType="email-address" autoCapitalize="none" style={styles.input}
                      onSubmitEditing={handleResetPassword} returnKeyType="send" disabled={loading}
                      left={<TextInput.Icon forceTextInputFocus={false} icon={() => (<LeftInputIcon icon="envelope" size={ICON_SIZE} primaryColor={theme.colors.primary} accentColor={theme.colors.accent} />)} />}
                    />
                    
                    <HelperText type="error" visible={!!errorMessage} style={styles.errorText}>{errorMessage || ' '}</HelperText>

                    <Button 
                      mode="contained" 
                      onPress={handleResetPassword} 
                      style={styles.actionButton} 
                      contentStyle={styles.actionButtonContent} 
                      labelStyle={styles.actionButtonLabel} 
                      buttonColor={theme.colors.accent} 
                      loading={loading} 
                      disabled={isButtonDisabled}
                    >
                      {loading ? 'Vérification...' : 'Envoyer le lien'}
                    </Button>

                    <View style={styles.actionsContainer}>
                        <TouchableOpacity onPress={() => isAuthenticated ? router.back() : router.push('/(auth)/login')} disabled={loading}>
                            <Text style={styles.linkText}>Retour</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={showHelpDialog} disabled={loading}>
                            <Text style={styles.linkText}>Besoin d&apos;aide ?</Text>
                        </TouchableOpacity>
                    </View>
                  </>
                )}
              </Animated.View>
            </View>
          </SafeAreaView>
        </KeyboardAwareScrollView>
      </ImageBackground>
    </PaperProvider>
  );
}


// =================================================================
// 5. STYLES
// =================================================================
const styles = StyleSheet.create({
  flex: { flex: 1 },
  backgroundImage: { flex: 1 },
  scrollViewContent: { flexGrow: 1, justifyContent: 'center', paddingBottom: 20 },
  contentWrapper: { 
    paddingHorizontal: 16,
  },
  headerContainer: { alignItems: 'center', marginBottom: 24 },
  logo: { width: LOGO_SIZE, height: LOGO_SIZE, marginBottom: -15, marginTop: 60 },
  titleText: { fontSize: 34, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  subtitle: { fontSize: 16, color: '#E0F2FE', textAlign: 'center', marginTop: 8 },
  formContainer: { 
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    paddingVertical: 24, 
    paddingHorizontal: 16,
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.2)', 
    minHeight: 340, 
    justifyContent: 'center' 
  },
  keyIconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(229, 178, 10, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16, alignSelf: 'center' },
  formTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', color: theme.colors.text, marginBottom: 8 },
  formSubtitle: { fontSize: 15, textAlign: 'center', color: theme.colors.placeholder, lineHeight: 22, marginBottom: 24 },
  input: { backgroundColor: theme.colors.surface },
  errorText: { textAlign: 'center', fontSize: 14, fontWeight: '500', minHeight: 20, marginTop: -4, marginBottom: 8 },
  actionButton: { borderRadius: 50, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, marginTop: 8 },
  actionButtonContent: { paddingVertical: 12 },
  actionButtonLabel: { fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5, color: '#FFFFFF' },
  actionsContainer: { marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkText: { color: theme.colors.primary, fontSize: 14, paddingVertical: 8, fontWeight: '500' },
  // Styles pour la vue de succès
  successContainer: { alignItems: 'center', paddingVertical: 20 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.success, marginBottom: 12, textAlign: 'center' },
  successMessage: { fontSize: 16, color: theme.colors.text, textAlign: 'center', marginBottom: 8, paddingHorizontal: 10 },
  successSubMessage: { fontSize: 14, color: theme.colors.placeholder, textAlign: 'center', marginBottom: 24 },
});
