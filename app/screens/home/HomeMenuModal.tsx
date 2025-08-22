// app/components/home/HomeMenuModal.tsx
// Menu modal premium avec glassmorphism, animations fluides et feedback haptique

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  Platform,
  Linking,
  Alert,
  ScrollView,
  Vibration
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Easing } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/context/AuthContext';
import { useThemeContext } from '@/context/ThemeContext';
import type { RootStackParamList } from '../../../navigation/AppNavigator';
import Avatar from '@/components/profile/Avatar';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');
const MENU_WIDTH = width * 0.85;
const HEADER_HEIGHT = 220;

// Animation de glissement dramatique avec effet de traînée
const createDramaticSlideAnimation = (value: Animated.Value, toValue: number) => {
  return Animated.sequence([
    // Phase 1: Démarrage lent (effet de résistance réduit)
    Animated.timing(value, {
      toValue: MENU_WIDTH * 0.6, // Commence à 60% de la position fermée
      duration: 400, // 400ms au lieu de 800ms
      useNativeDriver: true,
      easing: Easing.out(Easing.quad), // Décélération douce
    }),
    // Phase 2: Pause dramatique plus courte
    Animated.delay(100),
    // Phase 3: Accélération rapide finale
    Animated.timing(value, {
      toValue: toValue,
      duration: 180, // 180ms très rapide
      useNativeDriver: true,
      easing: Easing.out(Easing.back(1.5)), // Effet d'aspiration plus prononcé
    })
  ]);
};

interface HomeMenuModalProps {
  isVisible: boolean;
  onClose: () => void;
}

// =================================================================
// COMPOSANT : Indicateur de section animé
// =================================================================
const SectionIndicator = ({ isExpanded, isDarkMode }: { isExpanded: boolean; isDarkMode: boolean }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.spring(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [isExpanded]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg']
  });

  const chevronColor = isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(30,58,138,0.7)';

  return (
    <Animated.View style={{ transform: [{ rotate: rotation }] }}>
      <Feather name="chevron-right" size={16} color={chevronColor} />
    </Animated.View>
  );
};

