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
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
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
          duration: 250,
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
            <BlurView intensity={20} tint={theme.dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
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
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.outline + '20' }]}>
              <View style={styles.headerLeft}>
                <View style={[styles.aiIconContainer, { backgroundColor: theme.colors.secondary + '20' }]}>
                  <Text style={[styles.aiIcon, { color: theme.colors.secondary }]}>AI</Text>
                </View>
                <View>
                  <Text style={[styles.headerTitle, { color: theme.custom.colors.text }]}>
                    Assistant IA Biblique
                  </Text>
                  <Text style={[styles.headerSubtitle, { color: theme.custom.colors.placeholder }]}>
                    Fonctionnalité en développement
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleClose} style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}>
                <Feather name="x" size={20} color={theme.custom.colors.placeholder} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              
              {/* Description principale */}
              <View style={[styles.mainCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>
                  🤖 Révolutionnaire Assistant IA
                </Text>
                <Text style={[styles.cardDescription, { color: theme.custom.colors.text }]}>
                  Cette fonctionnalité transformera votre expérience de lecture biblique en vous offrant un compagnon intelligent pour approfondir votre compréhension des Écritures.
                </Text>
              </View>

              {/* Fonctionnalités à venir */}
              <View style={[styles.featuresCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.custom.colors.text }]}>
                  ✨ Fonctionnalités à venir
                </Text>
                
                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                      <Feather name="help-circle" size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={[styles.featureTitle, { color: theme.custom.colors.text }]}>
                        Questions & Réponses
                      </Text>
                      <Text style={[styles.featureDescription, { color: theme.custom.colors.placeholder }]}>
                        Posez des questions sur n'importe quel verset et obtenez des explications détaillées
                      </Text>
                    </View>
                  </View>

                  <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: theme.colors.secondary + '15' }]}>
                      <Feather name="book" size={18} color={theme.colors.secondary} />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={[styles.featureTitle, { color: theme.custom.colors.text }]}>
                        Contexte Historique
                      </Text>
                      <Text style={[styles.featureDescription, { color: theme.custom.colors.placeholder }]}>
                        Découvrez le contexte historique et culturel de chaque passage
                      </Text>
                    </View>
                  </View>

                  <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: theme.colors.tertiary + '15' }]}>
                      <Feather name="link" size={18} color={theme.colors.tertiary} />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={[styles.featureTitle, { color: theme.custom.colors.text }]}>
                        Connexions Bibliques
                      </Text>
                      <Text style={[styles.featureDescription, { color: theme.custom.colors.placeholder }]}>
                        Explorez les connexions entre différents versets et livres de la Bible
                      </Text>
                    </View>
                  </View>

                  <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                      <Feather name="heart" size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={[styles.featureTitle, { color: theme.custom.colors.text }]}>
                        Méditations Personnalisées
                      </Text>
                      <Text style={[styles.featureDescription, { color: theme.custom.colors.placeholder }]}>
                        Recevez des méditations adaptées à votre parcours spirituel
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Coming Soon Badge */}
              <View style={[styles.comingSoonCard, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary + '30' }]}>
                <Feather name="clock" size={24} color={theme.colors.primary} />
                <Text style={[styles.comingSoonTitle, { color: theme.colors.primary }]}>
                  🚀 En Développement
                </Text>
                <Text style={[styles.comingSoonDescription, { color: theme.colors.primary }]}>
                  Notre équipe travaille actuellement sur cette fonctionnalité révolutionnaire. Restez connectés pour être parmi les premiers à en profiter !
                </Text>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalContent: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  aiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiIcon: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    fontWeight: 'bold',
  },
  headerTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold' },
  headerSubtitle: { fontSize: 13, fontFamily: 'Nunito_500Medium', marginTop: 2, opacity: 0.8 },
  closeButton: {
    padding: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 12 },

  mainCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  cardTitle: { 
    fontSize: 20, 
    fontFamily: 'Nunito_700Bold', 
    marginBottom: 12,
    textAlign: 'center'
  },
  cardDescription: { 
    fontSize: 15, 
    fontFamily: 'Nunito_500Medium', 
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.9
  },

  featuresCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontFamily: 'Nunito_700Bold', 
    marginBottom: 16
  },

  featuresList: { gap: 16 },
  featureItem: { 
    flexDirection: 'row', 
    alignItems: 'flex-start'
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: { flex: 1 },
  featureTitle: { 
    fontSize: 15, 
    fontFamily: 'Nunito_700Bold', 
    marginBottom: 4
  },
  featureDescription: { 
    fontSize: 13, 
    fontFamily: 'Nunito_500Medium', 
    lineHeight: 18,
    opacity: 0.8
  },

  comingSoonCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  comingSoonTitle: { 
    fontSize: 16, 
    fontFamily: 'Nunito_700Bold', 
    marginTop: 8,
    marginBottom: 8
  },
  comingSoonDescription: { 
    fontSize: 13, 
    fontFamily: 'Nunito_500Medium', 
    textAlign: 'center',
    lineHeight: 19,
    opacity: 0.9
  },
});