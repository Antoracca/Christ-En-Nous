import * as React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ImageBackground,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Provider as PaperProvider,
  DefaultTheme,
  TextInput,
  HelperText,
  Button,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { StatusBar } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { auth, db } from '../../services/firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, limit, getDocs } from 'firebase/firestore/lite';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#002366',
    accent: '#FFD700',
  },
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 👇 Typage de la navigation
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function Login({ logoYPosition = 220, logoSize = 140 }) {
  const navigation = useNavigation<NavigationProp>();
  const [identifier, setIdentifier] = React.useState('');
const [password, setPassword] = React.useState('');
const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
const [showPassword, setShowPassword] = React.useState(false);

// Dans ton composant Login, ajoute d’abord ce state :
const [loading, setLoading] = React.useState(false);

const handleLogin = async () => {
  // 1️⃣ Réinit et validation basique
  setErrorMessage(null);
  if (!identifier.trim() || !password) {
    setErrorMessage("Merci de renseigner ton email (ou pseudo) et ton mot de passe.");
    return;
  }
  setLoading(true);

  try {
    const input = identifier.trim();
    let emailToUse = input;

    // 2️⃣ Si c'est un pseudo, on le recherche (limit 1 pour la rapidité)
    if (!input.includes('@')) {
      const usersQ = query(
        collection(db, 'users'),
        where('username', '==', input),
        limit(1)
      );
      const usersSnap = await getDocs(usersQ);

      if (usersSnap.empty) {
        // Code custom pour un pseudo introuvable
        throw { code: 'USERNAME_NOT_FOUND' };
      }
      emailToUse = usersSnap.docs[0].data().email as string;
    }

    // 3️⃣ Connexion Firebase
    await signInWithEmailAndPassword(auth, emailToUse, password);

    // 4️⃣ Redirection sans possibilité de retour arrière
    navigation.replace('Home');

  } catch (err: any) {
    console.error('handleLogin error:', err.code || err);

    // 5️⃣ Gestion unifiée et “humaine” des codes d’erreur
    const code = err.code as string;
    if (
      code === 'USERNAME_NOT_FOUND' ||
      code === 'auth/user-not-found' ||
      code === 'auth/invalid-credential'
    ) {
      setErrorMessage(
        "Identifiants incorrects. Vérifie ton email, pseudo ou mot de passe."
      );
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

  return (
    <PaperProvider theme={theme}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={styles.container}>

        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >

          
          <ImageBackground
            source={require('../../assets/images/imagebacklogin.png')}
            style={styles.headerBackground}
            resizeMode="cover"
          >
            
            <LinearGradient
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
             colors={[
  'rgba(6, 60, 115, 0.95)',   // bleu foncé
  'rgba(10, 114, 187, 0.95)', // bleu moyen
  'rgba(180, 210, 235, 1)',   // bleu ciel
]}
locations={[0, 0.9, 0.9]}
              style={styles.gradientOverlay}
            />

            <Svg
  height="150"
  width="150%"
  viewBox="0 0 1440 320"
  style={{ position: 'absolute', bottom: 0 }}
>
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
                source={require('../../assets/images/logoSimpleT.png')}
                style={{ width: logoSize, height: logoSize }}
                resizeMode="contain"
              />
            </View>
          </ImageBackground>

          <Text style={[styles.logoText, { fontSize: logoSize / 5 }]}>Christ en Nous</Text>
          <Text style={styles.subtitle}>Shalom, bien-aimé(e) ! Connecte-toi à ton église</Text>

          <View style={styles.formContainer}>
            <TextInput
              label="Email ou nom d'utilisateur"
              value={identifier}
  onChangeText={setIdentifier}
              placeholder="Entrez votre email ou Pseudo"
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              style={styles.input}
              right={<TextInput.Icon icon="account" />}  
              
            />
            <TextInput
  label="Mot de passe"
  value={password}
  onChangeText={setPassword}
  placeholder="Entrez votre mot de passe"
  secureTextEntry={!showPassword} // 👁️ lié à ton state
  right={
    <TextInput.Icon
      icon={showPassword ? "eye-off" : "eye"}
      onPress={() => setShowPassword(!showPassword)}
    />
  }
  mode="outlined"
  style={styles.input}
/>
{errorMessage && (
  <Text
    style={{
      color: 'red',
      textAlign: 'center',
      marginBottom: 10,
      fontSize: 13,
      paddingHorizontal: 10,
      lineHeight: 18,
    }}
    numberOfLines={3}
    ellipsizeMode="tail"
  >
    {errorMessage}
  </Text>
)}


           

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
        </KeyboardAvoidingView>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBackground: {
    flex: 2,
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
    marginTop: 40,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  formContainer: {
    flex: 3,
    padding: 20,
    justifyContent: 'flex-start',
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 30,
  },
  helperText: {
    fontSize: 12,
    marginBottom: 10,
    color: '#6c757d',
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 5,
  },
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
}); 