// =================================================================
// COMPOSANT : Item de menu avec animation au toucher
// =================================================================
const MenuItem = ({ 
  icon, 
  label, 
  onPress, 
  isDarkMode,
  badge,
  isNew = false 
}: { 
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  isDarkMode: boolean;
  badge?: string;
  isNew?: boolean;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const theme = useAppTheme();
  
  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const textColor = isDarkMode ? 'rgba(255,255,255,0.95)' : theme.colors.primary;
  const bgColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(30,58,138,0.05)';
  const iconBgColor = isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(30,58,138,0.1)';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={[styles.menuItem, { backgroundColor: bgColor }]} 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={[styles.menuItemIconContainer, { backgroundColor: iconBgColor }]}>
          <Feather name={icon} size={20} color={textColor} />
        </View>
        <Text style={[styles.menuItemText, { color: textColor }]}>{label}</Text>
        {isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        {badge && (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Feather name="chevron-right" size={18} color={isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(30,58,138,0.5)'} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// =================================================================
// COMPOSANT : Section de menu avec animation d'expansion
// =================================================================
const MenuSection = ({ 
  title, 
  icon, 
  children,
  isDarkMode,
  defaultExpanded = true 
}: { 
  title: string;
  icon: keyof typeof Feather.glyphMap;
  children: React.ReactNode;
  isDarkMode: boolean;
  defaultExpanded?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const heightAnim = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;
  const theme = useAppTheme();

  const toggleSection = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExpanded(!isExpanded);
    Animated.spring(heightAnim, {
      toValue: isExpanded ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
    }).start();
  };

  const textColor = isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(30,58,138,0.8)';
  const chevronColor = isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(30,58,138,0.6)';

  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity onPress={toggleSection} activeOpacity={0.7}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Feather name={icon} size={16} color={textColor} />
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              {title.toUpperCase()}
            </Text>
          </View>
          <SectionIndicator isExpanded={isExpanded} isDarkMode={isDarkMode} />
        </View>
      </TouchableOpacity>
      <Animated.View 
        style={{
          maxHeight: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 500]
          }),
          opacity: heightAnim,
          overflow: 'hidden'
        }}
      >
        <View style={styles.sectionContent}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

// =================================================================
// COMPOSANT PRINCIPAL : HomeMenuModal
// =================================================================
const HomeMenuModal = ({ isVisible, onClose }: HomeMenuModalProps) => {
  const theme = useAppTheme();
  const { toggleTheme, isDarkMode: contextIsDarkMode } = useThemeContext();
  const slideAnim = useRef(new Animated.Value(MENU_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userProfile, logout } = useAuth();
  const isDarkMode = contextIsDarkMode;

  useEffect(() => {
    if (isVisible) {
      // Réinitialiser les valeurs avant l'animation
      slideAnim.setValue(MENU_WIDTH);
      backdropAnim.setValue(0);
      
      // Animation d'ouverture dramatique avec effet de traînée
      Animated.parallel([
        createDramaticSlideAnimation(slideAnim, 0),
        Animated.sequence([
          // Backdrop apparaît progressivement pendant la phase lente
          Animated.timing(backdropAnim, {
            toValue: 0.3,
            duration: 100,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          // Puis se renforce pendant la phase rapide
          Animated.timing(backdropAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          })
        ])
      ]).start();
    } else {
      // Animation de fermeture rapide et fluide
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: MENU_WIDTH,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.in(Easing.quad),
        })
      ]).start();
    }
  }, [isVisible, slideAnim, backdropAnim]);

  const handleNavigation = (screen: keyof RootStackParamList, params?: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    setTimeout(() => {
      if (['ProfileTab'].includes(screen)) {
        navigation.navigate('Main', { screen });
      } else {
        navigation.navigate(screen, params);
      }
    }, 300);
  };
  
  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onClose();
    setTimeout(() => {
      Alert.alert(
        "Déconnexion",
        "Voulez-vous vraiment vous déconnecter ?",
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Confirmer", 
            style: "destructive", 
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              logout();
            }
          }
        ]
      );
    }, 300);
  };

  const handleComingSoon = (feature: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert("Bientôt disponible", `${feature} sera disponible dans la prochaine mise à jour.`);
  };

  // Couleurs adaptatives selon le thème
  const gradientColors = isDarkMode 
    ? [theme.colors.primary, '#1E3A8A', '#0F172A']
    : ['#FFFFFF', '#F8FAFC', '#F1F5F9'];

  const headerGradientColors: [string, string] = isDarkMode
    ? [theme.colors.primary, '#1E3A8A']
    : [theme.colors.primary, theme.colors.primary];

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop avec blur */}
        <Animated.View 
          style={[
            StyleSheet.absoluteFill,
            { opacity: backdropAnim }
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            activeOpacity={1}
          >
            <BlurView 
              intensity={Platform.OS === 'ios' ? 30 : 15} 
              tint={isDarkMode ? "dark" : "light"} 
              style={StyleSheet.absoluteFill} 
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Menu slidant avec effet d'ombre dynamique */}
        <Animated.View
          style={[
            styles.menuContainer,
            { 
              transform: [{ translateX: slideAnim }],
              backgroundColor: isDarkMode ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.98)',
              shadowOpacity: backdropAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.4]
              }),
            }
          ]}
        >
          {/* Effet glassmorphism sur les bords avec animation */}
          <Animated.View style={[styles.glassEdge, { opacity: backdropAnim }]}>
            <LinearGradient
              colors={isDarkMode ? ['rgba(255,255,255,0.15)', 'transparent'] : ['rgba(30,58,138,0.15)', 'transparent']}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>

          {/* Header avec courbe */}
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={headerGradientColors}
              style={styles.headerGradient}
            >
              {/* Particules animées avec délai progressif */}
              <View style={styles.particlesContainer}>
                {[...Array(15)].map((_, i) => (
                  <Animated.View 
                    key={i} 
                    style={[
                      styles.particle, 
                      { 
                        top: `${Math.random()*100}%`, 
                        left: `${Math.random()*100}%`,
                        opacity: backdropAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 0.3, Math.random() * 0.5 + 0.2]
                        }),
                        transform: [{
                          scale: backdropAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 1]
                          })
                        }]
                      }
                    ]} 
                  />
                ))}
              </View>

              <SafeAreaView style={styles.headerContent}>
                {/* Boutons en haut à droite */}
                <View style={styles.headerButtons}>
                  <TouchableOpacity 
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      toggleTheme();
                    }}
                    style={styles.themeButtonTop}
                    activeOpacity={0.8}
                  >
                    <View style={styles.themeButtonContainer}>
                      <Feather 
                        name={isDarkMode ? "sun" : "moon"} 
                        size={16} 
                        color="white" 
                      />
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={onClose} 
                    style={styles.closeButtonTop}
                    activeOpacity={0.8}
                  >
                    <View style={styles.closeButtonContainer}>
                      <Feather name="x" size={18} color="white" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Logo centré */}
                <View style={styles.logoSection}>
                  <View style={styles.logoContainer}>
                    <Image 
                      source={require('assets/images/LOGOc.png')}
                      style={styles.logo}
                      contentFit="contain"
                      cachePolicy="memory-disk"
                    />
                  </View>
                  
                  <View style={styles.churchInfo}>
                    <Text style={[styles.churchName, { color: isDarkMode ? 'white' : 'white' }]}>
                      Christ En Nous
                    </Text>
                    <Text style={[styles.churchVision, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.9)' }]}>
                      Servir • Faire des Disciples • Évangéliser
                    </Text>
                  </View>
                </View>
              </SafeAreaView>
            </LinearGradient>
          </View>

          {/* Contenu scrollable */}
          <ScrollView 
            style={styles.menuContent} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Mon Espace */}
            <MenuSection title="Mon Espace" icon="user" isDarkMode={isDarkMode}>
              <MenuItem 
                icon="user" 
                label="Mon Profil" 
                onPress={() => handleNavigation('ProfileTab')} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="shield" 
                label="Sécurité & Confidentialité" 
                onPress={() => handleNavigation('Security')} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="settings" 
                label="Paramètres" 
                onPress={() => handleComingSoon("Les paramètres")} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="bell" 
                label="Notifications" 
                badge="3"
                onPress={() => handleComingSoon("Les notifications")} 
                isDarkMode={isDarkMode}
              />
            </MenuSection>

            {/* Services Église */}
            <MenuSection title="Services Église" icon="home" isDarkMode={isDarkMode}>
              <MenuItem 
                icon="calendar" 
                label="Programme & Événements" 
                onPress={() => handleComingSoon("Le programme")} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="message-square" 
                label="Annonces" 
                onPress={() => handleComingSoon("Les annonces")} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="heart" 
                label="Dons & Offrandes" 
                onPress={() => handleComingSoon("Les dons")} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="book-open" 
                label="Prédications" 
                onPress={() => handleComingSoon("Les prédications")} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="clipboard" 
                label="Protocolats" 
                isNew={true}
                onPress={() => handleComingSoon("Les protocolats")} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="truck" 
                label="Logistique" 
                isNew={true}
                onPress={() => handleComingSoon("La logistique")} 
                isDarkMode={isDarkMode}
              />
            </MenuSection>

            {/* Ministères */}
            <MenuSection title="Ministères" icon="users" isDarkMode={isDarkMode} defaultExpanded={false}>
              <MenuItem 
                icon="award" 
                label="Christ en Nous Académie" 
                onPress={() => handleComingSoon("L'académie")} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="users" 
                label="Markos (Jeunesse)" 
                onPress={() => handleComingSoon("Markos")} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="tv" 
                label="Christ en Nous Life TV" 
                onPress={() => handleComingSoon("Life TV")} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="music" 
                label="Louange" 
                onPress={() => handleComingSoon("La louange")} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="mic" 
                label="Cantique Nouveau" 
                onPress={() => handleComingSoon("Cantique Nouveau")} 
                isDarkMode={isDarkMode}
              />
            </MenuSection>

            {/* Missions */}
            <MenuSection title="Missions" icon="globe" isDarkMode={isDarkMode} defaultExpanded={false}>
              <MenuItem 
                icon="map-pin" 
                label="Missions Locales" 
                onPress={() => handleComingSoon("Les missions locales")} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="globe" 
                label="Missions Internationales" 
                onPress={() => handleComingSoon("Les missions internationales")} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="send" 
                label="Évangélisation" 
                onPress={() => handleComingSoon("L'évangélisation")} 
                isDarkMode={isDarkMode}
              />
            </MenuSection>

            {/* Applications */}
            <MenuSection title="Applications" icon="smartphone" isDarkMode={isDarkMode} defaultExpanded={false}>
              <MenuItem 
                icon="layout" 
                label="Christ Social" 
                isNew={true}
                onPress={() => handleComingSoon("Christ Social")} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="radio" 
                label="Christ Radio" 
                onPress={() => handleComingSoon("Christ Radio")} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="video" 
                label="Christ en Nous Live" 
                isNew={true}
                onPress={() => handleComingSoon("Christ en Nous Live")} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="book" 
                label="Bibliothèque Spirituelle" 
                onPress={() => handleComingSoon("La bibliothèque")} 
                isDarkMode={isDarkMode}
              />
            </MenuSection>

            {/* Aide & Support */}
            <MenuSection title="Aide & Support" icon="help-circle" isDarkMode={isDarkMode} defaultExpanded={false}>
              <MenuItem 
                icon="help-circle" 
                label="Centre d'aide" 
                onPress={() => handleComingSoon("Le centre d'aide")} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="mail" 
                label="Nous contacter" 
                onPress={() => Linking.openURL('mailto:support@christennous.com')} 
                isDarkMode={isDarkMode}
              />
              <MenuItem 
                icon="file-text" 
                label="Conditions d'utilisation" 
                onPress={() => handleComingSoon("Les conditions")} 
                isDarkMode={isDarkMode}
              />
            </MenuSection>


            {/* Version de l'app */}
            <Text style={[styles.versionText, { color: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }]}>
              Christ en Nous v1.0.0
            </Text>

            <View style={{ height: 50 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: MENU_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: -12, height: 0 },
    shadowRadius: 35,
    elevation: 35,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    overflow: 'hidden',
  },
  glassEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    zIndex: 100,
  },
  headerContainer: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 0,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    zIndex: 2,
  },
  headerButtons: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  themeButtonTop: {
    marginRight: 12,
  },
  themeButtonContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  closeButtonTop: {},
  closeButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 15,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    top: -10,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '250%',
    height: '250%',
    bottom: -10,
  },
  churchInfo: {
    marginTop: 20,
    alignItems: 'center',
    top: -20,
  },
  churchName: {
    fontSize: 26,
    fontFamily: 'Nunito_800ExtraBold',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  churchVision: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: 0.8,
    lineHeight: 18,
  },
  menuContent: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionContainer: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    letterSpacing: 1.5,
    marginLeft: 10,
  },
  sectionContent: {
    marginBottom: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  menuItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
    marginLeft: 14,
    flex: 1,
    letterSpacing: 0.2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
  },
  newBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    letterSpacing: 0.5,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    marginTop: 20,
  },
});

export default HomeMenuModal;