// app/(tabs)/bible/meditation-music-selection.tsx
// Sélection de la musique d'ambiance pour la méditation

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/useAppTheme';

// Liste des musiques disponibles
const MUSIC_OPTIONS = [
  {
    id: 'all-honor',
    name: 'All Honor',
    description: 'Instrumental pour monter en Esprit',
    icon: 'music',
    color: '#E91E63',
    file: require('../../../assets/music/all-honor.m4a')
  },
  {
    id: 'silence',
    name: 'Silence',
    description: 'Méditation dans le silence complet',
    icon: 'volume-x',
    color: '#9E9E9E',
    file: null
  },
  // Vous pouvez ajouter d'autres musiques ici plus tard
];

export default function MeditationMusicSelection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const params = useLocalSearchParams();

  const [selectedMusic, setSelectedMusic] = useState<string>('all-honor');

  const book = params.book as string;
  const bookName = params.bookName as string;
  const chapter = Number(params.chapter);
  const verse = Number(params.verse) || 1;

  const handleContinue = () => {
    // Naviguer vers la sélection de durée
    router.push({
      pathname: '/bible/meditation-duration-selection',
      params: {
        book,
        bookName,
        chapter,
        verse,
        music: selectedMusic
      }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* FOND GRADIENT */}
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
      />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choisir une ambiance</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* CONTENU */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="music-note" size={32} color="#FFD700" />
          <Text style={styles.infoTitle}>Musique d'ambiance</Text>
          <Text style={styles.infoText}>
            La musique peut aider à créer une atmosphère propice à la méditation et à la concentration.
          </Text>
        </View>

        {/* LISTE DES MUSIQUES */}
        {MUSIC_OPTIONS.map((music) => (
          <TouchableOpacity
            key={music.id}
            style={[
              styles.musicCard,
              selectedMusic === music.id && styles.musicCardSelected
            ]}
            onPress={() => setSelectedMusic(music.id)}
          >
            <View style={[styles.musicIcon, { backgroundColor: music.color + '20' }]}>
              <Feather name={music.icon as any} size={28} color={music.color} />
            </View>

            <View style={styles.musicInfo}>
              <Text style={styles.musicName}>{music.name}</Text>
              <Text style={styles.musicDescription}>{music.description}</Text>
            </View>

            <View style={styles.radioOuter}>
              {selectedMusic === music.id && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* BOUTON CONTINUER */}
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Continuer</Text>
          <Feather name="arrow-right" size={20} color="#1a1a2e" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  backBtn: { padding: 8 },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Nunito_700Bold'
  },

  content: { padding: 20, paddingBottom: 40 },

  infoCard: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)'
  },
  infoTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    marginTop: 12,
    marginBottom: 8
  },
  infoText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    textAlign: 'center',
    lineHeight: 20
  },

  musicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  musicCardSelected: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.1)'
  },
  musicIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  musicInfo: { flex: 1 },
  musicName: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 4
  },
  musicDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontFamily: 'Nunito_500Medium'
  },

  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD700'
  },

  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 24,
    gap: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  continueBtnText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold'
  }
});
