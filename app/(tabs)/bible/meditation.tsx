import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBible } from '@/context/EnhancedBibleContext';

export default function BibleMeditationScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { dailyVerse, incrementMeditation } = useBible();

  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0); // Temps écoulé en secondes
  const [thoughts, setThoughts] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Gestion du minuteur
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, seconds]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSave = () => {
    if (thoughts.trim().length === 0 && seconds < 30) {
      Alert.alert('Méditation courte', 'Prenez au moins quelques instants pour méditer ou écrire une pensée.');
      return;
    }
    
    // Ici on pourrait sauvegarder dans une base de données
    incrementMeditation(); // Met à jour les stats
    
    Alert.alert(
      'Méditation enregistrée', 
      'Votre moment avec Dieu a été enregistré. Continuez ainsi !',
      [{ text: 'Amen', onPress: () => router.back() }]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        
        <ScrollView contentContainerStyle={styles.content}>
          
          {/* Carte Verset */}
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.verseHeader}>
              <MaterialCommunityIcons name="book-open-page-variant" size={20} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>Verset de réflexion</Text>
            </View>
            <Text style={[styles.verseText, { color: theme.colors.text }]}>
              "{dailyVerse?.verse || "L'Éternel est mon berger : je ne manquerai de rien."}"
            </Text>
            <Text style={[styles.verseRef, { color: theme.colors.placeholder }]}>
              — {dailyVerse?.reference || "Psaumes 23:1"}
            </Text>
          </View>

          {/* Minuteur */}
          <View style={styles.timerContainer}>
            <Text style={[styles.timerText, { color: theme.colors.text }]}>{formatTime(seconds)}</Text>
            <View style={styles.timerControls}>
              <TouchableOpacity 
                style={[styles.controlButton, { backgroundColor: theme.colors.surface }]} 
                onPress={resetTimer}
              >
                <Feather name="rotate-ccw" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.playButton, { backgroundColor: theme.colors.primary }]} 
                onPress={toggleTimer}
              >
                <Feather name={isActive ? "pause" : "play"} size={32} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.timerHint, { color: theme.colors.placeholder }]}>
              {isActive ? "Prenez ce temps pour écouter Dieu..." : "Lancez le minuteur pour vous concentrer"}
            </Text>
          </View>

          {/* Zone Journal */}
          <View style={[styles.journalContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.journalLabel, { color: theme.colors.text }]}>Mes pensées & prières</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
              multiline
              placeholder="Qu'est-ce que ce verset vous inspire aujourd'hui ?"
              placeholderTextColor={theme.colors.placeholder}
              value={thoughts}
              onChangeText={setThoughts}
              textAlignVertical="top"
            />
          </View>

          {/* Bouton Action */}
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Terminer la méditation</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    textTransform: 'uppercase',
  },
  verseText: {
    fontSize: 18,
    fontFamily: 'Nunito_600SemiBold',
    fontStyle: 'italic',
    lineHeight: 28,
    marginBottom: 12,
  },
  verseRef: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'right',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerText: {
    fontSize: 48,
    fontFamily: 'Nunito_800ExtraBold',
    fontVariant: ['tabular-nums'],
    marginBottom: 20,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 12,
  },
  controlButton: {
    padding: 12,
    borderRadius: 50,
    elevation: 1,
  },
  playButton: {
    padding: 20,
    borderRadius: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  timerHint: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
  },
  journalContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  journalLabel: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 12,
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
});
