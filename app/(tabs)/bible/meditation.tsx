// app/(tabs)/bible/meditation.tsx
// Dashboard de Méditation : Accueil, Choix, Ambiance.

import React, { useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useBible } from '@/context/EnhancedBibleContext';
import { useAuth } from '@/context/AuthContext';
import { meditationProgressService, BookProgress } from '@/services/bible/meditationProgressService';
import { dailySuggestionService, DailySuggestion } from '@/services/meditation/dailySuggestionService';
import { firebaseSyncService } from '@/services/firebase/firebaseSyncService';
import { Alert } from 'react-native';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

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
  const { userProgress } = useBible();
  const { userProfile } = useAuth();
  const { toast, success, error, loading: showLoading, hideToast } = useToast();

  // State
  const [selectedAmbience, setSelectedAmbience] = useState('piano');
  const [selectedPassage, setSelectedPassage] = useState<{book: string, chapter: number, verse: number} | null>(null);
  const [incompleteBooks, setIncompleteBooks] = useState<BookProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Suggestion quotidienne
  const todaySuggestion: DailySuggestion = dailySuggestionService.getTodaySuggestion();

  // Rafraîchir les données à chaque fois qu'on revient sur cet écran
  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [userProfile?.uid])
  );

  const loadProgress = async () => {
    if (!userProfile?.uid) {
      setLoading(false);
      return;
    }

    try {
      const incomplete = await meditationProgressService.getIncompleteBooks(userProfile.uid);
      setIncompleteBooks(incomplete);
    } catch (e) {
      // Erreur silencieuse
    } finally {
      setLoading(false);
    }
  };

  // Plus besoin de cette variable, on affichera tous les livres en cours 

  const handleMeditateNow = () => {
      // Utiliser la suggestion du jour et aller à la sélection de musique
      router.push({
          pathname: '/bible/meditation-music-selection',
          params: {
              book: todaySuggestion.book,
              bookName: todaySuggestion.bookName,
              chapter: todaySuggestion.chapter,
              verse: todaySuggestion.verse
          }
      });
  };

  const handleSelectPassage = () => {
      router.push('/bible/meditation-selection');
  };


  return (
    <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Toast personnalisé */}
        <Toast
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
            onHide={hideToast}
        />

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
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/bible/meditation-history')}>
                <Feather name="clock" size={24} color="#FFF" />
            </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            
            {/* SUGGESTION DU JOUR */}
            <View style={styles.dailyCard}>
                <BlurView intensity={30} style={StyleSheet.absoluteFill} />
                <View style={styles.dailyContent}>
                    <Text style={styles.dailyLabel}>✨ SUGGESTION DU JOUR</Text>
                    <Text style={styles.dailyVerseText}>"{todaySuggestion.text}"</Text>
                    <Text style={styles.dailyRef}>{todaySuggestion.reference}</Text>

                    <TouchableOpacity style={styles.startBtn} onPress={handleMeditateNow}>
                        <Text style={styles.startBtnText}>Méditer maintenant</Text>
                        <Feather name="play-circle" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* REPRENDRE - Tous les livres en cours */}
            {incompleteBooks.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>REPRENDRE ({incompleteBooks.length})</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.booksScrollList}>
                        {incompleteBooks.map((book) => (
                            <TouchableOpacity
                                key={book.book}
                                style={styles.bookScrollCard}
                                onPress={() => {
                                    // Passer par les étapes de sélection (musique, durée)
                                    router.push({
                                        pathname: '/bible/meditation-music-selection',
                                        params: {
                                            book: book.book,
                                            bookName: book.bookName,
                                            chapter: book.lastChapterRead,
                                            verse: book.lastVerseRead
                                        }
                                    });
                                }}
                            >
                                <View style={styles.bookScrollIcon}>
                                    <FontAwesome5 name="book-open" size={24} color="#FFD700" />
                                </View>
                                <Text style={styles.bookScrollTitle}>{book.bookName}</Text>
                                <Text style={styles.bookScrollChapter}>Chapitre {book.lastChapterRead}</Text>
                                <View style={styles.miniProgress}>
                                    <View style={[styles.miniProgressFill, { width: `${(book.chaptersRead.length / book.totalChapters) * 100}%` }]} />
                                </View>
                                <Text style={styles.bookScrollProgress}>
                                    {book.chaptersRead.length}/{book.totalChapters}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* CHOISIR UN PASSAGE */}
            <TouchableOpacity style={styles.pickerBtn} onPress={handleSelectPassage}>
                <Feather name="search" size={20} color="#FFF" />
                <Text style={styles.pickerText}>Choisir un autre passage biblique</Text>
            </TouchableOpacity>

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
  ambienceText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'Nunito_700Bold', marginTop: 8 },

  booksScrollList: { gap: 16, paddingRight: 20 },
  bookScrollCard: {
      width: 140,
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      alignItems: 'center'
  },
  bookScrollIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255,215,0,0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12
  },
  bookScrollTitle: {
      color: '#FFF',
      fontSize: 14,
      fontFamily: 'Nunito_700Bold',
      textAlign: 'center',
      marginBottom: 4
  },
  bookScrollChapter: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 12,
      fontFamily: 'Nunito_600SemiBold',
      marginBottom: 8
  },
  miniProgress: {
      width: '100%',
      height: 4,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 2,
      overflow: 'hidden',
      marginBottom: 6
  },
  miniProgressFill: {
      height: '100%',
      backgroundColor: '#FFD700',
      borderRadius: 2
  },
  bookScrollProgress: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 11,
      fontFamily: 'Nunito_600SemiBold'
  }
});
