import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ImageBackground } from 'react-native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image'; // Utilisation d'Expo Image pour la perf
import { useAppTheme } from '@/hooks/useAppTheme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8; // Carte large "Cinéma"

const SERMONS = [
  {
    id: '1',
    title: 'La Puissance de la Foi',
    preacher: 'Pst. Jean Marc',
    series: 'Série : Les Fondements',
    date: 'Il y a 2 jours',
    duration: '45 min',
    thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop', // Image église/lumière
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    progress: 0.6, // 60% regardé
  },
  {
    id: '2',
    title: 'Vaincre l\'Anxiété',
    preacher: 'Pst. Sarah K.',
    series: 'Série : Paix Intérieure',
    date: 'Dimanche dernier',
    duration: '58 min',
    thumbnail: 'https://images.unsplash.com/photo-1507692049790-de58293a469d?q=80&w=2070&auto=format&fit=crop',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    progress: 0,
  },
  {
    id: '3',
    title: 'L\'Adoration en Esprit',
    preacher: 'Fr. Thomas',
    series: 'Hors-Série',
    date: '12 Nov 2025',
    duration: '32 min',
    thumbnail: 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?q=80&w=2090&auto=format&fit=crop',
    avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
    progress: 0,
  }
];

export default function SermonSection() {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>Dernières Prédications</Text>
          <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={[styles.badgeText, { color: theme.colors.primary }]}>Nouveau</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={[styles.seeAll, { color: theme.colors.primary }]}>Médiathèque</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 15}
      >
        {SERMONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            style={styles.cardWrapper}
          >
            <ImageBackground
              source={{ uri: item.thumbnail }}
              style={styles.cardImage}
              imageStyle={{ borderRadius: 20 }}
            >
              {/* Overlay Sombre pour lisibilité */}
              <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
                style={styles.gradient}
              >
                {/* Haut de carte : Série & Durée */}
                <View style={styles.topRow}>
                  <View style={styles.seriesBadge}>
                    <Text style={styles.seriesText}>{item.series.toUpperCase()}</Text>
                  </View>
                  <View style={styles.durationBadge}>
                    <Feather name="clock" size={10} color="white" />
                    <Text style={styles.durationText}>{item.duration}</Text>
                  </View>
                </View>

                {/* Bouton Play Central (Glassmorphism) */}
                <View style={styles.centerPlay}>
                  <View style={styles.playButtonGlass}>
                    <Ionicons name="play" size={28} color="white" style={{ marginLeft: 4 }} />
                  </View>
                </View>

                {/* Bas de carte : Infos */}
                <View style={styles.bottomInfo}>
                  <Text style={styles.sermonTitle} numberOfLines={1}>{item.title}</Text>
                  
                  <View style={styles.preacherRow}>
                    <Image source={{ uri: item.avatar }} style={styles.avatar} />
                    <Text style={styles.preacherName}>{item.preacher}</Text>
                    <View style={styles.dotSeparator} />
                    <Text style={styles.dateText}>{item.date}</Text>
                  </View>

                  {/* Barre de progression si entamé */}
                  {item.progress > 0 && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${item.progress * 100}%`, backgroundColor: theme.colors.primary }]} />
                      </View>
                      <Text style={styles.resumeText}>Reprendre</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
  },
  seeAll: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: 200, // Format Cinéma 16:9 approx
    marginRight: 15,
    borderRadius: 20,
    // Ombre portée
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  seriesBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B', // Accent couleur
  },
  seriesText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    letterSpacing: 0.5,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
  },
  centerPlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  playButtonGlass: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)', // Effet Glass
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  bottomInfo: {
    marginTop: 'auto',
  },
  sermonTitle: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  preacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'white',
  },
  preacherName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dateText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontFamily: 'Nunito_400Regular',
  },
  progressContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBg: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  resumeText: {
    color: 'white', // Couleur thème primaire dans le JSX
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
  }
});