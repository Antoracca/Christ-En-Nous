// app/services/bible/meditationProgressService.ts
// Service de progression et historique pour la méditation biblique

import { firebaseSyncService } from '../firebase/firebaseSyncService';
import { BibleReferenceUtils, BibleNavigationUtils } from './utils/helpers';
import { BIBLE_BOOKS } from './utils/constants';
import { BibleReference } from './types';

// ==================== TYPES ====================

/** Session active de méditation */
export interface MeditationSession {
  id: string;
  book: string; // Code OSIS (GEN, MAT, etc.)
  chapter: number;
  startVerse: number;
  currentVerse: number; // Position actuelle
  versesRead: number[]; // Liste des versets lus dans cette session
  totalVerses: number; // Nombre total de versets dans le chapitre

  startTime: string; // ISO timestamp
  lastUpdateTime: string; // ISO timestamp

  ambience?: string;
  notes: VerseNote[]; // Notes prises pendant cette session

  isCompleted: boolean; // Chapitre terminé ?
  version?: string; // Version de la Bible utilisée
}

/** Note sur un verset spécifique */
export interface VerseNote {
  verse: number;
  note: string;
  timestamp: string;
}

/** Historique d'une session terminée */
export interface MeditationHistory {
  id: string;
  book: string;
  bookName: string; // Nom français du livre
  chapter: number;
  versesRead: number[]; // Versets lus
  totalVerses: number;

  startTime: string;
  endTime: string;
  durationSeconds: number;

  notes: VerseNote[];
  ambience?: string;
  version?: string;

  isChapterCompleted: boolean; // Tout le chapitre a été lu ?
}

/** Progression d'un livre */
export interface BookProgress {
  book: string; // Code OSIS
  bookName: string;
  totalChapters: number;

  chaptersRead: number[]; // Chapitres complétés
  lastChapterRead: number;
  lastVerseRead: number;

  startedAt: string; // Première méditation dans ce livre
  lastReadAt: string; // Dernière méditation

  isCompleted: boolean; // Tout le livre terminé
  completedAt?: string;

  totalVersesRead: number;
  totalTimeSeconds: number;
}

/** État global de la méditation */
export interface MeditationProgressState {
  // Session active
  activeSession: MeditationSession | null;

  // Progression par livre
  bookProgress: Record<string, BookProgress>; // book -> progress

  // Historique complet (les 100 dernières sessions)
  history: MeditationHistory[];

  // Statistiques
  stats: {
    totalSessions: number;
    totalBooksCompleted: number;
    totalChaptersRead: number;
    totalVersesRead: number;
    totalTimeSeconds: number;
    lastMeditationDate?: string;
  };
}

// ==================== SERVICE ====================

export class MeditationProgressService {
  private readonly COLLECTION = 'meditationProgress';
  private readonly MAX_HISTORY = 100; // Garder les 100 dernières sessions

  /**
   * Récupérer l'état complet de progression
   * @param forceRemote - Si true, ignore le cache et lit directement depuis Firebase
   */
  async getProgressState(userId: string, forceRemote: boolean = false): Promise<MeditationProgressState> {
    try {
      const state = await firebaseSyncService.syncRead<MeditationProgressState>(
        userId,
        this.COLLECTION,
        'state',
        this.getDefaultState(),
        { forceRemote } // ✅ Permet de forcer la lecture depuis Firebase
      );
      return state || this.getDefaultState();
    } catch (error) {
      console.error('Failed to get meditation progress:', error);
      return this.getDefaultState();
    }
  }

