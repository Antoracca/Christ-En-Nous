import * as React from 'react';
import { Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const CREDENTIALS_KEY = 'userCredentials';
type BiometricType = 'face' | 'fingerprint' | null;

/**
 * Hook personnalisé pour gérer toute la logique d'authentification biométrique.
 */
export const useBiometricAuth = () => {
  const [isBiometricSupported, setIsBiometricSupported] = React.useState(false);
  const [biometricType, setBiometricType] = React.useState<BiometricType>(null);

  // Vérifie si l'appareil est compatible au premier chargement
  React.useEffect(() => {
    const checkSupport = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricSupported(hasHardware && isEnrolled);

      // 🆕 NOUVEAU : Détection du type de biométrie
      if (hasHardware) {
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('face');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        }
      }
    };
    
    checkSupport(); // 🔧 CORRECTION : Appel de la fonction !
  }, []);

  /**
   * Propose à l'utilisateur d'activer la connexion biométrique et sauvegarde les identifiants si accepté.
   * @param identifier - L'email ou le pseudo de l'utilisateur.
   * @param password - Le mot de passe de l'utilisateur.
   * @returns Une promesse qui se résout quand l'utilisateur a fait son choix.
   */
  const promptToSaveCredentials = (identifier: string, password: string): Promise<void> => {
    const promptMessage = biometricType === 'face' 
      ? "Voulez-vous activer la connexion par Face ID pour la prochaine fois ?"
      : "Voulez-vous activer la connexion par empreinte pour la prochaine fois ?";

    return new Promise((resolve) => {
      Alert.alert(
        "Connexion Rapide",
        promptMessage, // 🔧 CORRECTION : Message adaptatif !
        [
          { text: "Non merci", style: "cancel", onPress: () => resolve() },
          {
            text: "Activer",
            onPress: async () => {
              await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify({ identifier, password }));
              resolve();
            }
          },
        ]
      );
    });
  };

  /**
   * Tente de connecter l'utilisateur via la biométrie.
   * @returns Les identifiants (`{ identifier, password }`) en cas de succès, ou `null` en cas d'échec ou d'annulation.
   */
  const handleBiometricLogin = async (): Promise<{ identifier: string; password: string } | null> => {
    try {
      const credsString = await SecureStore.getItemAsync(CREDENTIALS_KEY);
      if (!credsString) {
        Alert.alert("Action requise", "Veuillez d'abord vous connecter une fois avec votre mot de passe pour activer cette fonctionnalité.");
        return null;
      }

      const promptMessage = biometricType === 'face' 
        ? 'Authentification via Face ID' 
        : 'Connectez-vous avec votre empreinte';

      // 🔧 CORRECTION : Options d'authentification améliorées
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage, // 🔧 Message adaptatif selon le type de biométrie
        cancelLabel: 'Utiliser le mot de passe',
        disableDeviceFallback: false, // Permet le repli vers le code d'accès
      });

      if (result.success) {
        return JSON.parse(credsString);
      }
      return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Alert.alert("Erreur", "L'authentification biométrique a échoué.");
      return null;
    }
  };

  return {
    isBiometricSupported,
    biometricType, // 🔧 CORRECTION : Retourne le type de biométrie !
    handleBiometricLogin,
    promptToSaveCredentials,
  };
};