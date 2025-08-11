// app/components/register/SuccessModal.tsx
// 🎨 Version 3.1 - 100% Compatible Expo Go
// Les bibliothèques ci-dessous sont incluses dans le SDK Expo.
// Assurez-vous qu'elles sont bien listées dans votre package.json.
// expo install react-native-reanimated react-native-gesture-handler expo-blur expo-linear-gradient lottie-react-native

import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Vibration,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SuccessModalProps {
  visible: boolean;
  onContinue: () => void;
  userName?: string;
}

// Composant stylisé pour les lignes de message
const InfoRow = ({ icon, color, text }: { icon: keyof typeof Ionicons.glyphMap; color: string; text: string }) => (
  <View style={styles.iconMessageRow}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}1A` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.message}>{text}</Text>
  </View>
);

export default function SuccessModal({
  visible,
  onContinue,
  userName = "explorateur/trice",
}: SuccessModalProps) {
  // --- ANIMATIONS (REANIMATED) ---
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  // --- EFFETS ---
  useEffect(() => {
    if (visible) {
      // Démarrer l'animation d'entrée
      scale.value = withSpring(1, { damping: 15, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 18, stiffness: 100 });

      // Effets sensoriels
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // Vibration simple pour Android
        Vibration.vibrate(100);
      }
    } else {
      // Réinitialiser les animations pour la prochaine ouverture
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8, { duration: 200 });
      translateY.value = withTiming(50, { duration: 200 });
    }
  }, [visible, scale, opacity, translateY]);

  // --- STYLES ANIMÉS ---
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ],
  }));

  // --- GESTIONNAIRES D'ÉVÉNEMENTS ---
  const handleContinue = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Animation de sortie avant de fermer
    opacity.value = withTiming(0, { duration: 200 });
    scale.value = withTiming(0.9, { duration: 200 });
    // Utiliser runOnJS pour appeler une fonction non-animée depuis le thread UI
    translateY.value = withTiming(50, { duration: 200 }, () => {
      runOnJS(onContinue)();
    });
  };

  const handleOpenEmail = async () => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const url = 'mailto:';
    const canOpen = await Linking.canOpenURL(url);
    try {
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback pour les simulateurs ou si aucune app mail n'est installée
        await Linking.openURL('https://mail.google.com');
      }
    } catch (error) {
      console.error('Impossible d\'ouvrir l\'application mail:', error);
    }
  };

  if (!visible) return null;

  return (
    <GestureHandlerRootView style={StyleSheet.absoluteFill}>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
      >
        {/* Fond flouté */}
        <BlurView
          intensity={Platform.OS === 'ios' ? 80 : 60}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[StyleSheet.absoluteFillObject, styles.scrim]} />

        {/* Conteneur principal animé */}
        <Reanimated.View style={[styles.centeredContainer, containerAnimatedStyle]}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.9)', 'rgba(245, 245, 255, 0.85)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modal}
          >
            <LottieView
              source={require('../../../assets/animations/check-success.json')}
              autoPlay
              loop={false}
              style={styles.lottie}
            />

            <Text style={styles.title}>Inscription Réussie !</Text>
            <Text style={styles.subtitle}>
              Bienvenue dans l&apos;aventure, {userName} 👋
            </Text>

            <View style={styles.messageContainer}>
              <InfoRow
                icon="mail-unread-outline"
                color="#2563eb"
                text="Un e-mail de confirmation vous a été envoyé."
              />
              <InfoRow
                icon="shield-checkmark-outline"
                color="#16a34a"
                text="Veuillez vérifier votre boîte de réception pour activer votre compte."
              />
            </View>

            {/* Bouton principal */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.continueButtonGradient}
              >
                <Text style={styles.continueButtonText}>Commencer l&apos;exploration</Text>
                <Ionicons name="arrow-forward-circle" size={22} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Bouton secondaire */}
            <TouchableOpacity
              style={styles.emailButton}
              onPress={handleOpenEmail}
              activeOpacity={0.7}
            >
              <Ionicons name="mail-open-outline" size={18} color="#475569" />
              <Text style={styles.emailButtonText}>Ouvrir ma boîte mail</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Reanimated.View>
      </Modal>
    </GestureHandlerRootView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  scrim: {
    backgroundColor: 'rgba(10, 20, 40, 0.3)',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modal: {
    width: '100%',
    maxWidth: SCREEN_WIDTH * 0.9,
    borderRadius: 32, // Bordures plus arrondies
    padding: 24,
    alignItems: 'center',
    // Ombre douce et moderne
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
    // Effet de verre subtil
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  lottie: {
    width: 130,
    height: 130,
    marginTop: -20,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800', // Plus audacieux
    textAlign: 'center',
    color: '#1e293b', // Couleur plus douce que le noir pur
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#475569', // Gris-bleu pour le contraste
    marginBottom: 28,
    textAlign: 'center',
  },
  messageContainer: {
    width: '100%',
    marginBottom: 28,
    gap: 16, // Espacement entre les lignes
  },
  iconMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  message: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    flex: 1,
    fontWeight: '500',
  },
  continueButton: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 12,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(148, 163, 184, 0.2)', // Fond très léger
    gap: 8,
  },
  emailButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
});
