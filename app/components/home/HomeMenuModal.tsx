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
  Easing
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/context/AuthContext';
import { useThemeContext } from '@/context/ThemeContext';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');
const MENU_WIDTH = width * 0.85;
const HEADER_HEIGHT = 220;

const createDramaticSlideAnimation = (value: Animated.Value, toValue: number) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: MENU_WIDTH * 0.6,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad),
    }),
    Animated.delay(100),
    Animated.timing(value, {
      toValue: toValue,
      duration: 180,
      useNativeDriver: true,
      easing: Easing.out(Easing.back(1.5)),
    })
  ]);
};

interface HomeMenuModalProps {
  isVisible: boolean;
  onClose: () => void;
}

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

const MenuItem = ({
  icon,
  label,
  subLabel,
  onPress,
  isDarkMode,
  badge,
  isNew = false
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subLabel?: string;
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
  const subTextColor = isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(30,58,138,0.6)';
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
        <View style={styles.menuItemTextContainer}>
          <Text style={[styles.menuItemText, { color: textColor }]}>{label}</Text>
          {subLabel && <Text style={[styles.menuItemSubText, { color: subTextColor }]}>{subLabel}</Text>}
        </View>
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

const HomeMenuModal = ({ isVisible, onClose }: HomeMenuModalProps) => {
  const theme = useAppTheme();
  const { toggleTheme, isDarkMode: contextIsDarkMode } = useThemeContext();
  const slideAnim = useRef(new Animated.Value(MENU_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { logout } = useAuth();
  const isDarkMode = contextIsDarkMode;

  useEffect(() => {
    if (isVisible) {
      slideAnim.setValue(MENU_WIDTH);
      backdropAnim.setValue(0);
      Animated.parallel([
        createDramaticSlideAnimation(slideAnim, 0),
        Animated.sequence([
          Animated.timing(backdropAnim, {
            toValue: 0.3,
            duration: 100,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          Animated.timing(backdropAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          })
        ])
      ]).start();
    } else {
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

  const handleNavigation = (path: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    setTimeout(() => {
      if (path === '/meditations') {
         Alert.alert("Bientôt disponible", "La section Méditations Quotidiennes arrive bientôt !");
         return;
      }
      if (path === '/community') {
         Alert.alert("Bientôt disponible", "La communauté 'Méditons Ensemble' arrive bientôt !");
         return;
      }
      if (path === '/challenges') {
         Alert.alert("Bientôt disponible", "Les Plans de Défis arrivent bientôt !");
         return;
      }
      
      router.push(path as any);
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

  const headerGradientColors: [string, string] = isDarkMode
    ? [theme.colors.primary, '#1E3A8A']
    : [theme.colors.primary, theme.colors.primary];

  return (
    <Modal transparent visible={isVisible} animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: backdropAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1}>
            <BlurView intensity={Platform.OS === 'ios' ? 30 : 15} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.menuContainer,
            {
              transform: [{ translateX: slideAnim }],
              backgroundColor: isDarkMode ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.98)',
              shadowOpacity: backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }),
            }
          ]}
        >
          <Animated.View style={[styles.glassEdge, { opacity: backdropAnim }]}>
            <LinearGradient
              colors={isDarkMode ? ['rgba(255,255,255,0.15)', 'transparent'] : ['rgba(30,58,138,0.15)', 'transparent']}
              start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>

          <View style={styles.headerContainer}>
            <LinearGradient colors={headerGradientColors} style={styles.headerGradient}>
              <View style={styles.particlesContainer}>
                {[...Array(15)].map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.particle,
                      {
                        top: `${Math.random()*100}%`,
                        left: `${Math.random()*100}%`,
                        opacity: backdropAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.3, Math.random() * 0.5 + 0.2] }),
                        transform: [{ scale: backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]
                      }
                    ]}
                  />
                ))}
              </View>

              <SafeAreaView style={styles.headerContent}>
                <View style={styles.headerButtons}>
                  <TouchableOpacity
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); toggleTheme(); }}
                    style={styles.themeButtonTop}
                    activeOpacity={0.8}
                  >
                    <View style={styles.themeButtonContainer}>
                      <Feather name={isDarkMode ? "sun" : "moon"} size={16} color="white" />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onClose} style={styles.closeButtonTop} activeOpacity={0.8}>
                    <View style={styles.closeButtonContainer}>
                      <Feather name="x" size={18} color="white" />
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={styles.logoSection}>
                  <View style={styles.logoContainer}>
                    <Image source={require('assets/images/LOGOc.png')} style={styles.logo} contentFit="contain" cachePolicy="memory-disk" />
                  </View>
                  <View style={styles.churchInfo}>
                    <Text style={[styles.churchName, { color: 'white' }]}>Christ En Nous</Text>
                    <Text style={[styles.churchVision, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.9)' }]}>
                      Évangéliser • Faire des Disciples • Servir
                    </Text>
                  </View>
                </View>
              </SafeAreaView>
            </LinearGradient>
          </View>

          <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            <MenuSection title="Vie Spirituelle" icon="book-open" isDarkMode={isDarkMode}>
              <MenuItem
                icon="book-open"
                label="Sainte Bible"
                onPress={() => handleNavigation('/(tabs)/bible')}
                isDarkMode={isDarkMode}
              />
              <MenuItem
                icon="moon"
                label="Mur de Prière"
                onPress={() => handleNavigation('/(tabs)/prayer')}
                isDarkMode={isDarkMode}
              />
              <MenuItem
                icon="coffee"
                label="Méditations Quotidiennes"
                onPress={() => handleNavigation('/meditations')}
                isDarkMode={isDarkMode}
              />
              <MenuItem
                icon="users"
                label="Méditons Ensemble"
                onPress={() => handleNavigation('/community')}
                isDarkMode={isDarkMode}
              />
            </MenuSection>

            <MenuSection title="CHRIST EN NOUS ACADEMY" icon="layers" isDarkMode={isDarkMode}>
              <MenuItem
                icon="award"
                label="Academy"
                onPress={() => handleNavigation('/(tabs)/courses')}
                isDarkMode={isDarkMode}
              />
              <MenuItem
                icon="book"
                label="Bibliothèques et Archives"
                onPress={() => handleComingSoon("La bibliothèque")}
                isDarkMode={isDarkMode}
              />
            </MenuSection>

            <MenuSection title="Ministères" icon="users" isDarkMode={isDarkMode}>
              <MenuItem
                icon="music"
                label="Cantiques Nouveaux"
                onPress={() => handleComingSoon("Cantiques Nouveaux")}
                isDarkMode={isDarkMode}
              />
              <MenuItem
                icon="users"
                label="Markos (Jeunesse)"
                onPress={() => handleComingSoon("Markos")}
                isDarkMode={isDarkMode}
              />
            </MenuSection>

            <MenuSection title="MISSION" icon="globe" isDarkMode={isDarkMode}>
              <MenuItem
                icon="globe"
                label="BOMI"
                subLabel="(Bonnes Œuvres Missions Internationales)"
                onPress={() => handleComingSoon("BOMI")}
                isDarkMode={isDarkMode}
              />
            </MenuSection>

            <MenuSection title="Autres" icon="more-horizontal" isDarkMode={isDarkMode} defaultExpanded={false}>
               <MenuItem
                icon="target"
                label="Plan de Défis"
                onPress={() => handleNavigation('/challenges')}
                isDarkMode={isDarkMode}
              />
            </MenuSection>

             <MenuSection title="Mon Espace" icon="user" isDarkMode={isDarkMode} defaultExpanded={false}>
              <MenuItem
                icon="user"
                label="Mon Profil"
                onPress={() => handleNavigation('/(tabs)/profile')}
                isDarkMode={isDarkMode}
              />
              <MenuItem
                icon="shield"
                label="Sécurité"
                onPress={() => handleNavigation('/(modals)/security')}
                isDarkMode={isDarkMode}
              />
              <MenuItem
                icon="settings"
                label="Paramètres"
                onPress={() => handleComingSoon("Les paramètres")}
                isDarkMode={isDarkMode}
              />
            </MenuSection>

            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.logoutButton, {
                backgroundColor: isDarkMode ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)',
                borderColor: isDarkMode ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)'
              }]}
            >
              <Feather name="log-out" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>

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
  container: { flex: 1 },
  menuContainer: { position: 'absolute', top: 0, bottom: 0, right: 0, width: MENU_WIDTH, shadowColor: '#000', shadowOffset: { width: -12, height: 0 }, shadowRadius: 35, elevation: 35, borderTopLeftRadius: 30, borderBottomLeftRadius: 30, overflow: 'hidden' },
  glassEdge: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, zIndex: 100 },
  headerContainer: { height: HEADER_HEIGHT, overflow: 'hidden' },
  headerGradient: { flex: 1, borderBottomLeftRadius: 50, borderBottomRightRadius: 0 },
  particlesContainer: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  particle: { position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.4)' },
  headerContent: { flex: 1, paddingHorizontal: 25, paddingTop: Platform.OS === 'android' ? 10 : 0, zIndex: 2 },
  headerButtons: { position: 'absolute', top: 50, right: 20, flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  themeButtonTop: { marginRight: 12 },
  themeButtonContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  closeButtonTop: {},
  closeButtonContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  logoSection: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 15 },
  logoContainer: { width: 80, height: 80, borderRadius: 40, top: -10, backgroundColor: 'transparent', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  logo: { width: '250%', height: '250%', bottom: -10 },
  churchInfo: { marginTop: 20, alignItems: 'center', top: -20 },
  churchName: { fontSize: 26, fontFamily: 'Nunito_800ExtraBold', letterSpacing: 1, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  churchVision: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', marginTop: 6, textAlign: 'center', letterSpacing: 0.8, lineHeight: 18 },
  menuContent: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  sectionContainer: { marginBottom: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 5 },
  sectionTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 12, fontFamily: 'Nunito_700Bold', letterSpacing: 1.5, marginLeft: 10 },
  sectionContent: { marginBottom: 5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 16, marginVertical: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  menuItemTextContainer: { flex: 1, marginLeft: 14 },
  menuItemIconContainer: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuItemText: { fontSize: 15, fontFamily: 'Nunito_600SemiBold', letterSpacing: 0.2 },
  menuItemSubText: { fontSize: 11, fontFamily: 'Nunito_400Regular', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 8 },
  badgeText: { color: 'white', fontSize: 11, fontFamily: 'Nunito_700Bold' },
  newBadge: { backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginRight: 8 },
  newBadgeText: { color: 'white', fontSize: 10, fontFamily: 'Nunito_700Bold', letterSpacing: 0.5 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, marginTop: 20, marginBottom: 10, borderWidth: 1 },
  logoutText: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: '#EF4444', marginLeft: 12 },
  versionText: { textAlign: 'center', fontSize: 12, fontFamily: 'Nunito_400Regular', marginTop: 20 },
});

export default HomeMenuModal;