  /**
   * Démarrer une nouvelle session de méditation
   */
  async startMeditationSession(
    userId: string,
    book: string,
    chapter: number,
    startVerse: number,
    totalVerses: number,
    version?: string,
    ambience?: string
  ): Promise<MeditationSession> {
    try {
      const state = await this.getProgressState(userId);

      // Sauvegarder la session précédente si elle existe
      if (state.activeSession && !state.activeSession.isCompleted) {
        await this.pauseSession(userId);
      }

      // Créer nouvelle session
      const now = new Date().toISOString();
      const newSession: MeditationSession = {
        id: `session_${Date.now()}`,
        book,
        chapter,
        startVerse,
        currentVerse: startVerse,
        versesRead: [startVerse],
        totalVerses,
        startTime: now,
        lastUpdateTime: now,
        notes: [],
        isCompleted: false,
        ...(ambience && { ambience }),
        ...(version && { version })
      };

      state.activeSession = newSession;

      await this.saveState(userId, state);

      console.log(`📖 Méditation démarrée: ${book} ${chapter} (verset ${startVerse})`);
      return newSession;
    } catch (error) {
      console.error('Failed to start meditation session:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour la position actuelle (verset lu)
   * Marque TOUS les versets de 1 jusqu'au verset actuel comme lus
   */
  async updateCurrentVerse(userId: string, verse: number): Promise<void> {
    try {
      const state = await this.getProgressState(userId);

      if (!state.activeSession) {
        console.warn('No active meditation session');
        return;
      }

      state.activeSession.currentVerse = verse;

      // Marquer tous les versets de 1 jusqu'au verset actuel comme lus
      // Cela garantit que si l'utilisateur navigue jusqu'au verset 31, tous les versets 1-31 sont comptés
      for (let v = 1; v <= verse; v++) {
        if (!state.activeSession.versesRead.includes(v)) {
          state.activeSession.versesRead.push(v);
        }
      }

      // Trier la liste pour cohérence
      state.activeSession.versesRead.sort((a, b) => a - b);

      state.activeSession.lastUpdateTime = new Date().toISOString();

      // Sauvegarder immédiatement pour éviter les pertes de données
      await this.saveState(userId, state, { immediate: true });
    } catch (error) {
      console.error('Failed to update current verse:', error);
    }
  }

  /**
   * Ajouter une note sur un verset
   */
  async addNote(userId: string, verse: number, note: string): Promise<void> {
    try {
      const state = await this.getProgressState(userId);

      if (!state.activeSession) {
        console.warn('No active meditation session');
        return;
      }

      const verseNote: VerseNote = {
        verse,
        note,
        timestamp: new Date().toISOString()
      };

      state.activeSession.notes.push(verseNote);
      state.activeSession.lastUpdateTime = new Date().toISOString();

      await this.saveState(userId, state, { immediate: true });

      console.log(`📝 Note ajoutée: ${state.activeSession.book} ${state.activeSession.chapter}:${verse}`);
    } catch (error) {
      console.error('Failed to add note:', error);
      throw error;
    }
  }

  /**
   * Terminer le chapitre actuel et passer au suivant (ou terminer)
   */
  async completeChapter(userId: string): Promise<{
    nextChapter?: number;
    isBookCompleted: boolean;
    nextBook?: string;
  }> {
    try {
      const state = await this.getProgressState(userId);

      if (!state.activeSession) {
        throw new Error('No active meditation session');
      }

      const session = state.activeSession;
      session.isCompleted = true;

      const endTime = new Date().toISOString();
      const durationSeconds = Math.floor(
        (new Date(endTime).getTime() - new Date(session.startTime).getTime()) / 1000
      );

      // Ajouter à l'historique
      const historyEntry: MeditationHistory = {
        id: session.id,
        book: session.book,
        bookName: this.getBookName(session.book),
        chapter: session.chapter,
        versesRead: session.versesRead,
        totalVerses: session.totalVerses,
        startTime: session.startTime,
        endTime,
        durationSeconds,
        notes: session.notes,
        isChapterCompleted: session.versesRead.length >= session.totalVerses,
        ...(session.ambience && { ambience: session.ambience }),
        ...(session.version && { version: session.version })
      };

      state.history.unshift(historyEntry); // Ajouter au début
      if (state.history.length > this.MAX_HISTORY) {
        state.history = state.history.slice(0, this.MAX_HISTORY);
      }

      // Mettre à jour la progression du livre
      const bookProgress = await this.updateBookProgress(state, session, durationSeconds);

      // Statistiques globales
      state.stats.totalSessions++;
      state.stats.totalChaptersRead++;
      state.stats.totalVersesRead += session.versesRead.length;
      state.stats.totalTimeSeconds += durationSeconds;
      state.stats.lastMeditationDate = endTime;

      // Réinitialiser la session active
      state.activeSession = null;

      await this.saveState(userId, state, { immediate: true });

      // Déterminer la suite
      const book = BIBLE_BOOKS.find(b => b.name === session.book);
      const isBookCompleted = bookProgress.isCompleted;

      let result: { nextChapter?: number; isBookCompleted: boolean; nextBook?: string } = {
        isBookCompleted
      };

      if (isBookCompleted) {
        // Proposer le livre suivant
        const nextBookInfo = this.getNextBook(session.book);
        if (nextBookInfo) {
          result.nextBook = nextBookInfo.name;
        }
      } else {
        // Proposer le chapitre suivant dans le même livre
        if (book && session.chapter < book.chapters) {
          result.nextChapter = session.chapter + 1;
        }
      }

      console.log(`✅ Chapitre terminé: ${session.book} ${session.chapter}`);
      return result;
    } catch (error) {
      console.error('Failed to complete chapter:', error);
      throw error;
    }
  }

  /**
   * Mettre en pause (sauvegarder sans terminer)
   */
  async pauseSession(userId: string): Promise<void> {
    try {
      const state = await this.getProgressState(userId);

      if (!state.activeSession) {
        return;
      }

      const session = state.activeSession;
      const endTime = new Date().toISOString();
      const durationSeconds = Math.floor(
        (new Date(endTime).getTime() - new Date(session.startTime).getTime()) / 1000
      );

      // Sauvegarder dans l'historique comme session incomplète
      const historyEntry: MeditationHistory = {
        id: session.id,
        book: session.book,
        bookName: this.getBookName(session.book),
        chapter: session.chapter,
        versesRead: session.versesRead,
        totalVerses: session.totalVerses,
        startTime: session.startTime,
        endTime,
        durationSeconds,
        notes: session.notes,
        isChapterCompleted: false,
        ...(session.ambience && { ambience: session.ambience }),
        ...(session.version && { version: session.version })
      };

      state.history.unshift(historyEntry);
      if (state.history.length > this.MAX_HISTORY) {
        state.history = state.history.slice(0, this.MAX_HISTORY);
      }

      // Mettre à jour progression partielle
      await this.updateBookProgress(state, session, durationSeconds);

      // Stats
      state.stats.totalSessions++;
      state.stats.totalVersesRead += session.versesRead.length;
      state.stats.totalTimeSeconds += durationSeconds;
      state.stats.lastMeditationDate = endTime;

      state.activeSession = null;

      await this.saveState(userId, state);

      console.log(`⏸️ Session mise en pause: ${session.book} ${session.chapter}`);
    } catch (error) {
      console.error('Failed to pause session:', error);
    }
  }

  /**
   * Obtenir la progression d'un livre spécifique
   */
  async getBookProgress(userId: string, book: string): Promise<BookProgress | null> {
    try {
      const state = await this.getProgressState(userId);
      return state.bookProgress[book] || null;
    } catch (error) {
      console.error('Failed to get book progress:', error);
      return null;
    }
  }

  /**
   * Obtenir tous les livres en cours (non terminés)
   */
  async getIncompleteBooks(userId: string): Promise<BookProgress[]> {
    try {
      const state = await this.getProgressState(userId);
      return Object.values(state.bookProgress)
        .filter(p => !p.isCompleted)
        .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime());
    } catch (error) {
      console.error('Failed to get incomplete books:', error);
      return [];
    }
  }

  /**
   * Obtenir l'historique complet
   */
  async getHistory(userId: string, limit?: number): Promise<MeditationHistory[]> {
    try {
      const state = await this.getProgressState(userId);
      return limit ? state.history.slice(0, limit) : state.history;
    } catch (error) {
      console.error('Failed to get history:', error);
      return [];
    }
  }

  /**
   * Obtenir les statistiques
   */
  async getStats(userId: string) {
    try {
      const state = await this.getProgressState(userId);
      return state.stats;
    } catch (error) {
      console.error('Failed to get stats:', error);
      return this.getDefaultState().stats;
    }
  }

  /**
   * Supprimer une note d'une session d'historique
   */
  async deleteNote(userId: string, sessionId: string, verse: number, timestamp: string): Promise<void> {
    try {
      const state = await this.getProgressState(userId);

      // Trouver la session dans l'historique
      const sessionIndex = state.history.findIndex(h => h.id === sessionId);
      if (sessionIndex === -1) {
        console.warn(`Session not found: ${sessionId}`);
        return;
      }

      // Filtrer la note spécifique
      const session = state.history[sessionIndex];
      session.notes = session.notes.filter(
        n => !(n.verse === verse && n.timestamp === timestamp)
      );

      // Sauvegarder l'état mis à jour
      await this.saveState(userId, state, { immediate: true });

      console.log(`🗑️ Note supprimée: ${sessionId}, verset ${verse}`);
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  }

  // ==================== HELPERS PRIVÉS ====================

  private async updateBookProgress(
    state: MeditationProgressState,
    session: MeditationSession,
    durationSeconds: number
  ): Promise<BookProgress> {
    const book = BIBLE_BOOKS.find(b => b.name === session.book);
    if (!book) {
      throw new Error(`Book not found: ${session.book}`);
    }

    let bookProgress = state.bookProgress[session.book];

    if (!bookProgress) {
      // Initialiser la progression pour ce livre
      bookProgress = {
        book: session.book,
        bookName: this.getBookName(session.book),
        totalChapters: book.chapters,
        chaptersRead: [],
        lastChapterRead: session.chapter,
        lastVerseRead: session.currentVerse,
        startedAt: session.startTime,
        lastReadAt: new Date().toISOString(),
        isCompleted: false,
        totalVersesRead: 0,
        totalTimeSeconds: 0
      };
      state.bookProgress[session.book] = bookProgress;
    }

    // Ajouter le chapitre comme lu si complété
    if (session.isCompleted && !bookProgress.chaptersRead.includes(session.chapter)) {
      bookProgress.chaptersRead.push(session.chapter);
      bookProgress.chaptersRead.sort((a, b) => a - b);
    }

    // Si le chapitre est complété, avancer au chapitre suivant
    if (session.isCompleted && session.chapter < book.chapters) {
      // Passer au chapitre suivant
      bookProgress.lastChapterRead = session.chapter + 1;
      bookProgress.lastVerseRead = 1; // Commencer au verset 1
    } else if (session.isCompleted && session.chapter >= book.chapters) {
      // Dernier chapitre du livre complété, garder la position finale
      bookProgress.lastChapterRead = session.chapter;
      bookProgress.lastVerseRead = session.currentVerse;
    } else {
      // Session non complétée, garder la position actuelle
      bookProgress.lastChapterRead = session.chapter;
      bookProgress.lastVerseRead = session.currentVerse;
    }

    bookProgress.lastReadAt = new Date().toISOString();
    bookProgress.totalVersesRead += session.versesRead.length;
    bookProgress.totalTimeSeconds += durationSeconds;

    // Vérifier si le livre est complété
    if (bookProgress.chaptersRead.length === book.chapters) {
      bookProgress.isCompleted = true;
      bookProgress.completedAt = new Date().toISOString();
      state.stats.totalBooksCompleted++;

      console.log(`🎉 Livre complété: ${session.book} (${book.frenchName})`);
    }

    return bookProgress;
  }

  private getBookName(osisCode: string): string {
    const book = BIBLE_BOOKS.find(b => b.name === osisCode);
    return book?.frenchName || osisCode;
  }

  private getNextBook(currentBook: string): typeof BIBLE_BOOKS[0] | null {
    const currentIndex = BIBLE_BOOKS.findIndex(b => b.name === currentBook);
    if (currentIndex === -1 || currentIndex === BIBLE_BOOKS.length - 1) {
      return null;
    }
    return BIBLE_BOOKS[currentIndex + 1];
  }

  private getDefaultState(): MeditationProgressState {
    return {
      activeSession: null,
      bookProgress: {},
      history: [],
      stats: {
        totalSessions: 0,
        totalBooksCompleted: 0,
        totalChaptersRead: 0,
        totalVersesRead: 0,
        totalTimeSeconds: 0
      }
    };
  }

  private async saveState(
    userId: string,
    state: MeditationProgressState,
    options?: { immediate?: boolean }
  ): Promise<void> {
    await firebaseSyncService.syncWrite(
      userId,
      this.COLLECTION,
      'state',
      state,
      { immediate: options?.immediate || false, merge: false }
    );
  }
}

export const meditationProgressService = new MeditationProgressService();
