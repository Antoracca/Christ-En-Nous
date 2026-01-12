// app/services/bible/storage/firebaseBibleStorage.ts
// Service de stockage Bible avec Firebase - Remplace AsyncStorage pour sync cross-device

import { firebaseSyncService } from '../../firebase/firebaseSyncService';
import {
  BibleBookmark,
  VerseHighlight,
  BibleSettings,
  ReadingProgress,
  SyncStatus,
  LastReadingPosition
} from '../types';
import { DEFAULT_SETTINGS, ERROR_MESSAGES } from '../utils/constants';

/**
 * Service de stockage Bible avec Firebase
 * Stratégie: Cache local + sync intelligente vers Firestore
 */
export class FirebaseBibleStorageService {
  private userId: string;
  private syncQueue: {
    type: 'bookmark' | 'highlight' | 'progress' | 'settings';
    action: 'create' | 'update' | 'delete';
    data: any;
    timestamp: string;
  }[] = [];

  // Collections Firebase
  private readonly COLLECTIONS = {
    BOOKMARKS: 'bibleBookmarks',
    HIGHLIGHTS: 'bibleHighlights',
    SETTINGS: 'bibleSettings',
    PROGRESS: 'bibleProgress',
    LAST_POSITION: 'bibleLastPosition',
  };

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Initialise le stockage
   */
  async initialize(): Promise<void> {
    try {
      console.log('✅ Firebase Bible Storage initialized for user:', this.userId);
    } catch (error) {
      console.error('Failed to initialize firebase bible storage:', error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * GESTION DES FAVORIS/SIGNETS
   */
  async getBookmarks(): Promise<BibleBookmark[]> {
    try {
      const data = await firebaseSyncService.syncRead<{ bookmarks: BibleBookmark[] }>(
        this.userId,
        this.COLLECTIONS.BOOKMARKS,
        'data'
      );

      if (!data || !data.bookmarks) return [];

      // Valider et nettoyer les données
      return data.bookmarks.filter(this.isValidBookmark).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Failed to get bookmarks:', error);
      return [];
    }
  }

  async addBookmark(bookmark: Omit<BibleBookmark, 'id' | 'createdAt'>): Promise<BibleBookmark> {
    try {
      const bookmarks = await this.getBookmarks();

      // Vérifier si un signet existe déjà pour cette référence
      const existingIndex = bookmarks.findIndex(b =>
        b.reference.book === bookmark.reference.book &&
        b.reference.chapter === bookmark.reference.chapter &&
        b.reference.verse === bookmark.reference.verse
      );

      const newBookmark: BibleBookmark = {
        ...bookmark,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        bookmarks[existingIndex] = { ...bookmarks[existingIndex], ...newBookmark };
      } else {
        bookmarks.push(newBookmark);
      }

      // Sauvegarder vers Firebase avec debouncing
      await firebaseSyncService.syncWrite(
        this.userId,
        this.COLLECTIONS.BOOKMARKS,
        'data',
        { bookmarks },
        { immediate: false, merge: true }
      );

      return newBookmark;
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  async updateBookmark(id: string, updates: Partial<BibleBookmark>): Promise<void> {
    try {
      const bookmarks = await this.getBookmarks();
      const index = bookmarks.findIndex(b => b.id === id);

      if (index === -1) {
        throw new Error('Bookmark not found');
      }

      bookmarks[index] = {
        ...bookmarks[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await firebaseSyncService.syncWrite(
        this.userId,
        this.COLLECTIONS.BOOKMARKS,
        'data',
        { bookmarks },
        { immediate: false, merge: true }
      );
    } catch (error) {
      console.error('Failed to update bookmark:', error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  async removeBookmark(id: string): Promise<void> {
    try {
      const bookmarks = await this.getBookmarks();
      const filteredBookmarks = bookmarks.filter(b => b.id !== id);

      await firebaseSyncService.syncWrite(
        this.userId,
        this.COLLECTIONS.BOOKMARKS,
        'data',
        { bookmarks: filteredBookmarks },
        { immediate: false, merge: true }
      );
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * GESTION DES SURLIGNAGES
   */
  async getHighlights(): Promise<VerseHighlight[]> {
    try {
      const data = await firebaseSyncService.syncRead<{ highlights: VerseHighlight[] }>(
        this.userId,
        this.COLLECTIONS.HIGHLIGHTS,
        'data'
      );

      if (!data || !data.highlights) return [];

      return data.highlights.filter(this.isValidHighlight).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Failed to get highlights:', error);
      return [];
    }
  }

  async addHighlight(highlight: Omit<VerseHighlight, 'id' | 'createdAt'>): Promise<VerseHighlight> {
    try {
      const highlights = await this.getHighlights();

      const newHighlight: VerseHighlight = {
        ...highlight,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
      };

      highlights.push(newHighlight);

      await firebaseSyncService.syncWrite(
        this.userId,
        this.COLLECTIONS.HIGHLIGHTS,
        'data',
        { highlights },
        { immediate: false, merge: true }
      );

      return newHighlight;
    } catch (error) {
      console.error('Failed to add highlight:', error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  async removeHighlight(id: string): Promise<void> {
    try {
      const highlights = await this.getHighlights();
      const filteredHighlights = highlights.filter(h => h.id !== id);

      await firebaseSyncService.syncWrite(
        this.userId,
        this.COLLECTIONS.HIGHLIGHTS,
        'data',
        { highlights: filteredHighlights },
        { immediate: false, merge: true }
      );
    } catch (error) {
      console.error('Failed to remove highlight:', error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * GESTION DES PARAMÈTRES
   */
  async getSettings(): Promise<BibleSettings> {
    try {
      const data = await firebaseSyncService.syncRead<BibleSettings>(
        this.userId,
        this.COLLECTIONS.SETTINGS,
        'data',
        { ...DEFAULT_SETTINGS }
      );

      if (!data) return { ...DEFAULT_SETTINGS };

      // Fusionner avec les paramètres par défaut
      return { ...DEFAULT_SETTINGS, ...data };
    } catch (error) {
      console.error('Failed to get settings:', error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  async updateSettings(settings: Partial<BibleSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };

      await firebaseSyncService.syncWrite(
        this.userId,
        this.COLLECTIONS.SETTINGS,
        'data',
        updated,
        { immediate: false, merge: true }
      );
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * GESTION DU PROGRÈS DE LECTURE
   */
  async getReadingProgress(): Promise<ReadingProgress[]> {
    try {
      const data = await firebaseSyncService.syncRead<{ progress: ReadingProgress[] }>(
        this.userId,
        this.COLLECTIONS.PROGRESS,
        'data'
      );

      if (!data || !data.progress) return [];

      return data.progress.filter(this.isValidProgress).sort((a, b) =>
        new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime()
      );
    } catch (error) {
      console.error('Failed to get reading progress:', error);
      return [];
    }
  }

  async updateReadingProgress(progress: Omit<ReadingProgress, 'lastRead'>): Promise<void> {
    try {
      const allProgress = await this.getReadingProgress();

      const existingIndex = allProgress.findIndex(p =>
        p.book === progress.book && p.chapter === progress.chapter
      );

      const updatedProgress: ReadingProgress = {
        ...progress,
        lastRead: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        allProgress[existingIndex] = updatedProgress;
      } else {
        allProgress.push(updatedProgress);
      }

      await firebaseSyncService.syncWrite(
        this.userId,
        this.COLLECTIONS.PROGRESS,
        'data',
        { progress: allProgress },
        { immediate: false, merge: true }
      );
    } catch (error) {
      console.error('Failed to update reading progress:', error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * GESTION DE LA DERNIÈRE POSITION DE LECTURE
   */
  async getLastReadingPosition(): Promise<LastReadingPosition | null> {
    try {
      const data = await firebaseSyncService.syncRead<LastReadingPosition>(
        this.userId,
        this.COLLECTIONS.LAST_POSITION,
        'data',
        undefined, // defaultValue
        { forceRemote: true } // ✅ FORCE LE RÉSEAU pour la position
      );

      if (!data || !data.book || typeof data.chapter !== 'number' || typeof data.verse !== 'number') {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get last reading position:', error);
      return null;
    }
  }

  async saveLastReadingPosition(position: Omit<LastReadingPosition, 'timestamp'>): Promise<void> {
    try {
      const fullPosition: LastReadingPosition = {
        ...position,
        timestamp: new Date().toISOString()
      };

      // Position de lecture = très important, sync immédiate
      await firebaseSyncService.syncWrite(
        this.userId,
        this.COLLECTIONS.LAST_POSITION,
        'data',
        fullPosition,
        { immediate: true, merge: false }
      );

      console.log('📍 Position de lecture sauvegardée (Firebase):', `${position.book} ${position.chapter}:${position.verse}`);
    } catch (error) {
      console.error('Failed to save last reading position:', error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  async clearLastReadingPosition(): Promise<void> {
    try {
      await firebaseSyncService.syncWrite(
        this.userId,
        this.COLLECTIONS.LAST_POSITION,
        'data',
        { cleared: true, timestamp: new Date().toISOString() },
        { immediate: true, merge: false }
      );

      console.log('📍 Position de lecture effacée (Firebase)');
    } catch (error) {
      console.error('Failed to clear last reading position:', error);
    }
  }

  /**
   * SYNCHRONISATION ET BACKUP
   */
  async getSyncStatus(): Promise<SyncStatus> {
    return {
      lastSync: new Date().toISOString(), // Firebase sync en temps réel
      pendingUploads: firebaseSyncService.hasPendingWrites() ? 1 : 0,
      pendingDownloads: 0,
      isOnline: true,
      errors: [],
    };
  }

  /**
   * UTILITAIRES DE VALIDATION
   */
  private isValidBookmark(bookmark: any): bookmark is BibleBookmark {
    return bookmark &&
      bookmark.id &&
      bookmark.reference &&
      bookmark.reference.book &&
      typeof bookmark.reference.chapter === 'number' &&
      bookmark.createdAt;
  }

  private isValidHighlight(highlight: any): highlight is VerseHighlight {
    return highlight &&
      highlight.id &&
      highlight.reference &&
      highlight.reference.book &&
      typeof highlight.reference.chapter === 'number' &&
      highlight.tag &&
      highlight.createdAt;
  }

  private isValidProgress(progress: any): progress is ReadingProgress {
    return progress &&
      progress.book &&
      typeof progress.chapter === 'number' &&
      typeof progress.progress === 'number' &&
      progress.lastRead;
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * NETTOYAGE ET MAINTENANCE
   */
  async cleanupOldData(daysToKeep: number = 365): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const cutoffTime = cutoffDate.toISOString();

      // Nettoyer les anciens progrès de lecture
      const progress = await this.getReadingProgress();
      const recentProgress = progress.filter(p => p.lastRead > cutoffTime);

      if (recentProgress.length !== progress.length) {
        await firebaseSyncService.syncWrite(
          this.userId,
          this.COLLECTIONS.PROGRESS,
          'data',
          { progress: recentProgress },
          { immediate: true, merge: false }
        );
        console.log(`Cleaned ${progress.length - recentProgress.length} old progress entries`);
      }
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }

  /**
   * Exporte toutes les données utilisateur
   */
  async exportUserData(): Promise<{
    bookmarks: BibleBookmark[];
    highlights: VerseHighlight[];
    settings: BibleSettings;
    progress: ReadingProgress[];
    exportDate: string;
  }> {
    try {
      const [bookmarks, highlights, settings, progress] = await Promise.all([
        this.getBookmarks(),
        this.getHighlights(),
        this.getSettings(),
        this.getReadingProgress(),
      ]);

      return {
        bookmarks,
        highlights,
        settings,
        progress,
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * Vide toutes les données (avec confirmation)
   */
  async clearAllData(): Promise<void> {
    try {
      // Écrire des documents vides
      await Promise.all([
        firebaseSyncService.syncWrite(
          this.userId,
          this.COLLECTIONS.BOOKMARKS,
          'data',
          { bookmarks: [], cleared: true },
          { immediate: true, merge: false }
        ),
        firebaseSyncService.syncWrite(
          this.userId,
          this.COLLECTIONS.HIGHLIGHTS,
          'data',
          { highlights: [], cleared: true },
          { immediate: true, merge: false }
        ),
        firebaseSyncService.syncWrite(
          this.userId,
          this.COLLECTIONS.SETTINGS,
          'data',
          { ...DEFAULT_SETTINGS, cleared: true },
          { immediate: true, merge: false }
        ),
        firebaseSyncService.syncWrite(
          this.userId,
          this.COLLECTIONS.PROGRESS,
          'data',
          { progress: [], cleared: true },
          { immediate: true, merge: false }
        ),
        this.clearLastReadingPosition(),
        // ✅ NOUVEAU: Vider aussi le blob de tracking V2
        firebaseSyncService.syncWrite(
          this.userId,
          'bibleTracking',
          'progress',
          { value: null, cleared: true },
          { immediate: true, merge: false }
        )
      ]);

      console.log('All bible data cleared (Firebase)');
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * Force le flush de toutes les données en attente
   */
  async flush(): Promise<void> {
    await firebaseSyncService.flushPendingWrites(this.userId);
  }
}

/**
 * Factory pour créer une instance du service avec userId
 */
export function createFirebaseBibleStorage(userId: string): FirebaseBibleStorageService {
  return new FirebaseBibleStorageService(userId);
}
