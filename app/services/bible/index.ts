// app/services/bible/index.ts
// Point d'entrée principal pour tous les services Bible

// Imports internes pour les fonctions
import { bibleService } from './bibleService';
import { bibleApi } from './api/bibleApi';
import { bibleStorage } from './storage/bibleStorage';
import type { 
  BibleChapter,
  BibleReference, 
  BibleSearchResult,
  BibleBook,
  BibleBookmark,
  VerseHighlight,
  BibleVersion,
  BibleSettings,
  HighlightTagId,
  HighlightTag
} from './types';

// ==================== EXPORTS PRINCIPAUX ====================

// Service principal
export { bibleService, BibleService } from './bibleService';

// API et stockage
export { bibleApi, BibleApi } from './api/bibleApi';
export { bibleStorage, BibleStorageService } from './storage/bibleStorage';

// ==================== TYPES ET INTERFACES ====================

export type {
  // Types de base
  BibleVerse,
  BibleChapter,
  BibleBook,
  BibleVersion,
  BibleReference,
  BookCategory,

  // Fonctionnalités utilisateur
  BibleBookmark,
  VerseHighlight,
  BibleSettings,
  ReadingProgress,

  // Recherche
  BibleSearchResult,
  BibleSearchFilters,

  // Surlignage
  HighlightTag,
  HighlightTagId,

  // État et configuration
  BibleState,
  BibleApiConfig,
  ApiResponse,
  CacheConfig,
  SyncStatus,

  // Analytics
  BibleAnalyticsEvent,
} from './types';

// ==================== CONSTANTES ====================

export {
  // Configuration
  API_CONFIG,
  CACHE_CONFIG,
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  ERROR_MESSAGES,

  // Données bibliques
  BIBLE_BOOKS,
  HIGHLIGHT_TAGS,
  POPULAR_BOOKS,

  // Maps utilitaires
  OSIS_TO_FRENCH,
  FRENCH_TO_OSIS,
  BOOK_BY_ORDER,
} from './utils/constants';

// ==================== UTILITAIRES ====================

export {
  // Classes utilitaires
  BibleReferenceUtils,
  BibleNavigationUtils,
  BibleSearchUtils,
  BibleStorageUtils,
  BibleAnalyticsUtils,

  // Fonctions helper
  debounce,
  retryWithBackoff,
} from './utils/helpers';

// ==================== INITIALISATION ====================

/**
 * Initialise tous les services Bible
 * À appeler au démarrage de l'application
 */
export async function initializeBibleServices(): Promise<void> {
  console.log('🔥 Initializing Bible Services...');
  
  try {
    // Initialiser le service principal (qui initialise les autres)
    await bibleService.initialize();
    
    console.log('✅ Bible Services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Bible Services:', error);
    throw error;
  }
}

/**
 * Récupère l'état de santé de tous les services
 */
export async function getBibleServicesHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    main: boolean;
    api: boolean;
    storage: boolean;
    cache: any;
    sync: any;
  };
}> {
  try {
    const health = await bibleService.getHealthStatus();
    
    const allHealthy = health.api && health.storage;
    const status = allHealthy ? 'healthy' : 'degraded';
    
    return {
      status,
      services: {
        main: true,
        ...health
      }
    };
  } catch (error) {
    console.error('Failed to get Bible services health:', error);
    
    return {
      status: 'unhealthy',
      services: {
        main: false,
        api: false,
        storage: false,
        cache: null,
        sync: null
      }
    };
  }
}

// ==================== SHORTCUTS ET HELPERS ====================

/**
 * Raccourcis pour les opérations courantes
 */
export const Bible = {
  // Navigation rapide
  async getChapter(book: string, chapter: number, version?: string) {
    return bibleService.getChapter({ book, chapter }, version);
  },

  async search(query: string, options?: { maxResults?: number }) {
    return bibleService.searchVerses(query, { 
      maxResults: options?.maxResults || 25 
    });
  },

  // Signets rapides
  async bookmark(book: string, chapter: number, verse?: number, title?: string) {
    return bibleService.addBookmark(
      { book, chapter, verse },
      title
    );
  },

  // Surlignage rapide
  async highlight(book: string, chapter: number, verse: number, tagId: HighlightTagId) {
    const tags = bibleService.getHighlightTags();
    const tag = tags.find((t: HighlightTag) => t.id === tagId);
    
    if (!tag) {
      throw new Error(`Invalid highlight tag: ${tagId}`);
    }
    
    return bibleService.addHighlight({ book, chapter, verse }, tag);
  },

  // Formatage
  format(book: string, chapter: number, verse?: number): string {
    return bibleService.formatReference({ book, chapter, verse });
  },

  // Parsing
  parse(reference: string) {
    return bibleService.parseReference(reference);
  },

  // Données statiques
  get books() { return bibleService.getBooks(); },
  get popularBooks() { return bibleService.getPopularBooks(); },
  get highlightTags() { return bibleService.getHighlightTags(); },
} as const;

// ==================== HOOKS POUR REACT (optionnel) ====================

/**
 * Types pour les hooks React (si utilisés)
 */
export interface UseBibleResult {
  // État
  isLoading: boolean;
  error: string | null;
  
  // Données actuelles
  currentChapter: BibleChapter | null;
  currentReference: BibleReference | null;
  currentVersion: string;
  
  // Actions
  goToChapter: (reference: BibleReference) => Promise<void>;
  goToNext: () => Promise<void>;
  goToPrevious: () => Promise<void>;
  search: (query: string) => Promise<BibleSearchResult[]>;
  addBookmark: (reference: BibleReference, title?: string) => Promise<void>;
  toggleHighlight: (reference: BibleReference, tagId: HighlightTagId) => Promise<void>;
  
  // Données
  books: BibleBook[];
  bookmarks: BibleBookmark[];
  highlights: VerseHighlight[];
  searchResults: BibleSearchResult[];
  versions: BibleVersion[];
  settings: BibleSettings;
}

// ==================== VERSION ET METADATA ====================

export const BIBLE_SERVICES_VERSION = '1.0.0';
export const BIBLE_SERVICES_BUILD = new Date().toISOString();

export const metadata = {
  version: BIBLE_SERVICES_VERSION,
  build: BIBLE_SERVICES_BUILD,
  features: [
    'Multi-version Bible support',
    'Advanced search with relevance scoring',
    'Intelligent caching with TTL',
    'Offline data storage',
    'Bookmarks and highlights',
    'Reading progress tracking',
    'Analytics and metrics',
    'Responsive design support',
    'Error handling and retry logic',
    'Data synchronization ready',
  ],
  apis: {
    primary: 'Scripture API (api.bible)',
    fallback: 'Offline data',
  },
  storage: {
    engine: 'AsyncStorage',
    encryption: false, // TODO: implement if needed
    compression: false, // TODO: implement if needed
  },
} as const;

console.log(`📖 Bible Services v${BIBLE_SERVICES_VERSION} loaded`);
console.log(`🎯 Features: ${metadata.features.length} available`);

// ==================== EXPORT PAR DÉFAUT ====================

/**
 * Export par défaut : service principal prêt à l'emploi
 */
export default {
  service: bibleService,
  api: bibleApi,
  storage: bibleStorage,
  initialize: initializeBibleServices,
  health: getBibleServicesHealth,
  Bible,
  metadata,
};