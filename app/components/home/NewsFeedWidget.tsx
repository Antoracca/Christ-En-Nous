import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';

const { width } = Dimensions.get('window');
const DURATION = 15000; // 15 secondes

type NewsType = 'CONVOCATION' | 'INSCRIPTION' | 'DONATION' | 'SUPPORT' | 'EVENT';

const NEWS_DATA = [
  {
    id: '1',
    type: 'EVENT' as NewsType,
    title: 'Grande Veillée de Prière',
    subtitle: 'Une nuit pour changer ta destinée',
    date: 'Vendredi 24 Nov • 22h00',
    action: 'Je participe',
    icon: 'star-four-points',
    colors: ['#4C1D95', '#8B5CF6'] // Violet Profond
  },
  {
    id: '2',
    type: 'SUPPORT' as NewsType,
    title: 'Décès & Soutien',
    subtitle: 'La famille Kouassi a besoin de nos prières suite au rappel à Dieu du père.',
    date: 'Obsèques : Samedi 25 Nov',
    action: 'Soutenir',
    icon: 'hand-heart',
    colors: ['#1E293B', '#475569'] // Gris Bleu Sobre
  },
  {
    id: '3',
    type: 'DONATION' as NewsType,
    title: 'Appel aux Dons : BOMI',
    subtitle: 'Objectif : 1000 Kits scolaires pour la mission à l\'intérieur du pays.',
    date: 'Urgent • Avant le 30 Nov',
    action: 'Faire un don',
    icon: 'gift',
    colors: ['#B45309', '#F59E0B'] // Or / Ambre
  },
  {
    id: '4',
    type: 'CONVOCATION' as NewsType,
    title: 'Réunion des Ouvriers',
    subtitle: 'Rencontre obligatoire pour tous les départements. Bilan annuel.',
    date: 'Dimanche 26 Nov • 14h00',
    action: 'Confirmer',
    icon: 'account-tie-voice',
    colors: ['#111827', '#374151'] // Noir Pro
  },
  {
    id: '5',
    type: 'INSCRIPTION' as NewsType,
    title: 'Formation : Leadership',
    subtitle: 'Inscriptions ouvertes pour la session de Décembre.',
    date: 'Places limitées',
    action: 'M\'inscrire',
    icon: 'school',
    colors: ['#047857', '#10B981'] // Vert Émeraude
  }
];

export default function NewsFeedWidget() {
  const theme = useAppTheme();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const currentItem = NEWS_DATA[currentIndex];

  useEffect(() => {
    startAnimationCycle();
  }, [currentIndex]);

  const startAnimationCycle = () => {
    // 1. Reset Progress Bar
    progressAnim.setValue(0);
    
    // 2. Lancer la barre de progression sur 15s
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: DURATION,
      easing: Easing.linear,
      useNativeDriver: false, // width ne supporte pas native driver
    }).start(({ finished }) => {
      if (finished) {
        changeSlide();
      }
    });
  };

  const changeSlide = () => {
    // 3. Animation de Sortie (Vers le haut + Fade Out)
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -20, duration: 500, useNativeDriver: true })
    ]).start(() => {
      // 4. Changer l'index
      setCurrentIndex((prev) => (prev + 1) % NEWS_DATA.length);
      
      // 5. Reset Position (Vers le bas pour l'entrée)
      slideAnim.setValue(20);
      
      // 6. Animation d'Entrée (Vers le haut + Fade In)
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true })
      ]).start();
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.pulseContainer}>
            <View style={[styles.pulseDot, { backgroundColor: theme.colors.error }]} />
          </View>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Actualités & Annonces</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/news')}>
          <Text style={[styles.seeAll, { color: theme.colors.primary }]}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(tabs)/news')}>
        <Animated.View 
          style={[ 
            styles.cardContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <LinearGradient
            colors={currentItem.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            {/* Background Decoratif */}
            <MaterialCommunityIcons 
              name={currentItem.icon as any} 
              size={120} 
              color="rgba(255,255,255,0.05)" 
              style={styles.bgIcon}
            />

            <View style={styles.cardContent}>
              <View style={styles.topRow}>
                <View style={styles.badgeContainer}>
                  <MaterialCommunityIcons name={currentItem.icon as any} size={14} color="white" />
                  <Text style={styles.badgeText}>{currentItem.type}</Text>
                </View>
                <Text style={styles.dateText}>{currentItem.date}</Text>
              </View>

              <Text style={styles.newsTitle} numberOfLines={2}>{currentItem.title}</Text>
              <Text style={styles.newsSubtitle} numberOfLines={2}>{currentItem.subtitle}</Text>

              <View style={styles.footerRow}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={[styles.actionText, { color: currentItem.colors[0] }]}>
                    {currentItem.action}
                  </Text>
                  <Feather name="arrow-right" size={14} color={currentItem.colors[0]} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Barre de Progression */}
            <View style={styles.progressContainer}>
              <Animated.View 
                style={[ 
                  styles.progressBar, 
                  { 
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    }) 
                  }
                ]} 
              />
            </View>

          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseContainer: {
    width: 8,
    height: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
  },
  seeAll: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  
  // Carte
  cardContainer: {
    height: 170, // Taille compacte mais riche
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  bgIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    transform: [{ rotate: '-15deg' }]
  },
  
  // Contenu
  cardContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Nunito_800ExtraBold',
    letterSpacing: 0.5,
  },
  dateText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
  },
  
  newsTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 4,
    lineHeight: 26,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  newsSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    lineHeight: 18,
    maxWidth: '90%',
  },
  
  footerRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
  },
  
  // Progress Bar
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.8)',
  }
});
