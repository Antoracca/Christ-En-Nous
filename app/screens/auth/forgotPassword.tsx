
// src/screens/ForgotPassword.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Animated,
  Easing,
} from 'react-native';
import { TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from 'services/firebase/firebaseConfig';
import LeftInputIcon from '../../components/LeftInputIcon';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ForgotPassword() {
  // -- Header animations --
  const slideAnim = useRef(new Animated.Value(80)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  // -- Form state --
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) return "L'email est requis.";
    if (!re.test(value)) return 'Format d\'email invalide.';
    return null;
  };

  const handleSend = async () => {
    const err = validateEmail(email);
    setErrorMsg(err);
    if (err) return;

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setErrorMsg('✅ Lien envoyé !');
    } catch (e: any) {
      setErrorMsg(
        e.code === 'auth/user-not-found'
          ? 'Aucun compte trouvé pour cet email.'
          : 'Erreur, réessayez plus tard.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Inline Header without subtitle */}
      <Animated.View
        style={[
          styles.headerContainer,
          { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
        ]}
      >
        <ImageBackground
          source={require('assets/images/imagebacklogin.png')}
          style={styles.headerBg}
          resizeMode="cover"
        >
          <View style={styles.headerContent}>
            <Animated.Image
              source={require('assets/images/logoSimpleT.png')}
              style={[styles.logo, { width: 96, height: 96 }]}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Christ en Nous</Text>
          </View>
        </ImageBackground>
      </Animated.View>

      {/* Form Card */}
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scroll}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Mot de passe oublié</Text>

          <View style={styles.instructionContainer}>
            <HelperText type="info" visible>
              Entrez votre email pour recevoir un code de réinitialisation.
            </HelperText>
          </View>

          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={t => {
              setEmail(t);
              if (errorMsg) setErrorMsg(validateEmail(t));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errorMsg}
            left={<TextInput.Icon icon={() => <LeftInputIcon icon="envelope" />} />}
            style={styles.input}
          />
          {errorMsg && (
            <HelperText type={errorMsg.startsWith('✅') ? 'info' : 'error'} visible>
              {errorMsg}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleSend}
            loading={loading}
            disabled={!!validateEmail(email) || loading}
            style={[styles.button, { backgroundColor: colors.primary }]}
            contentStyle={styles.buttonContent}
          >
            Envoyer le code
          </Button>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.link, { color: colors.primary }]}>← Revenir à la connexion</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  headerContainer: {
    height: SCREEN_HEIGHT * 0.35,
    overflow: 'hidden',
  },
  headerBg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContent: { alignItems: 'center' },
  logo: { marginBottom: 8 },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#003C7D',
    textShadowColor: 'rgba(255,255,255,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginTop: -16,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: SCREEN_WIDTH - 32,
    alignSelf: 'center',
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructionContainer: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderLeftWidth: 4,
    borderLeftColor: '#FACC15',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  button: {
    borderRadius: 24,
    marginVertical: 16,
  },
  buttonContent: {
    paddingVertical: 10,
  },
  link: {
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

