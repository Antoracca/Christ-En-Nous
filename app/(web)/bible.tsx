// app/(web)/bible.tsx
// Version WEB de la Bible - Utilise le même EnhancedBibleContext

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useBible } from '@/context/EnhancedBibleContext';

export default function WebBibleScreen() {
  const router = useRouter();
  const {
    currentChapter,
    currentBook,
    currentVersion,
    loading,
    navigateToChapter,
  } = useBible();

  const [selectedBook, setSelectedBook] = useState<string>('GEN');

  const handleGoBack = () => {
    router.back();
  };

  // Liste simplifiée des livres pour le web
  const books = [
    { code: 'GEN', name: 'Genèse' },
    { code: 'EXO', name: 'Exode' },
    { code: 'LEV', name: 'Lévitique' },
    { code: 'NUM', name: 'Nombres' },
    { code: 'DEU', name: 'Deutéronome' },
    { code: 'JOS', name: 'Josué' },
    { code: 'MAT', name: 'Matthieu' },
    { code: 'MAR', name: 'Marc' },
    { code: 'LUK', name: 'Luc' },
    { code: 'JHN', name: 'Jean' },
    { code: 'ACT', name: 'Actes' },
    { code: 'ROM', name: 'Romains' },
  ];

  const renderVerses = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      );
    }

    if (!currentChapter || !currentChapter.verses || currentChapter.verses.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Sélectionnez un livre et un chapitre pour commencer la lecture
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.versesContainer}>
        {currentChapter.verses.map((verse) => (
          <View key={verse.number} style={styles.verseRow}>
            <Text style={styles.verseNumber}>{verse.number}</Text>
            <Text style={styles.verseText}>{verse.text}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentBook || 'Bible'} - Chapitre {currentChapter?.chapter || 1}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>Livres</Text>
          <ScrollView style={styles.booksList}>
            {books.map((book) => (
              <TouchableOpacity
                key={book.code}
                style={[
                  styles.bookItem,
                  currentBook === book.code && styles.bookItemActive,
                ]}
                onPress={() => {
                  setSelectedBook(book.code);
                  navigateToChapter({
                    book: book.code,
                    chapter: 1,
                    end: undefined,
                  });
                }}
              >
                <Text
                  style={[
                    styles.bookText,
                    currentBook === book.code && styles.bookTextActive,
                  ]}
                >
                  {book.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          <View style={styles.chapterSelector}>
            <Text style={styles.chapterLabel}>Chapitre:</Text>
            <View style={styles.chapterButtons}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => {
                  if (currentChapter && currentChapter.chapter > 1) {
                    navigateToChapter({
                      book: currentBook || 'GEN',
                      chapter: currentChapter.chapter - 1,
                      end: undefined,
                    });
                  }
                }}
              >
                <Text style={styles.navButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.chapterNumber}>
                {currentChapter?.chapter || 1}
              </Text>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => {
                  if (currentChapter) {
                    navigateToChapter({
                      book: currentBook || 'GEN',
                      chapter: currentChapter.chapter + 1,
                      end: undefined,
                    });
                  }
                }}
              >
                <Text style={styles.navButtonText}>→</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.reader}>{renderVerses()}</ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    padding: 16,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  booksList: {
    flex: 1,
  },
  bookItem: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  bookItemActive: {
    backgroundColor: '#007AFF',
  },
  bookText: {
    fontSize: 14,
    color: '#333',
  },
  bookTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  main: {
    flex: 1,
    padding: 24,
  },
  chapterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  chapterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chapterButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  chapterNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    minWidth: 40,
    textAlign: 'center',
  },
  reader: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
  },
  versesContainer: {
    gap: 12,
  },
  verseRow: {
    flexDirection: 'row',
    gap: 12,
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#007AFF',
    minWidth: 30,
  },
  verseText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
