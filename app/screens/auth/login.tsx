// src/screens/Login.tsx
import * as React from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
 
} from 'react-native';
import {
  Provider as PaperProvider,
  DefaultTheme,
  TextInput,
  Button,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from 'navigation/AppNavigator';
import Svg, { Path } from 'react-native-svg';
import { auth, db } from 'services/firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, limit, getDocs } from 'firebase/firestore/lite';
import LeftInputIcon from '../../components/LeftInputIcon';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#002366',
    accent: '#FFD700',
  },
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
interface LoginProps {
  logoSize?: number;
}
export default function Login({ logoSize = 140 }: LoginProps) {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!identifier.trim() || !password) {
      setErrorMessage("Merci de renseigner ton email (ou pseudo) et ton mot de passe.");
      return;
    }
    setLoading(true);
    try {
      let emailToUse = identifier.trim();
      if (!emailToUse.includes('@')) {
        const usersQ = query(
          collection(db, 'users'),
          where('username', '==', emailToUse),
          limit(1)
        );
        const usersSnap = await getDocs(usersQ);
        if (usersSnap.empty) throw { code: 'USERNAME_NOT_FOUND' };
        emailToUse = usersSnap.docs[0].data().email as string;
      }
      await signInWithEmailAndPassword(auth, emailToUse, password);
      navigation.replace('Home');
    } catch (err: any) {
      console.error('handleLogin error:', err.code || err);
      const code = err.code as string;
      if (
        code === 'USERNAME_NOT_FOUND' ||
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-credential'
      ) {
        setErrorMessage("Identifiants incorrects. Vérifie ton email, pseudo ou mot de passe.");
      } else if (code === 'auth/wrong-password') {
        setErrorMessage("Mot de passe incorrect. 😔");
      } else if (code === 'auth/invalid-email') {
        setErrorMessage("Adr. email invalide. Vérifie ton écriture.");
      } else {
        setErrorMessage("Oups ! Quelque chose s'est mal passé. Réessaie plus tard.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Hauteur totale scrollable (écran + safe-area bottom)
  const totalScrollHeight = SCREEN_HEIGHT + insets.bottom;

  return (
    <PaperProvider theme={theme}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAwareScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollView,
            { minHeight: totalScrollHeight, paddingBottom: insets.bottom },
          ]}
          enableOnAndroid
          extraScrollHeight={insets.bottom + 20}
          keyboardOpeningTime={0}
          enableAutomaticScroll
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <ImageBackground
            source={require('assets/images/imagebacklogin.png')}
            style={[styles.headerBackground, { height: SCREEN_HEIGHT * 0.35 + insets.top }]}
            resizeMode="cover"
          >
            <LinearGradient
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              colors={[
                'rgba(6, 60, 115, 0.95)',
                'rgba(10, 114, 187, 0.95)',
                'rgba(180, 210, 235, 1)',
              ]}
              locations={[0, 0.9, 0.9]}
              style={styles.gradientOverlay}
            />
            <Svg height="150" width="150%" viewBox="0 0 1440 320" style={styles.wave}>
              <Path
                fill="rgba(229, 178, 10, 0.95)"
                d="M0,160 C360,240 1080,80 1440,160 L1440,320 L0,320 Z"
              />
            </Svg>
            <View
              style={[
                styles.circleBackground,
                {
                  width: logoSize * 0.8,
                  height: logoSize,
                  borderTopLeftRadius: logoSize,
                  borderTopRightRadius: logoSize,
                },
              ]}
            >
              <Image
                source={require('assets/images/logoSimpleT.png')}
                style={{ width: logoSize, height: logoSize }}
                resizeMode="contain"
              />
            </View>
          </ImageBackground>

          {/* TITRE & FORM */}
          <Text style={[styles.logoText, { fontSize: logoSize / 5 }]}>Christ en Nous</Text>
          <Text style={styles.subtitle}>
            Shalom, bien-aimé(e) ! Connecte-toi à ton église
          </Text>

          <View style={styles.formContainer}>
            <TextInput
              mode="outlined"
              label="Email ou nom d'utilisateur"
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="Entrez votre email ou Pseudo"
              keyboardType="email-address"
              autoCapitalize="none"
              left={
                <TextInput.Icon
                  forceTextInputFocus
                  icon={({ size, color }) => (
                    <LeftInputIcon
                      icon="user"
                      size={size}
                      primaryColor={color}
                      accentColor={theme.colors.accent}
                    />
                  )}
                />
              }
              style={styles.input}
              underlineColor="transparent"
            />

            <TextInput
              mode="outlined"
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="Entrez votre mot de passe"
              secureTextEntry={!showPassword}
              left={
                <TextInput.Icon
                  forceTextInputFocus
                  icon={({ size, color }) => (
                    <LeftInputIcon
                      icon="lock"
                      size={size}
                      primaryColor={color}
                      accentColor={theme.colors.accent}
                    />
                  )}
                />
              }
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
              underlineColor="transparent"
            />

            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
              buttonColor="rgba(229, 178, 10, 0.95)"
              textColor="#FFFFFF"
            >
              Se connecter
            </Button>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Première fois ? Inscris-toi !</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flexGrow: 1 },
  headerBackground: {
    width: SCREEN_WIDTH,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  wave: { position: 'absolute', bottom: 0 },
  circleBackground: {
    position: 'absolute',
    bottom: -80,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoText: {
    color: '#0A72BB',
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  formContainer: { padding: 20 },
  input: { backgroundColor: '#FFFFFF', marginBottom: 20 },
  loginButton: { marginTop: 10, marginBottom: 20, paddingVertical: 5 },
  forgotPasswordText: {
    color: '#002366',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontSize: 13,
  },
  registerLink: {
    color: '#0A72BB',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
    textDecorationLine: 'underline',
    fontSize: 13,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 13,
    paddingHorizontal: 10,
    lineHeight: 18,
  },
});
