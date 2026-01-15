// app/(tabs)/bible/meditation-selection.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useBible } from '@/context/EnhancedBibleContext';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function MeditationSelection() {
  const router = useRouter();
  const theme = useAppTheme();
  const { bibleBooks } = useBible();

  const [step, setStep] = useState<'book' | 'chapter'>('book');
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const handleBookSelect = (book: any) => {
      setSelectedBook(book);
      setStep('chapter');
  };

  const handleChapterSelect = (chapter: number) => {
      // Naviguer vers la sélection de musique
      router.push({
          pathname: '/bible/meditation-music-selection',
          params: {
              book: selectedBook.id.toUpperCase(), // Convertir en OSIS code (GEN, MAT, etc.)
              bookName: selectedBook.name, // Nom français du livre
              chapter: chapter,
              verse: 1
          }
      });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
        
        <View style={[styles.header, { borderBottomColor: theme.colors.outline + '20' }]}>
            <TouchableOpacity onPress={() => step === 'chapter' ? setStep('book') : router.back()} style={styles.backBtn}>
                <Feather name="arrow-left" size={24} color={theme.colors.onBackground} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.onBackground }]}>
                {step === 'book' ? 'Choisir un Livre' : `Chapitre de ${selectedBook.name}`}
            </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
            {step === 'book' ? (
                bibleBooks.map((book) => (
                    <TouchableOpacity 
                        key={book.id} 
                        style={[styles.item, { borderBottomColor: theme.colors.outline + '10' }]}
                        onPress={() => handleBookSelect(book)}
                    >
                        <Text style={[styles.itemName, { color: theme.colors.onBackground }]}>{book.name}</Text>
                        <Feather name="chevron-right" size={20} color={theme.colors.outline} />
                    </TouchableOpacity>
                ))
            ) : (
                <View style={styles.grid}>
                    {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => (
                        <TouchableOpacity 
                            key={ch} 
                            style={[styles.chapterBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline + '30' }]}
                            onPress={() => handleChapterSelect(ch)}
                        >
                            <Text style={[styles.chapterNum, { color: theme.colors.primary }]}>{ch}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
  },
  backBtn: { padding: 8, marginRight: 8 },
  title: { fontSize: 18, fontFamily: 'Nunito_700Bold' },
  content: { padding: 16 },
  
  item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
  },
  itemName: { fontSize: 16, fontFamily: 'Nunito_600SemiBold' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chapterBox: {
      width: 60, height: 60,
      justifyContent: 'center', alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
  },
  chapterNum: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold' }
});
