import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';

// --- DONNÉES DES 2 SETS ---

// SET A : Action & Intégration
const SET_A = {
  big: {
    title: 'JE VEUX SERVIR',
    subtitle: 'Rejoins la Dream Team et mets tes talents en action.',
    action: "M'engager",
    icon: 'hand-heart',
    bgIcon: 'hand-heart',
    colors: ['#2563EB', '#1E3A8A'], // Bleu Royal
    route: '/serve',
    textColor: 'white',
    iconColor: 'white'
  },
  top: {
    title: 'Nouveau ?',
    subtitle: 'Bienvenue à la maison.',
    icon: 'compass',
    bgIcon: 'compass-outline',
    colors: ['#F1F5F9', '#F1F5F9'], // Gris très clair (Surface Variant)
    route: '/newcomers',
    isDark: false 
  },
  bottom: {
    title: 'Témoignages',
    subtitle: 'Récits de gloire.',
    icon: 'message-draw',
    bgIcon: 'format-quote-close',
    colors: ['#FFFFFF', '#FFFFFF'], // Blanc (Surface)
    route: '/testimony',
    isDark: false
  }
};

// SET B : Connexion & Soutien
const SET_B = {
  big: {
    title: 'GROUPES DE VIE',
    subtitle: 'Une famille spirituelle proche de chez toi.',
    action: "Trouver mon groupe",
    icon: 'account-group',
    bgIcon: 'home-heart',
    colors: ['#059669', '#064E3B'], // Vert Émeraude Profond
    route: '/groups',
    textColor: 'white',
    iconColor: 'white'
  },
  top: {
    title: 'Faire un Don',
    subtitle: 'Soutenir la vision.',
    icon: 'gift',
    bgIcon: 'gift-outline',
    colors: ['#FFFBEB', '#FFFBEB'], // Ambre très clair
    route: '/giving',
    isDark: false,
    accent: '#D97706' // Accent Ambre
  },
  bottom: {
    title: 'Agenda',
    subtitle: 'Prochains événements.',
    icon: 'calendar-month',
    bgIcon: 'calendar-clock',
    colors: ['#FFFFFF', '#FFFFFF'],
    route: '/events',
    isDark: false,
    accent: '#4F46E5' // Accent Indigo
  }
};

