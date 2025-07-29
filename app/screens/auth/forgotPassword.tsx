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
  Keyboard, // Importé pour masquer le clavier
  TouchableWithoutFeedback, // Importé pour masquer le clavier au toucher
} from 'react-native';
import { TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from 'services/firebase/firebaseConfig'; // Assurez-vous que ce chemin est correct
import LeftInputIcon from '../../components/LeftInputIcon'; // Assurez-vous que ce chemin est correct

// Récupération des dimensions de l'écran pour les styles responsives
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Écran de réinitialisation du mot de passe.
 * Permet aux utilisateurs de demander un e-mail de réinitialisation de mot de passe via Firebase.
 */
export default function ForgotPassword() {
  // --- Animations de l'en-tête ---
  // Valeurs animées pour le mouvement de glissement et l'opacité
  const slideAnim = useRef(new Animated.Value(80)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Effet pour déclencher les animations au montage du composant
  useEffect(() => {
    Animated.parallel([
      // Animation de glissement (déplace l'en-tête de 80px vers le haut à 0px)
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1800, // Durée de l'animation
        easing: Easing.out(Easing.exp), // Effet d'accélération/décélération
        useNativeDriver: true, // Utilise le thread natif pour de meilleures performances
      }),
      // Animation de fondu (rend l'en-tête visible de 0 à 1 d'opacité)
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start(); // Démarre les animations en parallèle
  }, [slideAnim, fadeAnim]); // Dépendances de l'effet

  // --- États du formulaire et Hooks de navigation ---
  const navigation = useNavigation(); // Hook de navigation de React Navigation
  const { colors } = useTheme(); // Hook pour accéder aux couleurs du thème React Native Paper
  const [email, setEmail] = useState(''); // État pour l'e-mail saisi par l'utilisateur
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // État pour les messages d'erreur/succès
  const [loading, setLoading] = useState(false); // État pour indiquer si une opération est en cours (chargement)

  /**
   * Valide le format de l'e-mail.
   * @param value L'e-mail à valider.
   * @returns Un message d'erreur si l'e-mail est invalide, sinon null.
   */
  const validateEmail = (value: string): string | null => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expression régulière pour la validation d'e-mail
    if (!value.trim()) return "L'email est requis."; // Vérifie si le champ est vide
    if (!re.test(value)) return 'Format d\'email invalide.'; // Vérifie le format
    return null; // L'e-mail est valide
  };

  /**
   * Gère l'envoi de l'e-mail de réinitialisation du mot de passe à Firebase.
   */
  const handleSend = async () => {
    // Valide l'e-mail avant d'envoyer
    const err = validateEmail(email);
    setErrorMsg(err);
    if (err) return; // Arrête si l'e-mail est invalide

    Keyboard.dismiss(); // Masque le clavier avant d'envoyer
    setLoading(true); // Active l'indicateur de chargement

    try {
      // Appelle la fonction Firebase pour envoyer l'e-mail de réinitialisation
      await sendPasswordResetEmail(auth, email.trim());
      setErrorMsg('✅ Lien envoyé ! Veuillez vérifier votre boîte de réception (et vos spams).');
      setEmail(''); // Efface le champ e-mail après l'envoi
    } catch (e: any) {
      // Gère les erreurs spécifiques de Firebase
      if (e.code === 'auth/user-not-found') {
        setErrorMsg('Aucun compte trouvé pour cet email. Veuillez vérifier l\'adresse.');
      } else if (e.code === 'auth/network-request-failed') {
        setErrorMsg('Problème de connexion internet. Veuillez réessayer.');
      } else {
        setErrorMsg('Une erreur est survenue, veuillez réessayer plus tard.');
        console.error("Erreur d'envoi de réinitialisation:", e); // Pour le débogage
      }
    } finally {
      setLoading(false); // Désactive l'indicateur de chargement
    }
  };

  return (
    // TouchableWithoutFeedback pour masquer le clavier en touchant l'extérieur des inputs
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        {/* En-tête animé */}
        <Animated.View
          style={[
            styles.headerContainer,
            { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
          ]}
        >
          <ImageBackground
            source={require('assets/images/imagebacklogin.png')} // Chemin de votre image de fond
            style={styles.headerBg}
            resizeMode="cover"
          >
            <View style={styles.headerContent}>
              <Animated.Image
                source={require('assets/images/logoSimpleT.png')} // Chemin de votre logo
                style={[styles.logo, { width: 96, height: 96 }]}
                resizeMode="contain"
              />
              <Text style={styles.headerTitle}>Christ en Nous</Text>
            </View>
          </ImageBackground>
        </Animated.View>

        {/* Conteneur du formulaire scrollable */}
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scroll}
          enableOnAndroid
          keyboardShouldPersistTaps="handled" // Permet de gérer les touchers même si le clavier est actif
        >
          <View style={styles.card}>
            <Text style={styles.title}>Mot de passe oublié</Text>

            <View style={styles.instructionContainer}>
              <HelperText type="info" visible>
                Entrez votre email pour recevoir un lien de réinitialisation.
              </HelperText>
            </View>

            <TextInput
              mode="outlined"
              label="Email"
              value={email}
              onChangeText={t => {
                setEmail(t);
                // Si un message d'erreur est affiché, le met à jour en temps réel
                if (errorMsg && !errorMsg.startsWith('✅')) setErrorMsg(validateEmail(t));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errorMsg && !errorMsg.startsWith('✅')} // Affiche l'erreur si errorMsg n'est pas un succès
              left={<TextInput.Icon icon={() => <LeftInputIcon icon="envelope" />} />}
              style={styles.input}
              disabled={loading} // Désactive l'input pendant le chargement
              returnKeyType="send" // Change le bouton "retour" du clavier en "envoyer"
              onSubmitEditing={handleSend} // Déclenche l'envoi quand l'utilisateur appuie sur "envoyer"
            />
            {/* Affiche le message d'erreur ou de succès */}
            {errorMsg && (
              <HelperText type={errorMsg.startsWith('✅') ? 'info' : 'error'} visible>
                {errorMsg}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleSend}
              loading={loading}
              disabled={!!validateEmail(email) || loading} // Désactive si l'e-mail est invalide ou si une opération est en cours
              style={[styles.button, { backgroundColor: colors.primary }]}
              contentStyle={styles.buttonContent}
            >
              Envoyer le lien
            </Button>

            {/* Lien pour revenir à l'écran de connexion */}
            <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
              <Text style={[styles.link, { color: colors.primary }]}>← Revenir à la connexion</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

// --- Styles du composant ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerContainer: {
    height: SCREEN_HEIGHT * 0.35, // 35% de la hauteur de l'écran
    overflow: 'hidden', // Cache le contenu qui dépasse
  },
  headerBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  logo: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#003C7D', // Couleur de votre titre
    textShadowColor: 'rgba(255,255,255,0.9)', // Ombre pour le contraste
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginTop: -16, // Ajustement pour positionner le titre sous le logo
  },
  scroll: {
    flexGrow: 1, // Permet au contenu de s'étendre
    justifyContent: 'center', // Centre le contenu verticalement
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: SCREEN_WIDTH - 32, // Largeur de la carte (largeur écran - marges)
    alignSelf: 'center', // Centre la carte horizontalement
    elevation: 3, // Ombre pour Android
    shadowColor: '#000', // Ombre pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    borderLeftColor: '#FACC15', // Couleur d'accentuation (jaune)
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F9FAFB', // Couleur de fond de l'input
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