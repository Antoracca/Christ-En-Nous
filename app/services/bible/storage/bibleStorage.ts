// app/services/bible/storage/bibleStorage.ts
// Service de stockage local optimisé avec sync et backup

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  BibleBookmark, 
  VerseHighlight, 
  BibleSettings, 
  ReadingProgress,
  SyncStatus 
} from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS, ERROR_MESSAGES } from '../utils/constants';

/**
 * Service de stockage local avec fonctionnalités avancées
 */
export class BibleStorageService {
  private syncQueue: Array<{
    type: 'bookmark' | 'highlight' | 'progress' | 'settings';
    action: 'create' | 'update' | 'delete';
    data: any;
    timestamp: string;
  }> = [];

  /**
   * Initialise le stockage et vérifie l'intégrité des données
   */
  async initialize(): Promise<void> {
    try {
      // Vérifier et migrer les données si nécessaire
      await this.migrateDataIfNeeded();
      
      // Charger la queue de synchronisation
      await this.loadSyncQueue();
      
      console.log('Bible storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize bible storage:', error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * Migre les données d'anciennes versions si nécessaire
   */
  private async migrateDataIfNeeded(): Promise<void> {
    try {
      // Vérifier s'il y a des anciennes données à migrer
      const oldBookmarks = await AsyncStorage.getItem('@bible_bookmarks');
      const oldHighlights = await AsyncStorage.getItem('@bible_highlights');
      
      if (oldBookmarks) {
        console.log('Migrating old bookmarks...');
        await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, oldBookmarks);
        await AsyncStorage.removeItem('@bible_bookmarks');
      }
      
      if (oldHighlights) {
        console.log('Migrating old highlights...');
        await AsyncStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, oldHighlights);
        await AsyncStorage.removeItem('@bible_highlights');
      }
    } catch (error) {
      console.warn('Data migration failed:', error);
    }
  }

  /**
   * GESTION DES FAVORIS/SIGNETS
   */
  async getBookmarks(): Promise<BibleBookmark[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (!data) return [];
      
      const bookmarks = JSON.parse(data);
      
      // Valider et nettoyer les données
      return bookmarks.filter(this.isValidBookmark).sort((a: BibleBookmark, b: BibleBookmark) => 
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
        // Mettre à jour le signet existant
        bookmarks[existingIndex] = { ...bookmarks[existingIndex], ...newBookmark };
      } else {
        // Ajouter un nouveau signet
        bookmarks.push(newBookmark);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      
      // Ajouter à la queue de sync
      this.addToSyncQueue('bookmark', 'create', newBookmark);
      
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

      await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      
      // Ajouter à la queue de sync
      this.addToSyncQueue('bookmark', 'update', bookmarks[index]);
    } catch (error) {
      console.error('Failed to update bookmark:', error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  async removeBookmark(id: string): Promise<void> {
    try {
      const bookmarks = await this.getBookmarks();
      const filteredBookmarks = bookmarks.filter(b => b.id !== id);
      
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(filteredBookmarks));
      
      // Ajouter à la queue de sync
      this.addToSyncQueue('bookmark', 'delete', { id });
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
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HIGHLIGHTS);
      if (!data) return [];
      
      const highlights = JSON.parse(data);
      return highlights.filter(this.isValidHighlight).sort((a: VerseHighlight, b: VerseHighlight) => 
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

      await AsyncStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(highlights));
      
      // Ajouter à la queue de sync
      this.addToSyncQueue('highlight', 'create', newHighlight);
      
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
      
      await AsyncStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(filteredHighlights));
      
      // Ajouter à la queue de sync
      this.addToSyncQueue('highlight', 'delete', { id });
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
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return { ...DEFAULT_SETTINGS };
      
      const stored = JSON.parse(data);
      
      // Fusionner avec les paramètres par défaut pour gérer les nouvelles propriétés
      return { ...DEFAULT_SETTINGS, ...stored };
    } catch (error) {
      console.error('Failed to get settings:', error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  async updateSettings(settings: Partial<BibleSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      
      // Ajouter à la queue de sync
      this.addToSyncQueue('settings', 'update', updated);
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
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (!data) return [];
      
      const progress = JSON.parse(data);
      return progress.filter(this.isValidProgress).sort((a: ReadingProgress, b: ReadingProgress) => 
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

      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
      
      // Ajouter à la queue de sync
      this.addToSyncQueue('progress', 'update', updatedProgress);
    } catch (error) {
      console.error('Failed to update reading progress:', error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * SYNCHRONISATION ET BACKUP
   */
  private async loadSyncQueue(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem('@bible_sync_queue');
      if (data) {
        this.syncQueue = JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem('@bible_sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  private addToSyncQueue(
    type: 'bookmark' | 'highlight' | 'progress' | 'settings',
    action: 'create' | 'update' | 'delete',
    data: any
  ): void {
    this.syncQueue.push({
      type,
      action,
      data,
      timestamp: new Date().toISOString(),
    });

    // Sauvegarder de façon asynchrone
    this.saveSyncQueue().catch(console.error);
  }

  async getSyncStatus(): Promise<SyncStatus> {
    return {
      lastSync: await this.getLastSyncTime(),
      pendingUploads: this.syncQueue.length,
      pendingDownloads: 0, // TODO: implémenter
      isOnline: true, // TODO: détecter la connectivité
      errors: [],
    };
  }

  private async getLastSyncTime(): Promise<string> {
    try {
      const lastSync = await AsyncStorage.getItem('@bible_last_sync');
      return lastSync || new Date(0).toISOString();
    } catch {
      return new Date(0).toISOString();
    }
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
        await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(recentProgress));
        console.log(`Cleaned ${progress.length - recentProgress.length} old progress entries`);
      }

      // Nettoyer la queue de sync (garder seulement les 30 derniers jours)
      const syncCutoff = new Date();
      syncCutoff.setDate(syncCutoff.getDate() - 30);
      
      this.syncQueue = this.syncQueue.filter(item => 
        new Date(item.timestamp) > syncCutoff
      );
      
      await this.saveSyncQueue();
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
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.BOOKMARKS),
        AsyncStorage.removeItem(STORAGE_KEYS.HIGHLIGHTS),
        AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.removeItem(STORAGE_KEYS.PROGRESS),
        AsyncStorage.removeItem('@bible_sync_queue'),
        AsyncStorage.removeItem('@bible_last_sync'),
      ]);

      this.syncQueue = [];
      console.log('All bible data cleared');
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }
}

// Instance singleton
export const bibleStorage = new BibleStorageService();