// app/screens/bible/AIModalScreen.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useResponsiveSafe } from '@/context/ResponsiveContext';

const { height } = Dimensions.get('window');

interface AIModalScreenProps {
  visible: boolean;
  onClose: () => void;
}

export default function AIModalScreen({ visible, onClose }: AIModalScreenProps) {
  const theme = useAppTheme();
  const responsive = useResponsiveSafe();
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 90,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: backdropAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleClose} activeOpacity={1}>
            <BlurView intensity={30} tint={theme.dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.modalContent,
            { 
              backgroundColor: theme.colors.background,
              transform: [{ translateY: slideAnim }] 
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header Minimaliste */}
            <View style={[styles.header, { borderBottomColor: theme.colors.outline + '10' }]}>
              <Text style={[styles.headerTitle, { color: theme.custom.colors.text }]}>
                Assistant Intelligent
              </Text>
              <TouchableOpacity onPress={handleClose} style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}>
                <Feather name="x" size={20} color={theme.custom.colors.placeholder} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              
              {/* Hero Section - Icône et Statut */}
              <View style={styles.heroSection}>
                <View style={[styles.iconRing, { borderColor: theme.colors.primary + '30' }]}>
                  <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '10' }]}>
                    <Feather name="cpu" size={48} color={theme.colors.primary} />
                  </View>
                </View>
                <Text style={[styles.heroTitle, { color: theme.colors.primary }]}>
                  Bientôt disponible
                </Text>
                <Text style={[styles.heroDescription, { color: theme.custom.colors.text }]}>
                  Cette fonctionnalité sera bientôt disponible. Pour l'instant, continuez à bénéficier de la lecture avancée de la Bible.
                </Text>
              </View>

              {/* Roadmap - Liste propre */}
              <View style={[styles.roadmapCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline + '10' }]}>
                <Text style={[styles.sectionHeader, { color: theme.custom.colors.placeholder }]}>
                  EN DÉVELOPPEMENT
                </Text>
                
                <View style={styles.roadmapItem}>
                  <Feather name="message-square" size={20} color={theme.custom.colors.text} style={styles.roadmapIcon} />
                  <View style={styles.roadmapTextContainer}>
                    <Text style={[styles.roadmapTitle, { color: theme.custom.colors.text }]}>Questions & Réponses</Text>
                    <Text style={[styles.roadmapSubtitle, { color: theme.custom.colors.placeholder }]}>Interrogez le texte biblique naturellement.</Text>
                  </View>
                </View>
                
                <View style={[styles.separator, { backgroundColor: theme.colors.outline + '10' }]} />

                <View style={styles.roadmapItem}>
                  <Feather name="layers" size={20} color={theme.custom.colors.text} style={styles.roadmapIcon} />
                  <View style={styles.roadmapTextContainer}>
                    <Text style={[styles.roadmapTitle, { color: theme.custom.colors.text }]}>Contexte Historique</Text>
                    <Text style={[styles.roadmapSubtitle, { color: theme.custom.colors.placeholder }]}>Analyses culturelles et historiques instantanées.</Text>
                  </View>
                </View>

                <View style={[styles.separator, { backgroundColor: theme.colors.outline + '10' }]} />

                <View style={styles.roadmapItem}>
                  <Feather name="compass" size={20} color={theme.custom.colors.text} style={styles.roadmapIcon} />
                  <View style={styles.roadmapTextContainer}>
                    <Text style={[styles.roadmapTitle, { color: theme.custom.colors.text }]}>Parcours Guidés</Text>
                    <Text style={[styles.roadmapSubtitle, { color: theme.custom.colors.placeholder }]}>Plans de lecture adaptés à vos besoins.</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleClose}
                activeOpacity={0.9}
              >
                <Text style={styles.buttonText}>Retour à la lecture</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalContent: { flex: 1, borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', letterSpacing: -0.5 },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollView: { flex: 1 },
  scrollContent: { padding: 24 },

  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  iconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  heroDescription: {
    fontSize: 16,
    fontFamily: 'Nunito_500Medium',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
    opacity: 0.8,
  },

  roadmapCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  roadmapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  roadmapIcon: {
    marginRight: 16,
    opacity: 0.8,
  },
  roadmapTextContainer: {
    flex: 1,
  },
  roadmapTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 4,
  },
  roadmapSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    opacity: 0.6,
  },
  separator: {
    height: 1,
    marginVertical: 16,
    marginLeft: 36, // Align with text
  },

  primaryButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
});