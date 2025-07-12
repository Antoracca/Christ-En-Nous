import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';



interface SuccessModalProps {
  visible: boolean;
  onContinue: () => void;
}

export default function SuccessModal({ visible, onContinue }: SuccessModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* Fond global flouté + dégradé plein écran */}
      <View style={StyleSheet.absoluteFillObject}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFillObject} />
        <LinearGradient
          colors={['#000000aa', '#00000088']}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {/* Modal centré */}
      <View style={styles.centeredContainer}>
        <LinearGradient
          colors={['#fff5cc', '#ffffff']}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.9, y: 0.9 }}
          style={styles.modal}
        >
          {/* Animation Lottie ✅ */}
          <LottieView
            source={require('assets/animations/check-success.json')}
            autoPlay
            loop={false}
            style={styles.lottie}
          />

          {/* Texte d'accroche */}
          <Text style={styles.title}>Inscription réussie 🎉</Text>
          <Text style={styles.message}>
            Un email de confirmation vous a été envoyé. Cliquez sur le lien dans votre boîte
            pour activer votre compte.
            {'\n\n'}
            <Text style={styles.link} onPress={() => Linking.openURL('mailto:')}>
              Ouvrir ma boîte mail
            </Text>
          </Text>

          {/* Bouton continuer */}
          <TouchableOpacity onPress={onContinue} style={styles.button}>
            <Text style={styles.buttonText}>Continuer vers l’accueil</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    borderRadius: 28,
    paddingVertical: 60,
    paddingHorizontal: 44,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 10,
  },
  lottie: {
    width: 260,
    height: 260,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
    marginBottom: 90,
  },
  link: {
    color: '#0056cc',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#003366',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
