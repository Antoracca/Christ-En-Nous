// app/(tabs)/bible/meditation-duration-selection.tsx
// Sélection de la durée de la méditation
// Mode Horizontal + Slider Custom

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
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider'; // ✅ Réintégration Slider

const PRESETS = [
  { minutes: 5, label: 'Court', description: 'Pause rapide' },
  { minutes: 10, label: 'Moyen', description: 'Réflexion calme' },
  { minutes: 15, label: 'Long', description: 'Immersion' },
  { minutes: 20, label: 'Profond', description: 'Prière étendue' },
];

export default function MeditationDurationSelection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [selectedDuration, setSelectedDuration] = useState<number>(10);
  const [isCustom, setIsCustom] = useState(false);

  const book = params.book as string;
  const bookName = params.bookName as string;
  const chapter = Number(params.chapter);
  const verse = Number(params.verse) || 1;
  const music = params.music as string;

  const handleStart = () => {
    // Naviguer vers le player de méditation
    router.push({
      pathname: '/bible/meditation-player',
      params: {
        book,
        bookName,
        chapter,
        verse,
        music,
        duration: selectedDuration
      }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choisir la durée</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* INFO CARD */}
        <View style={styles.infoCard}>
          <Feather name="clock" size={32} color="#FFD700" />
          <Text style={styles.infoTitle}>{selectedDuration} Minutes</Text>
          <Text style={styles.infoText}>
            Temps consacré à votre méditation
          </Text>
        </View>

        {/* LISTE HORIZONTALE DES PRESETS */}
        <Text style={styles.sectionTitle}>OPTIONS RAPIDES</Text>
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalList}
        >
            {PRESETS.map((d) => (
            <TouchableOpacity
                key={d.minutes}
                style={[
                styles.presetCard,
                selectedDuration === d.minutes && !isCustom && styles.presetCardSelected
                ]}
                onPress={() => {
                    setSelectedDuration(d.minutes);
                    setIsCustom(false);
                }}
            >
                <Text style={[styles.minutesText, selectedDuration === d.minutes && !isCustom && { color: '#FFD700' }]}>
                    {d.minutes}
                </Text>
                <Text style={styles.minLabel}>min</Text>
                <Text style={styles.durationLabel}>{d.label}</Text>
            </TouchableOpacity>
            ))}
        </ScrollView>

        {/* SLIDER CUSTOM */}
        <View style={styles.customSection}>
            <Text style={styles.sectionTitle}>PERSONNALISÉ</Text>
            <View style={[styles.sliderCard, isCustom && styles.presetCardSelected]}>
                <View style={styles.sliderHeader}>
                    <Text style={styles.sliderValue}>{isCustom ? selectedDuration : '--'} min</Text>
                    <Text style={styles.sliderHint}>Glissez pour ajuster</Text>
                </View>
                <Slider
                    style={{width: '100%', height: 40}}
                    minimumValue={1}
                    maximumValue={60}
                    step={1}
                    value={selectedDuration}
                    onValueChange={(val) => {
                        setSelectedDuration(val);
                        setIsCustom(true);
                    }}
                    minimumTrackTintColor="#FFD700"
                    maximumTrackTintColor="rgba(255,255,255,0.3)"
                    thumbTintColor="#FFD700"
                />
            </View>
        </View>

        {/* BOUTON COMMENCER */}
        <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
          <Text style={styles.startBtnText}>Commencer</Text>
          <Feather name="play-circle" size={24} color="#1a1a2e" />
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

  content: { paddingVertical: 20 },

  infoCard: {
    alignItems: 'center',
    marginBottom: 32,
    marginHorizontal: 20
  },
  infoTitle: {
    color: '#FFD700',
    fontSize: 32,
    fontFamily: 'Nunito_800ExtraBold',
    marginTop: 12,
    marginBottom: 8
  },
  infoText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontFamily: 'Nunito_500Medium',
    textAlign: 'center'
  },

  sectionTitle: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 12,
      fontFamily: 'Nunito_800ExtraBold',
      marginBottom: 16,
      marginLeft: 20,
      letterSpacing: 1
  },

  horizontalList: {
      paddingHorizontal: 20,
      gap: 12,
      paddingBottom: 20
  },

  presetCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    width: 100,
    height: 120,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center'
  },
  presetCardSelected: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.1)'
  },
  minutesText: {
    color: '#FFF',
    fontSize: 32,
    fontFamily: 'Nunito_800ExtraBold',
    lineHeight: 36
  },
  minLabel: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 12,
      fontFamily: 'Nunito_600SemiBold',
      marginBottom: 8
  },
  durationLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    textTransform: 'uppercase'
  },

  customSection: {
      marginHorizontal: 20,
      marginTop: 10
  },
  sliderCard: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 20,
      padding: 20,
      borderWidth: 2,
      borderColor: 'transparent'
  },
  sliderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10
  },
  sliderValue: { color: '#FFD700', fontSize: 18, fontFamily: 'Nunito_800ExtraBold' },
  sliderHint: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'Nunito_600SemiBold' },

  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 18,
    borderRadius: 30,
    marginHorizontal: 40,
    marginTop: 40,
    gap: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8
  },
  startBtnText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold'
  }
});