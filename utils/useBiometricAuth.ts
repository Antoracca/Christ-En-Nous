import * as React from 'react';
import { Alert, Platform } from 'react-native';
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
  const [hasStoredCredentials, setHasStoredCredentials] = React.useState(false);

  // Vérifie si l'appareil est compatible au premier chargement
  React.useEffect(() => {
    const checkSupport = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricSupported(hasHardware && isEnrolled);

      // Vérifier s'il y a des credentials stockés
      const credsString = await SecureStore.getItemAsync(CREDENTIALS_KEY);
      setHasStoredCredentials(!!credsString);

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
    
    checkSupport();
  }, []);

  // Fonction pour obtenir l'icône et le texte adaptés à la plateforme
  const getBiometricDisplayInfo = () => {
    if (Platform.OS === 'ios' && biometricType === 'face') {
      return {
        iconName: 'face-id',
        displayText: 'Face ID',
        modalTitle: 'Connexion Face ID',
        modalMessage: 'Voulez-vous vous connecter avec Face ID pour la prochaine fois ?',
        authPrompt: 'Authentification via Face ID'
      };
    } else {
      return {
        iconName: 'fingerprint',
        displayText: 'Authentification biométrique',
        modalTitle: 'Connexion biométrique',
        modalMessage: 'Voulez-vous vous connecter avec empreinte biométrique pour la prochaine fois ?',
        authPrompt: 'Connectez-vous avec votre empreinte'
      };
    }
  };

  /**
   * Propose à l'utilisateur d'activer la connexion biométrique avec modal élégant
   */
  const promptToSaveCredentials = (identifier: string, password: string): Promise<void> => {
    const displayInfo = getBiometricDisplayInfo();

    return new Promise((resolve) => {
      Alert.alert(
        displayInfo.modalTitle,
        displayInfo.modalMessage,
        [
          { 
            text: "Non merci", 
            style: "cancel", 
            onPress: () => resolve() 
          },
          {
            text: "Activer",
            style: "default",
            onPress: async () => {
              await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify({ identifier, password }));
              setHasStoredCredentials(true);
              resolve();
            }
          },
        ],
        { cancelable: false }
      );
    });
  };

  /**
   * Gère le clic sur le bouton biométrique
   */
  const handleBiometricPress = async (): Promise<{ identifier: string; password: string } | null> => {
    // Vérifier s'il y a des credentials stockés
    const credsString = await SecureStore.getItemAsync(CREDENTIALS_KEY);
    
    if (!credsString) {
      const displayInfo = getBiometricDisplayInfo();
      Alert.alert(
        "Première connexion requise",
        `Pour utiliser ${displayInfo.displayText}, veuillez d'abord vous connecter une fois avec votre mot de passe.`,
        [{ text: "Compris", style: "default" }]
      );
      return null;
    }

    return await performBiometricAuth();
  };

  /**
   * Effectue l'authentification biométrique
   */
  const performBiometricAuth = async (): Promise<{ identifier: string; password: string } | null> => {
    try {
      const credsString = await SecureStore.getItemAsync(CREDENTIALS_KEY);
      if (!credsString) return null;

      const displayInfo = getBiometricDisplayInfo();

      // 🔧 CORRECTION CRITIQUE : Force Face ID uniquement sur iOS
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: displayInfo.authPrompt,
        cancelLabel: 'Annuler',
        disableDeviceFallback: true, // Force biométrie uniquement
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
    biometricType,
    hasStoredCredentials,
    handleBiometricPress,
    performBiometricAuth,
    promptToSaveCredentials,
    getBiometricDisplayInfo,
  };
};