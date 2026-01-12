import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Animated,
  Easing,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const AnimatedEllipsis = () => {
  const animations = useRef([...Array(3)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const createAnimation = (anim: Animated.Value) => Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      Animated.delay(200),
    ]);
    const loop = Animated.stagger(200, animations.map(createAnimation));
    Animated.loop(loop).start();
  }, [animations]);

  return (
    <View style={styles.ellipsisContainer}>
      {animations.map((animation, index) => {
        const opacity = animation.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
        const translateY = animation.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
        return <Animated.Text key={index} style={[styles.finalizingText, { opacity, transform: [{ translateY }] }]}>.</Animated.Text>;
      })}
    </View>
  );
};

export default function RegisterSuccessScreen() {
  const { setShouldShowRegisterSuccess, setIsRegistering } = useAuth();
  const params = useLocalSearchParams();
  const { userName = 'cher membre', userEmail = '' } = (params as { userName?: string; userEmail?: string }) || {};

  const [isFinalizing, setIsFinalizing] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  const successContentFadeAnim = useRef(new Animated.Value(0)).current;
  const successContentScaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const finalizationTimer = setTimeout(() => {
      setIsFinalizing(false);
      Animated.parallel([
        Animated.timing(successContentFadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(successContentScaleAnim, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      ]).start();
    }, 2000);

    return () => clearTimeout(finalizationTimer);
  }, [successContentFadeAnim, successContentScaleAnim]);

  const handleContinueToHome = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    setShouldShowRegisterSuccess(null);
    setIsRegistering(false); 
  }, [isNavigating, setShouldShowRegisterSuccess, setIsRegistering]);

  const handleOpenEmail = useCallback(async () => {
    const mailtoUrl = `mailto:${userEmail}`;
    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          "Boîte mail non trouvée",
          "Nous n'avons pas pu ouvrir votre application de messagerie. Veuillez vérifier vos e-mails manuellement."
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'ouverture de la messagerie :", error);
      Alert.alert("Erreur", "Une erreur s'est produite en tentant d'ouvrir votre boîte mail.");
    }
  }, [userEmail]);

  const renderContent = () => {
    if (isFinalizing) {
      return (
        <View style={styles.finalizingContainer}>
          <Text style={styles.finalizingText}>Finalisation de votre inscription</Text>
          <AnimatedEllipsis />
        </View>
      );
    }

    return (
      <Animated.View style={[styles.successContainer, { opacity: successContentFadeAnim, transform: [{ scale: successContentScaleAnim }] }]}>
        <View style={styles.successIconContainer}>
          <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.successIconGradient}>
            <Ionicons name="checkmark-done" size={60} color="white" />
          </LinearGradient>
        </View>
        <Text style={styles.congratsTitle}>Félicitations, {userName} !</Text>
        <Text style={styles.successMessage}>Votre compte a été créé avec succès.</Text>
        <Text style={styles.emailMessage}>
          Un e-mail de confirmation a été envoyé à <Text style={styles.emailAddress}>{userEmail}</Text>.
        </Text>
        <Text style={styles.instructionMessage}>
          Validez-le pour accéder à toutes les fonctionnalités.
        </Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinueToHome} activeOpacity={0.8}>
            <LinearGradient colors={['#1e40af', '#3b82f6']} style={styles.buttonGradient}>
              <Ionicons name="home" size={22} color="white" />
              <Text style={styles.primaryButtonText}>Accéder à l&apos;accueil</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleOpenEmail} activeOpacity={0.8}>
            <Ionicons name="mail-outline" size={22} color="#1e40af" />
            <Text style={styles.secondaryButtonText}>Ouvrir ma boîte mail</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={require('assets/images/imagebacklogin.png')} style={styles.backgroundImage} resizeMode="cover">
        <LinearGradient colors={['rgba(6, 60, 115, 0.95)', 'rgba(10, 114, 187, 0.8)', 'rgba(180, 210, 235, 0.6)']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.container}>
          {renderContent()}
        </SafeAreaView>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  finalizingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalizingText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
  ellipsisContainer: {
    flexDirection: 'row',
    width: 30,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  successContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 30,
    padding: Platform.OS === 'ios' ? 32 : 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  successIconContainer: { marginBottom: 24 },
  successIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  congratsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 18,
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 20,
  },
  emailMessage: {
    fontSize: 15,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  emailAddress: {
    fontWeight: 'bold',
    color: '#1e40af',
  },
  instructionMessage: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    borderRadius: 50,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(30, 64, 175, 0.3)',
    backgroundColor: 'transparent',
    gap: 10,
  },
  secondaryButtonText: {
    color: '#1e40af',
    fontSize: 16,
    fontWeight: '600',
  },
});
