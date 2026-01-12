// app/(tabs)/bible/meditation.tsx
// Dashboard de Méditation : Accueil, Choix, Ambiance.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Dimensions,
  StatusBar
} from 'react-native';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useBible } from '@/context/EnhancedBibleContext';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

// --- DATA ---
const AMBIANCES = [
    { id: 'silence', name: 'Silence', icon: 'volume-x', color: '#9E9E9E' },
    { id: 'piano', name: 'Piano Doux', icon: 'music', color: '#E91E63' },
    { id: 'rain', name: 'Pluie', icon: 'cloud-rain', color: '#2196F3' },
    { id: 'nature', name: 'Forêt', icon: 'wind', color: '#4CAF50' },
    { id: 'worship', name: 'Louange', icon: 'heart', color: '#FF9800' },
];

export default function MeditationDashboard() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dailyVerse, userProgress } = useBible(); // On utilisera dailyVerse comme suggestion par défaut
  
  // State
  const [selectedAmbience, setSelectedAmbience] = useState('piano');
  const [selectedPassage, setSelectedPassage] = useState<{book: string, chapter: number, verse: number} | null>(null);
  
  // Simulation de la "Dernière méditation" (à connecter au vrai service plus tard)
  const lastMeditation = { book: 'Psaumes', chapter: 23, verse: 1 }; 

  const handleStart = () => {
      // Naviguer vers le Player avec les paramètres
      router.push({
          pathname: '/bible/meditation-player',
          params: {
              book: selectedPassage?.book || dailyVerse.reference.split(' ')[0], // Simplification, à améliorer
              chapter: selectedPassage?.chapter || 1,
              verse: selectedPassage?.verse || 1,
              ambience: selectedAmbience
          }
      });
  };

  const handleSelectPassage = () => {
      router.push('/bible/meditation-selection');
  };

  return (
    <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* BACKGROUND IMAGE (Abstraite) */}
        <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop' }} 
            style={StyleSheet.absoluteFill}
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.3)', '#1a1a2e']}
                style={StyleSheet.absoluteFill}
            />
        </ImageBackground>

        {/* HEADER */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                <Feather name="x" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Espace Méditation</Text>
            <TouchableOpacity style={styles.iconBtn}>
                <Feather name="clock" size={24} color="#FFF" />
            </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            
            {/* VUE DU JOUR (Suggestion) */}
            <View style={styles.dailyCard}>
                <BlurView intensity={30} style={StyleSheet.absoluteFill} />
                <View style={styles.dailyContent}>
                    <Text style={styles.dailyLabel}>SUGGESTION DU JOUR</Text>
                    <Text style={styles.dailyVerseText}>"{dailyVerse.verse}"</Text>
                    <Text style={styles.dailyRef}>{dailyVerse.reference}</Text>
                    
                    <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
                        <Text style={styles.startBtnText}>Méditer maintenant</Text>
                        <Feather name="play-circle" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* REPRENDRE */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>REPRENDRE</Text>
                <TouchableOpacity style={styles.resumeCard} onPress={() => {
                    // Logique pour reprendre la dernière
                    setSelectedPassage(lastMeditation);
                    handleStart();
                }}>
                    <View style={styles.resumeIcon}>
                        <FontAwesome5 name="book-reader" size={20} color="#FFF" />
                    </View>
                    <View style={styles.resumeInfo}>
                        <Text style={styles.resumeTitle}>{lastMeditation.book} {lastMeditation.chapter}</Text>
                        <Text style={styles.resumeSub}>Verset {lastMeditation.verse} • Il y a 2 jours</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
            </View>

            {/* CHOISIR UN PASSAGE */}
            <TouchableOpacity style={styles.pickerBtn} onPress={handleSelectPassage}>
                <Feather name="search" size={20} color="#FFF" />
                <Text style={styles.pickerText}>Choisir un autre passage biblique</Text>
            </TouchableOpacity>

            {/* AMBIANCE SONORE */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>AMBIANCE SONORE</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ambienceList}>
                    {AMBIANCES.map((amb) => (
                        <TouchableOpacity 
                            key={amb.id} 
                            style={[
                                styles.ambienceItem, 
                                selectedAmbience === amb.id && { borderColor: amb.color, backgroundColor: amb.color + '20' }
                            ]}
                            onPress={() => setSelectedAmbience(amb.id)}
                        >
                            <Feather name={amb.icon as any} size={24} color={selectedAmbience === amb.id ? amb.color : 'rgba(255,255,255,0.5)'} />
                            <Text style={[styles.ambienceText, selectedAmbience === amb.id && { color: amb.color }]}>{amb.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 20
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontFamily: 'Nunito_700Bold', letterSpacing: 1 },
  iconBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },

  content: { padding: 20, paddingBottom: 40 },

  dailyCard: {
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      marginBottom: 32
  },
  dailyContent: { padding: 24, alignItems: 'center' },
  dailyLabel: { color: '#FFD700', fontSize: 12, fontFamily: 'Nunito_800ExtraBold', marginBottom: 12, letterSpacing: 1.5 },
  dailyVerseText: { color: '#FFF', fontSize: 18, fontFamily: 'Nunito_600SemiBold', textAlign: 'center', fontStyle: 'italic', lineHeight: 28 },
  dailyRef: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: 'Nunito_700Bold', marginTop: 12, marginBottom: 24 },
  
  startBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFD700', // Gold
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 30,
      gap: 10,
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5
  },
  startBtnText: { color: '#1a1a2e', fontSize: 16, fontFamily: 'Nunito_800ExtraBold' },

  section: { marginBottom: 32 },
  sectionTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'Nunito_800ExtraBold', marginBottom: 16, letterSpacing: 1 },

  resumeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.08)',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)'
  },
  resumeIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  resumeInfo: { flex: 1 },
  resumeTitle: { color: '#FFF', fontSize: 16, fontFamily: 'Nunito_700Bold' },
  resumeSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'Nunito_500Medium' },

  pickerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.08)',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      marginBottom: 32,
      gap: 10
  },
  pickerText: { color: '#FFF', fontSize: 15, fontFamily: 'Nunito_600SemiBold' },

  ambienceList: { gap: 12 },
  ambienceItem: {
      width: 100,
      height: 100,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent'
  },
  ambienceText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'Nunito_700Bold', marginTop: 8 }
});