export default function MinistryGrid() {
  const theme = useAppTheme();
  const router = useRouter();
  
  // État pour basculer entre Set A (false) et Set B (true)
  const [showSetB, setShowSetB] = useState(false);
  
  // Animations
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Cycle d'animation
  useEffect(() => {
    const cycle = setInterval(() => {
      // 1. DISPARITION RAPIDE (Flash Out)
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200, // Très vite
          useNativeDriver: true,
          easing: Easing.in(Easing.quad)
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95, // Léger recul
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => {
        // 2. CHANGEMENT DE CONTENU
        setShowSetB(prev => !prev);

        // 3. APPARITION SOUDAINE (Pop In)
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 350, // Un peu plus lent pour apprécier l'arrivée
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1.5)) // Effet "Rebond" (Pop)
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1.5))
          })
        ]).start();
      });
    }, 8000); // Change toutes les 8 secondes (plus dynamique que 15s pour ce type de contenu)

    return () => clearInterval(cycle);
  }, []);

  const currentData = showSetB ? SET_B : SET_A;

  const handlePress = (route: string) => {
    // router.push(route);
    console.log("Naviguer vers:", route);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
          Vie de l'Église
        </Text>
        {/* Petit indicateur de cycle */}
        <View style={styles.indicatorContainer}>
          <View style={[styles.dot, { backgroundColor: !showSetB ? theme.colors.primary : theme.colors.outline + '40' }]} />
          <View style={[styles.dot, { backgroundColor: showSetB ? theme.colors.primary : theme.colors.outline + '40' }]} />
        </View>
      </View>

      <Animated.View 
        style={[
          styles.bentoGrid,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        
        {/* COLONNE GAUCHE (GRAND BLOC) */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={[styles.bigCard, { flex: 0.55 }]}
          onPress={() => handlePress(currentData.big.route)}
        >
          <LinearGradient
            colors={currentData.big.colors}
            style={styles.gradientFill}
          >
            <MaterialCommunityIcons 
              name={currentData.big.bgIcon as any} 
              size={140} 
              color="rgba(255,255,255,0.05)" 
              style={styles.bgIconBig} 
            />
            
            <View style={styles.cardContent}>
              <View style={[styles.iconBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <MaterialCommunityIcons name={currentData.big.icon as any} size={24} color="white" />
              </View>
              
              <View style={styles.bottomText}>
                <Text style={styles.bigTitle}>{currentData.big.title}</Text>
                <Text style={styles.bigSubtitle}>{currentData.big.subtitle}</Text>
                
                <View style={styles.actionPill}>
                  <Text style={[styles.actionTextPrimary, { color: currentData.big.colors[0] }]}>
                    {currentData.big.action}
                  </Text>
                  <Feather name="arrow-right" size={14} color={currentData.big.colors[0]} />
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* COLONNE DROITE (2 BLOCS EMPILÉS) */}
        <View style={styles.rightColumn}>
          
          {/* BLOC HAUT */}
          <TouchableOpacity 
            activeOpacity={0.9} 
            style={[styles.smallCard, { backgroundColor: currentData.top.colors[0] }]}
            onPress={() => handlePress(currentData.top.route)}
          >
            <MaterialCommunityIcons 
              name={currentData.top.bgIcon as any} 
              size={60} 
              color={currentData.top.accent ? currentData.top.accent + '15' : theme.colors.primary + '10'} 
              style={styles.bgIconSmall} 
            />
            
            <View style={styles.smallContent}>
              <View style={styles.rowBetween}>
                 <Text style={[styles.smallTitle, { color: theme.colors.onSurface }]}>
                    {currentData.top.title}
                 </Text>
                 <MaterialCommunityIcons 
                    name={currentData.top.icon as any} 
                    size={20} 
                    color={currentData.top.accent || theme.colors.primary} 
                 />
              </View>
              <Text style={[styles.smallSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                {currentData.top.subtitle}
              </Text>
            </View>
          </TouchableOpacity>

          {/* BLOC BAS */}
          <TouchableOpacity 
            activeOpacity={0.9} 
            style={[
                styles.smallCard, 
                { 
                    backgroundColor: currentData.bottom.colors[0], 
                    borderWidth: 1, 
                    borderColor: theme.colors.outline + '20' 
                }
            ]}
            onPress={() => handlePress(currentData.bottom.route)}
          >
             <MaterialCommunityIcons 
                name={currentData.bottom.bgIcon as any} 
                size={60} 
                color={currentData.bottom.accent ? currentData.bottom.accent + '15' : theme.colors.secondary + '10'} 
                style={styles.bgIconSmall} 
             />
            
            <View style={styles.smallContent}>
              <View style={styles.rowBetween}>
                 <Text style={[styles.smallTitle, { color: theme.colors.onSurface }]}>
                    {currentData.bottom.title}
                 </Text>
                 <MaterialCommunityIcons 
                    name={currentData.bottom.icon as any} 
                    size={20} 
                    color={currentData.bottom.accent || theme.colors.secondary} 
                 />
              </View>
              <Text style={[styles.smallSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                {currentData.bottom.subtitle}
              </Text>
            </View>
          </TouchableOpacity>

        </View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bentoGrid: {
    flexDirection: 'row',
    height: 220, 
    gap: 12,
  },
  
  // Carte Gauche
  bigCard: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  gradientFill: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  bgIconBig: {
    position: 'absolute',
    right: -30,
    top: 20,
    transform: [{ rotate: '-15deg' }]
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomText: {
    gap: 6,
  },
  bigTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Nunito_900Black',
    letterSpacing: 0.5,
    lineHeight: 22,
    textTransform: 'uppercase',
  },
  bigSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 8,
    minHeight: 36, // Pour éviter les sauts de hauteur
  },
  actionPill: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionTextPrimary: {
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
  },

  // Colonne Droite
  rightColumn: {
    flex: 0.45,
    gap: 12,
  },
  smallCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bgIconSmall: {
    position: 'absolute',
    right: -10,
    top: -10,
  },
  smallContent: {},
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  smallTitle: {
    fontSize: 14, // Légèrement réduit pour s'adapter
    fontFamily: 'Nunito_800ExtraBold',
  },
  smallSubtitle: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    lineHeight: 14,
  },
});
