// app/(tabs)/bible/meditation-player.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBible } from '@/context/EnhancedBibleContext';
import { meditationJournalService } from '@/services/bible/meditationJournalService';
import { useAuth } from '@/context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function MeditationPlayer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { getChapter } = useBible();
  const { userProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [chapterData, setChapterData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0); // Index du verset (0-based)
  
  // Note State
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  const bookId = params.book as string;
  const chapterNum = Number(params.chapter);
  const startVerse = Number(params.verse) || 1;

  useEffect(() => {
      const load = async () => {
          try {
              const data = await getChapter({ book: bookId, chapter: chapterNum, end: undefined });
              if (data) {
                  setChapterData(data);
                  // Trouver l'index du verset de départ
                  const idx = data.verses.findIndex(v => v.verse === startVerse);
                  if (idx >= 0) setCurrentIndex(idx);
              }
          } catch (e) {
              console.error(e);
              Alert.alert("Erreur", "Impossible de charger ce chapitre.");
              router.back();
          } finally {
              setLoading(false);
          }
      };
      load();
  }, [bookId, chapterNum]);

  const handleNext = () => {
      if (currentIndex < (chapterData?.verses.length || 0) - 1) {
          setCurrentIndex(prev => prev + 1);
          setNoteText(''); // Reset note pour nouveau verset
          setShowNote(false);
      } else {
          // Fin du chapitre -> Proposition suite
          Alert.alert("Chapitre terminé", "Voulez-vous continuer au chapitre suivant ?", [
              { text: "Arrêter", onPress: () => router.back(), style: "cancel" },
              { text: "Continuer", onPress: () => {
                  // Recharger avec chap + 1
                  router.replace({
                      pathname: '/bible/meditation-player',
                      params: { book: bookId, chapter: chapterNum + 1, verse: 1 }
                  });
              }}
          ]);
      }
  };

  const handlePrev = () => {
      if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
      }
  };

  const saveNote = async () => {
      if (!noteText.trim() || !userProfile?.uid) return;
      
      const currentVerse = chapterData.verses[currentIndex];
      
      await meditationJournalService.addEntry(userProfile.uid, {
          date: new Date().toISOString(),
          durationSeconds: 0, // Pas de timer strict ici
          verse: { 
              text: currentVerse.text, 
              reference: `${bookId} ${chapterNum}:${currentVerse.verse}` 
          },
          note: noteText
      });
      
      Alert.alert("Note enregistrée", "Votre réflexion a été ajoutée au journal.");
      setShowNote(false);
  };

  if (loading) {
      return (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFF" />
              <Text style={styles.loadingText}>Préparation de votre moment...</Text>
          </View>
      );
  }

  if (!chapterData) {
      return (
          <View style={styles.loadingContainer}>
              <Feather name="alert-circle" size={48} color="#E91E63" />
              <Text style={styles.loadingText}>Impossible de charger ce passage.</Text>
              <TouchableOpacity onPress={() => router.back()} style={[styles.saveBtn, { marginTop: 20 }]}>
                  <Text style={styles.saveText}>Retour</Text>
              </TouchableOpacity>
          </View>
      );
  }

  const currentVerse = chapterData.verses[currentIndex];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <StatusBar hidden />
        
        {/* FOND IMMERSIF */}
        <LinearGradient
            colors={['#0f2027', '#203a43', '#2c5364']} // Deep Space
            style={StyleSheet.absoluteFill}
        />

        {/* HEADER */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                <Feather name="x" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.progressPill}>
                <Text style={styles.progressText}>
                    {bookId} {chapterNum}:{currentVerse?.verse}
                </Text>
            </View>
            <TouchableOpacity style={styles.iconBtn}>
                <Feather name="music" size={24} color="#FFF" />
            </TouchableOpacity>
        </View>

        {/* CONTENU CENTRAL */}
        <View style={styles.content}>
            <ScrollView contentContainerStyle={styles.scrollText}>
                <Text style={styles.verseText}>
                    "{currentVerse?.text}"
                </Text>
            </ScrollView>

            {/* ZONE NOTE */}
            {showNote && (
                <View style={styles.noteBox}>
                    <TextInput 
                        style={styles.input}
                        placeholder="Votre réflexion..."
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        multiline
                        value={noteText}
                        onChangeText={setNoteText}
                        autoFocus
                    />
                    <TouchableOpacity onPress={saveNote} style={styles.saveBtn}>
                        <Text style={styles.saveText}>Enregistrer</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>

        {/* CONTROLS BAS */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.controlsRow}>
                <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0} style={[styles.navBtn, { opacity: currentIndex === 0 ? 0.3 : 1 }]}>
                    <Feather name="chevron-left" size={32} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.mainActionBtn, { backgroundColor: showNote ? '#E91E63' : 'rgba(255,255,255,0.2)' }]}
                    onPress={() => setShowNote(!showNote)}
                >
                    <Feather name="edit-3" size={28} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleNext} style={styles.navBtn}>
                    <Feather name="chevron-right" size={32} color="#FFF" />
                </TouchableOpacity>
            </View>
            
            <Text style={styles.hint}>
                {currentIndex + 1} / {chapterData?.verses?.length || 0}
            </Text>
        </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#0f2027', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'rgba(255,255,255,0.7)', marginTop: 20, fontFamily: 'Nunito_600SemiBold' },

  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
  },
  iconBtn: { padding: 10 },
  progressPill: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
  },
  progressText: { color: '#FFF', fontFamily: 'Nunito_700Bold' },

  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  scrollText: { flexGrow: 1, justifyContent: 'center' },
  verseText: { 
      color: '#FFF', 
      fontSize: 24, 
      fontFamily: 'Nunito_600SemiBold', 
      textAlign: 'center', 
      lineHeight: 36,
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4
  },

  noteBox: {
      position: 'absolute',
      bottom: 20,
      left: 0, 
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)'
  },
  input: {
      color: '#FFF',
      fontFamily: 'Nunito_500Medium',
      minHeight: 80,
      textAlignVertical: 'top',
      marginBottom: 10
  },
  saveBtn: {
      alignSelf: 'flex-end',
      backgroundColor: '#E91E63',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8
  },
  saveText: { color: '#FFF', fontFamily: 'Nunito_700Bold', fontSize: 12 },

  footer: { paddingHorizontal: 40 },
  controlsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
  },
  navBtn: { padding: 20 },
  mainActionBtn: {
      width: 70, height: 70, borderRadius: 35,
      justifyContent: 'center', alignItems: 'center',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
  },
  hint: {
      textAlign: 'center',
      color: 'rgba(255,255,255,0.3)',
      fontFamily: 'Nunito_700Bold',
      fontSize: 12
  }
});
