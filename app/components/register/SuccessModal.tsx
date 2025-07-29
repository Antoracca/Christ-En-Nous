// app/components/register/SuccessModal.tsx
// 🎨 Version 2.0 - Design Ultra-Moderne Apple & Android
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Animated,
  Dimensions,
  Platform,
  Vibration,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SuccessModalProps {
  visible: boolean;
  onContinue: () => void;
  userName?: string; // Pour personnaliser le message
}

export default function SuccessModal({ 
  visible, 
  onContinue, 
  userName = "frère/sœur" 
}: SuccessModalProps) {
  // 🎬 Animations
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  // 🎯 État interne
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showContent, setShowContent] = useState(false);

  // 🎬 Animation d'entrée
  useEffect(() => {
    if (visible) {
      // Haptic feedback pour iOS
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // Vibration pour Android
        Vibration.vibrate([0, 200, 100, 200]);
      }

      setShowContent(true);
      
      // Animation d'entrée séquentielle
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
      ]).start();

      // Animation de pulsation continue
      const startPulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(() => startPulse());
      };
      
      // Démarrer la pulsation après 1 seconde
      setTimeout(startPulse, 1000);
    } else {
      setShowContent(false);
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [opacityAnim, pulseAnim, scaleAnim, slideAnim, visible]);

  // 🎬 Animation du bouton
  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 150,
      friction: 4,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 4,
    }).start();
  };

  const handleContinue = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Animation de sortie
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onContinue();
    });
  };

  const handleOpenEmail = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      // Tenter d'ouvrir l'app mail native
      const canOpen = await Linking.canOpenURL('mailto:');
      if (canOpen) {
        await Linking.openURL('mailto:');
      } else {
        // Fallback vers Gmail web
        await Linking.openURL('https://mail.google.com');
      }
    } catch (error) {
      console.log('Erreur ouverture email:', error);
    }
  };

  if (!visible) return null;

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="none" // On gère l'animation nous-mêmes
      statusBarTranslucent
    >
      {/* 🌫️ Fond flouté dynamique */}
      <View style={StyleSheet.absoluteFillObject}>
        <BlurView 
          intensity={Platform.OS === 'ios' ? 100 : 80} 
          tint="dark" 
          style={StyleSheet.absoluteFillObject} 
        />
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0.4)',
            'rgba(0, 20, 60, 0.6)',
            'rgba(0, 0, 0, 0.8)'
          ]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {/* 🎯 Container principal animé */}
      <Animated.View 
        style={[
          styles.centeredContainer,
          {
            opacity: opacityAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ]
          }
        ]}
      >
        {/* 🎨 Card principale avec glassmorphism */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.95)',
            'rgba(255, 255, 255, 0.85)',
            'rgba(248, 250, 252, 0.90)'
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.modal}
        >
          {/* 🌟 Animation Lottie avec pulsation */}
          <Animated.View
            style={[
              styles.lottieContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <LottieView
              source={require('assets/animations/check-success.json')}
              autoPlay
              loop={false}
              style={styles.lottie}
            />
          </Animated.View>

          {/* ✨ Titre avec dégradé */}
          <LinearGradient
            colors={['#1e40af', '#3b82f6', '#06b6d4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}
          >
            <Text style={styles.title}>
              🎉 Inscription réussie !
            </Text>
          </LinearGradient>

          {/* 📝 Message personnalisé */}
          <Text style={styles.subtitle}>
            Bienvenue {userName} ! 👋
          </Text>

          <View style={styles.messageContainer}>
            <View style={styles.iconMessageRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.message}>
                Un email de confirmation a été envoyé
              </Text>
            </View>
            
            <View style={styles.iconMessageRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={20} color="#10b981" />
              </View>
              <Text style={styles.message}>
                Vérifiez votre boîte mail pour activer votre compte
              </Text>
            </View>
          </View>

          {/* 🔗 Bouton d'ouverture d'email moderne */}
          <TouchableOpacity 
            style={styles.emailButton}
            onPress={handleOpenEmail}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#f59e0b', '#f97316', '#ea580c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emailButtonGradient}
            >
              <Ionicons name="mail-open" size={18} color="white" />
              <Text style={styles.emailButtonText}>
                Ouvrir ma boîte mail
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* ➡️ Bouton principal avec animation */}
          <Animated.View
            style={[
              styles.buttonContainer,
              { transform: [{ scale: buttonScale }] }
            ]}
          >
            <TouchableOpacity
              onPress={handleContinue}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              activeOpacity={0.9}
              style={styles.continueButton}
            >
              <LinearGradient
                colors={['#1e40af', '#3b82f6', '#2563eb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueButtonGradient}
              >
                <Text style={styles.continueButtonText}>
                  Continuer vers l&apos;accueil
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* 🏷️ Footer subtil */}
          <Text style={styles.footer}>
            Vous pouvez fermer cette fenêtre
          </Text>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
    borderRadius: 32,
    paddingVertical: 40,
    paddingHorizontal: 28,
    alignItems: 'center',
    // Shadow iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    // Shadow Android
    elevation: 25,
    // Glassmorphism effect
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  lottieContainer: {
    marginBottom: 24,
  },
  lottie: {
    width: 120,
    height: 120,
  },
  titleGradient: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: 'white',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 24,
    textAlign: 'center',
  },
  messageContainer: {
    width: '100%',
    marginBottom: 32,
  },
  iconMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  message: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    flex: 1,
    fontWeight: '500',
  },
  emailButton: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emailButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  emailButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 16,
  },
  continueButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 10,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },
});