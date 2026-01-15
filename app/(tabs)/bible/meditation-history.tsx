// app/(tabs)/bible/meditation-history.tsx
// Historique des méditations et progression par livre

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  meditationProgressService,
  MeditationHistory,
  BookProgress
} from '@/services/bible/meditationProgressService';
import { firebaseSyncService } from '@/services/firebase/firebaseSyncService';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

type TabType = 'recents' | 'incomplete' | 'completed' | 'notes';

export default function MeditationHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { userProfile } = useAuth();
  const { toast, success, error, loading: showLoading, hideToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('recents');
  const [loading, setLoading] = useState(true);

  const [history, setHistory] = useState<MeditationHistory[]>([]);
  const [incompleteBooks, setIncompleteBooks] = useState<BookProgress[]>([]);
  const [completedBooks, setCompletedBooks] = useState<BookProgress[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Structure groupée pour les notes: book -> chapter -> verse -> notes[]
  interface GroupedNote {
    book: string;
    bookName: string;
    chapter: number;
    verse: number;
    notes: Array<{ id: string; note: string; timestamp: string; sessionId: string }>;
  }
  const [groupedNotes, setGroupedNotes] = useState<GroupedNote[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (forceRefresh: boolean = false) => {
    if (!userProfile?.uid) {
      setLoading(false);
      return;
    }

    try {
      // Afficher un message de chargement si refresh manuel
      if (forceRefresh) {
        showLoading('Actualisation en cours...');
      }

      setLoading(true);

      // Si forceRefresh, VIDER le cache d'abord
      if (forceRefresh) {
        console.log('🗑️ Vidage du cache en cours...');
        await firebaseSyncService.clearUserCache(userProfile.uid);
        console.log('✅ Cache vidé avec succès!');
      }

      // Maintenant charger depuis Firebase (qui mettra à jour le cache)
      const progressState = await meditationProgressService.getProgressState(userProfile.uid, true);

      const [historyData, statsData] = await Promise.all([
        meditationProgressService.getHistory(userProfile.uid, 50),
        meditationProgressService.getStats(userProfile.uid)
      ]);

      setHistory(historyData);
      setStats(statsData);

      // Séparer les livres complétés et incomplets
      const allBooks = Object.values(progressState.bookProgress);
      setIncompleteBooks(allBooks.filter(b => !b.isCompleted));
      setCompletedBooks(allBooks.filter(b => b.isCompleted));

      // Grouper les notes par livre/chapitre/verset
      const notesMap = new Map<string, GroupedNote>();

      historyData.forEach((session) => {
        if (session.notes && session.notes.length > 0) {
          session.notes.forEach((verseNote) => {
            const key = `${session.book}-${session.chapter}-${verseNote.verse}`;

            if (!notesMap.has(key)) {
              notesMap.set(key, {
                book: session.book,
                bookName: session.bookName,
                chapter: session.chapter,
                verse: verseNote.verse,
                notes: []
              });
            }

            notesMap.get(key)!.notes.push({
              id: `${session.id}-${verseNote.verse}-${verseNote.timestamp}`,
              note: verseNote.note,
              timestamp: verseNote.timestamp,
              sessionId: session.id
            });
          });
        }
      });

      // Convertir en tableau et trier
      const notesArray = Array.from(notesMap.values()).sort((a, b) => {
        // Trier par livre, puis chapitre, puis verset
        if (a.book !== b.book) return a.book.localeCompare(b.book);
        if (a.chapter !== b.chapter) return a.chapter - b.chapter;
        return a.verse - b.verse;
      });

      setGroupedNotes(notesArray);

      // Si c'est un refresh, notifier l'utilisateur avec un message sympa
      if (forceRefresh) {
        hideToast(); // Cacher le loading
        success('Tout est à jour !');
      }
    } catch (e) {
      console.error('Failed to load meditation history:', e);
      hideToast();
      error('Impossible de charger vos données');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeBook = (bookProgress: BookProgress) => {
    Alert.alert(
      'Reprendre la méditation',
      `${bookProgress.bookName}\nChapitre ${bookProgress.lastChapterRead}, verset ${bookProgress.lastVerseRead}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Reprendre',
          onPress: () => {
            router.push({
              pathname: '/bible/meditation-player',
              params: {
                book: bookProgress.book,
                chapter: bookProgress.lastChapterRead,
                verse: bookProgress.lastVerseRead,
                ambience: 'piano'
              }
            });
          }
        }
      ]
    );
  };

  const handleDeleteNote = (sessionId: string, verse: number, timestamp: string, noteId: string) => {
    Alert.alert(
      'Supprimer cette note ?',
      'Cette action est irréversible',
      [
        { text: 'Non, garder', style: 'cancel' },
        {
          text: 'Oui, supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!userProfile?.uid) return;

              showLoading('Suppression...');

              await meditationProgressService.deleteNote(userProfile.uid, sessionId, verse, timestamp);

              // Recharger les données pour mettre à jour l'affichage
              await loadData();

              hideToast();
              success('Note supprimée');
            } catch (err) {
              console.error('Failed to delete note:', err);
              hideToast();
              error('Impossible de supprimer cette note');
            }
          }
        }
      ]
    );
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes > 0 ? remainingMinutes + 'min' : ''}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
          Chargement de l'historique...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />

      {/* Toast personnalisé */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
          Historique
        </Text>
        <TouchableOpacity
          onPress={() => loadData(true)}
          style={styles.refreshBtn}
          disabled={loading}
        >
          <Feather
            name="refresh-cw"
            size={20}
            color={loading ? theme.colors.outline : theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* STATS CARD */}
      {stats && (
        <View style={[styles.statsCard, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary + '30' }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.totalSessions}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.totalBooksCompleted}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Livres</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.totalChaptersRead}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Chapitres</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {formatDuration(stats.totalTimeSeconds)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Temps</Text>
          </View>
        </View>
      )}

      {/* TABS */}
      <View style={[styles.tabBar, { borderBottomColor: theme.colors.outline + '20' }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recents' && { borderBottomColor: theme.colors.primary }]}
          onPress={() => setActiveTab('recents')}
        >
          <Feather name="clock" size={18} color={activeTab === 'recents' ? theme.colors.primary : theme.colors.outline} />
          <Text style={[styles.tabText, { color: activeTab === 'recents' ? theme.colors.primary : theme.colors.outline }]}>
            Récents
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'incomplete' && { borderBottomColor: theme.colors.primary }]}
          onPress={() => setActiveTab('incomplete')}
        >
          <Feather name="book-open" size={18} color={activeTab === 'incomplete' ? theme.colors.primary : theme.colors.outline} />
          <Text style={[styles.tabText, { color: activeTab === 'incomplete' ? theme.colors.primary : theme.colors.outline }]}>
            En cours ({incompleteBooks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && { borderBottomColor: theme.colors.primary }]}
          onPress={() => setActiveTab('completed')}
        >
          <Feather name="check-circle" size={18} color={activeTab === 'completed' ? theme.colors.primary : theme.colors.outline} />
          <Text style={[styles.tabText, { color: activeTab === 'completed' ? theme.colors.primary : theme.colors.outline }]}>
            Complétés ({completedBooks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'notes' && { borderBottomColor: theme.colors.primary }]}
          onPress={() => setActiveTab('notes')}
        >
          <Feather name="edit-3" size={18} color={activeTab === 'notes' ? theme.colors.primary : theme.colors.outline} />
          <Text style={[styles.tabText, { color: activeTab === 'notes' ? theme.colors.primary : theme.colors.outline }]}>
            Notes ({groupedNotes.reduce((acc, gn) => acc + gn.notes.length, 0)})
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {activeTab === 'recents' && (
          <View>
            {history.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="book" size={48} color={theme.colors.outline} />
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  Aucune méditation pour le moment
                </Text>
              </View>
            ) : (
              history.map((item) => (
                <View key={item.id} style={[styles.historyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline + '20' }]}>
                  <View style={styles.historyHeader}>
                    <View style={styles.historyTitleRow}>
                      <MaterialCommunityIcons
                        name="book-open-page-variant"
                        size={20}
                        color={theme.colors.primary}
                      />
                      <Text style={[styles.historyTitle, { color: theme.colors.onSurface }]}>
                        {item.bookName} {item.chapter}
                      </Text>
                      {item.isChapterCompleted && (
                        <Feather name="check-circle" size={16} color="#4CAF50" />
                      )}
                    </View>
                    <Text style={[styles.historyDate, { color: theme.colors.onSurfaceVariant }]}>
                      {formatDate(item.endTime)}
                    </Text>
                  </View>

                  <View style={styles.historyDetails}>
                    <View style={styles.historyDetail}>
                      <Feather name="list" size={14} color={theme.colors.outline} />
                      <Text style={[styles.historyDetailText, { color: theme.colors.onSurfaceVariant }]}>
                        {item.versesRead.length}/{item.totalVerses} versets
                      </Text>
                    </View>
                    <View style={styles.historyDetail}>
                      <Feather name="clock" size={14} color={theme.colors.outline} />
                      <Text style={[styles.historyDetailText, { color: theme.colors.onSurfaceVariant }]}>
                        {formatDuration(item.durationSeconds)}
                      </Text>
                    </View>
                    {item.notes.length > 0 && (
                      <View style={styles.historyDetail}>
                        <Feather name="edit-3" size={14} color={theme.colors.outline} />
                        <Text style={[styles.historyDetailText, { color: theme.colors.onSurfaceVariant }]}>
                          {item.notes.length} note{item.notes.length > 1 ? 's' : ''}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'incomplete' && (
          <View>
            {incompleteBooks.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="book-open" size={48} color={theme.colors.outline} />
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  Aucun livre en cours
                </Text>
              </View>
            ) : (
              incompleteBooks.map((book) => (
                <View
                  key={book.book}
                  style={[styles.bookCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline + '20' }]}
                >
                  <TouchableOpacity onPress={() => handleResumeBook(book)}>
                    <View style={styles.bookHeader}>
                      <View style={styles.bookTitleRow}>
                        <MaterialCommunityIcons name="book-open-variant" size={24} color={theme.colors.primary} />
                        <Text style={[styles.bookTitle, { color: theme.colors.onSurface }]}>
                          {book.bookName}
                        </Text>
                      </View>
                      <Feather name="play-circle" size={20} color={theme.colors.primary} />
                    </View>

                    <View style={styles.bookProgress}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              backgroundColor: theme.colors.primary,
                              width: `${(book.chaptersRead.length / book.totalChapters) * 100}%`
                            }
                          ]}
                        />
                      </View>
                      <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
                        {book.chaptersRead.length}/{book.totalChapters} chapitres • {Math.round((book.chaptersRead.length / book.totalChapters) * 100)}% complété
                      </Text>
                    </View>

                    <View style={styles.bookCurrentStatus}>
                      <View style={[styles.statusBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                        <Feather name="book-open" size={14} color={theme.colors.primary} />
                        <Text style={[styles.statusBadgeText, { color: theme.colors.primary }]}>
                          En cours: Chapitre {book.lastChapterRead}, verset {book.lastVerseRead}
                        </Text>
                      </View>
                      <Text style={[styles.bookLastRead, { color: theme.colors.outline }]}>
                        Dernière méditation: {formatDate(book.lastReadAt)}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Progression détaillée des chapitres */}
                  {book.chaptersRead.length > 0 && (
                    <View style={[styles.chaptersDetail, { borderTopColor: theme.colors.outline + '20' }]}>
                      <Text style={[styles.chaptersDetailTitle, { color: theme.colors.onSurfaceVariant }]}>
                        Chapitres complétés ({book.chaptersRead.length})
                      </Text>
                      <View style={styles.chaptersGrid}>
                        {Array.from({ length: book.totalChapters }, (_, i) => i + 1).map((chapterNum) => {
                          const isCompleted = book.chaptersRead.includes(chapterNum);
                          const isCurrent = chapterNum === book.lastChapterRead;

                          return (
                            <View
                              key={chapterNum}
                              style={[
                                styles.chapterBubble,
                                isCompleted && { backgroundColor: '#4CAF50' },
                                isCurrent && { backgroundColor: theme.colors.primary },
                                !isCompleted && !isCurrent && { backgroundColor: theme.colors.outline + '20' }
                              ]}
                            >
                              <Text
                                style={[
                                  styles.chapterBubbleText,
                                  isCompleted || isCurrent ? { color: '#FFF' } : { color: theme.colors.outline }
                                ]}
                              >
                                {chapterNum}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                      <View style={styles.chaptersLegend}>
                        <View style={styles.legendItem}>
                          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                          <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>Complété</Text>
                        </View>
                        <View style={styles.legendItem}>
                          <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
                          <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>En cours</Text>
                        </View>
                        <View style={styles.legendItem}>
                          <View style={[styles.legendDot, { backgroundColor: theme.colors.outline + '20' }]} />
                          <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>Non commencé</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'completed' && (
          <View>
            {completedBooks.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="check-circle" size={48} color={theme.colors.outline} />
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  Aucun livre complété
                </Text>
              </View>
            ) : (
              completedBooks.map((book) => (
                <View
                  key={book.book}
                  style={[styles.bookCard, { backgroundColor: theme.colors.surface, borderColor: '#4CAF50' + '30' }]}
                >
                  <View style={styles.bookHeader}>
                    <View style={styles.bookTitleRow}>
                      <MaterialCommunityIcons name="book-check" size={24} color="#4CAF50" />
                      <Text style={[styles.bookTitle, { color: theme.colors.onSurface }]}>
                        {book.bookName}
                      </Text>
                      <Feather name="check-circle" size={18} color="#4CAF50" />
                    </View>
                  </View>

                  <View style={styles.bookDetails}>
                    <View style={styles.bookDetail}>
                      <Feather name="calendar" size={14} color={theme.colors.outline} />
                      <Text style={[styles.bookDetailText, { color: theme.colors.onSurfaceVariant }]}>
                        Complété {formatDate(book.completedAt!)}
                      </Text>
                    </View>
                    <View style={styles.bookDetail}>
                      <Feather name="clock" size={14} color={theme.colors.outline} />
                      <Text style={[styles.bookDetailText, { color: theme.colors.onSurfaceVariant }]}>
                        {formatDuration(book.totalTimeSeconds)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'notes' && (
          <View>
            {groupedNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="edit-3" size={48} color={theme.colors.outline} />
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  Aucune note pour le moment
                </Text>
              </View>
            ) : (
              groupedNotes.map((groupedNote, index) => (
                <View
                  key={`${groupedNote.book}-${groupedNote.chapter}-${groupedNote.verse}`}
                  style={[styles.noteGroupCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline + '20' }]}
                >
                  {/* Référence du verset */}
                  <View style={styles.noteGroupHeader}>
                    <View style={styles.noteGroupTitleRow}>
                      <MaterialCommunityIcons name="book-open-page-variant" size={20} color={theme.colors.primary} />
                      <Text style={[styles.noteGroupTitle, { color: theme.colors.onSurface }]}>
                        {groupedNote.bookName} {groupedNote.chapter}:{groupedNote.verse}
                      </Text>
                    </View>
                    <View style={[styles.noteBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Text style={[styles.noteBadgeText, { color: theme.colors.primary }]}>
                        {groupedNote.notes.length} note{groupedNote.notes.length > 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>

                  {/* Liste des notes pour ce verset */}
                  {groupedNote.notes.map((note, noteIndex) => (
                    <View
                      key={note.id}
                      style={[
                        styles.noteItem,
                        { backgroundColor: theme.colors.background },
                        noteIndex === groupedNote.notes.length - 1 && { marginBottom: 0 }
                      ]}
                    >
                      <View style={styles.noteContent}>
                        <Text style={[styles.noteText, { color: theme.colors.onBackground }]}>
                          "{note.note}"
                        </Text>
                        <Text style={[styles.noteTimestamp, { color: theme.colors.outline }]}>
                          {formatDate(note.timestamp)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteNote(note.sessionId, groupedNote.verse, note.timestamp, note.id)}
                      >
                        <Feather name="trash-2" size={18} color="#EF5350" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontFamily: 'Nunito_600SemiBold', fontSize: 14 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)'
  },
  backBtn: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  refreshBtn: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    letterSpacing: 0.5
  },

  statsCard: {
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 8
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Nunito_800ExtraBold'
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },

  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    paddingTop: 8,
    backgroundColor: 'transparent'
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 6,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    minHeight: 50
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    flexShrink: 1
  },

  content: {
    padding: 20,
    paddingBottom: 40
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold'
  },

  historyCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  historyTitle: { fontSize: 16, fontFamily: 'Nunito_700Bold' },
  historyDate: { fontSize: 12, fontFamily: 'Nunito_500Medium' },
  historyDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8
  },
  historyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  historyDetailText: { fontSize: 12, fontFamily: 'Nunito_500Medium' },
  notesPreview: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8
  },
  noteText: {
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    fontStyle: 'italic'
  },

  bookCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  bookTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  bookTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold' },
  bookProgress: {
    marginBottom: 8
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold'
  },
  bookCurrentStatus: {
    marginTop: 12
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6
  },
  statusBadgeText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold'
  },
  bookLastRead: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium'
  },
  bookDetails: {
    flexDirection: 'row',
    gap: 16
  },
  chaptersDetail: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1
  },
  chaptersDetailTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  chaptersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16
  },
  chapterBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  chapterBubbleText: {
    fontSize: 13,
    fontFamily: 'Nunito_800ExtraBold'
  },
  chaptersLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1
  },
  legendText: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold'
  },
  bookDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  bookDetailText: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium'
  },

  // Styles pour l'onglet Notes
  noteGroupCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  noteGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  noteGroupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  noteGroupTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold'
  },
  noteBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  noteBadgeText: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold'
  },
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12
  },
  noteContent: {
    flex: 1,
    marginRight: 12
  },
  noteText: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 6
  },
  noteTimestamp: {
    fontSize: 11,
    fontFamily: 'Nunito_500Medium'
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: 'rgba(239, 83, 80, 0.1)',
    borderRadius: 8
  }
});
