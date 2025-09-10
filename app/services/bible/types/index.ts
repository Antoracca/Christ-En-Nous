// app/services/bible/types/index.ts
// Types améliorés et optimisés pour l'API Bible

export interface BibleVerse {
  book: string;         // Code OSIS standardisé
  chapter: number;
  verse: number;
  text: string;
  version: string;
  id?: string;         // Identifiant unique pour optimisations
  html?: string;       // Version HTML si disponible
}

export interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
  title?: string;      // Titre du chapitre
  summary?: string;    // Résumé optionnel
  verseCount: number;  // Nombre total de versets
  id: string;         // Pour le cache
}

export interface BibleBook {
  name: string;        // Code OSIS standardisé (GEN, EXO, MAT, etc.)
  frenchName: string;  // Nom d'affichage français
  testament: 'OLD' | 'NEW';
  chapters: number;
  category: BookCategory;
  abbrev?: string;     // Abréviation (Gn, Ex, Mt, etc.)
  description?: string;
  order: number;       // Ordre canonique
}

export type BookCategory = 
  | 'LAW'           // Pentateuque
  | 'HISTORY'       // Livres historiques
  | 'POETRY'        // Livres poétiques
  | 'PROPHETS'      // Prophètes
  | 'GOSPELS'       // Évangiles  
  | 'ACTS'          // Actes
  | 'EPISTLES'      // Épîtres
  | 'REVELATION';   // Apocalypse

export interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  description: string;
  copyright?: string;
  year?: number;
  isDefault?: boolean;
  isOfflineAvailable?: boolean;
  isAvailable?: boolean;    // Indique si la version est réellement disponible
  comingSoon?: boolean;     // Indique si la version est à venir
}

export interface BibleReference {
  end: any;
  book: string;        // Code OSIS
  chapter: number;
  verse?: number;
  endVerse?: number;
  version?: string;    // Version spécifique
}

export interface LastReadingPosition {
  book: string;        // Code OSIS du livre (GEN, MAT, etc.)
  chapter: number;     // Numéro de chapitre
  verse: number;       // Dernier verset lu/visualisé
  timestamp: string;   // Quand cette position a été sauvegardée (ISO string)
  version?: string;    // Version de Bible utilisée
}

// Interfaces améliorées pour les fonctionnalités
export interface BibleBookmark {
  id: string;
  reference: BibleReference;
  title?: string;
  note?: string;
  color?: string;
  tags?: string[];
  createdAt: string;   // ISO string
  updatedAt?: string;
  isFavorite?: boolean;
}

export interface BibleSearchResult {
  verse: BibleVerse;
  relevance: number;
  highlightedText: string;
  context?: string;    // Versets adjacents pour le contexte
  matchType: 'exact' | 'partial' | 'fuzzy';
}

export interface BibleSearchFilters {
  testament?: 'OLD' | 'NEW' | 'BOTH';
  books?: string[];
  exactMatch?: boolean;
  caseSensitive?: boolean;
  includeContext?: boolean;
  maxResults?: number;
}

// Types pour les surlignages
export type HighlightTagId = 
  | 'yellow' | 'green' | 'blue' | 'purple' 
  | 'orange' | 'red' | 'pink' | 'gray';

export interface HighlightTag {
  id: HighlightTagId;
  label: string;
  color: string;
  description?: string;
  order: number;
}

export interface VerseHighlight {
  id: string;
  reference: BibleReference;
  tag: HighlightTag;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

// Paramètres de lecture
export interface BibleSettings {
  version: string;
  defaultVersion: string; // Version définie comme par défaut par l'utilisateur
  fontSize: number;
  fontFamily: 'default' | 'serif' | 'sans-serif';
  lineHeight: number;
  theme: 'light' | 'dark' | 'sepia';
  verseNumbers: boolean;
  redLetters: boolean;
  parallelVersion?: string;
  autoScroll: boolean;
  nightMode: boolean;
}

// Progrès de lecture
export interface ReadingProgress {
  book: string;
  chapter: number;
  verse?: number;
  progress: number;    // 0-100
  timeSpent: number;   // en minutes
  lastRead: string;    // ISO string
  isCompleted: boolean;
}

// État global Bible
export interface BibleState {
  // Navigation
  currentReference: BibleReference;
  currentChapter: BibleChapter | null;
  
  // Données
  versions: BibleVersion[];
  books: BibleBook[];
  
  // Fonctionnalités utilisateur
  bookmarks: BibleBookmark[];
  highlights: VerseHighlight[];
  searchResults: BibleSearchResult[];
  readingProgress: ReadingProgress[];
  
  // Configuration
  settings: BibleSettings;
  
  // État de l'application
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  lastSync?: string;
}

// Types pour l'API et le cache
export interface CacheConfig {
  ttl: number;         // Time to live en millisecondes
  maxSize: number;     // Taille max du cache
  version: string;     // Version du cache pour invalidation
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  cached?: boolean;
  timestamp: string;
}

// Types pour la synchronisation
export interface SyncStatus {
  lastSync: string;
  pendingUploads: number;
  pendingDownloads: number;
  isOnline: boolean;
  errors: string[];
}

// Événements pour analytics
export type BibleAnalyticsEventType = 
  | 'chapter_read' 
  | 'verse_bookmarked' 
  | 'search_performed' 
  | 'highlight_added'
  | 'service_initialized'
  | 'version_changed'
  | 'bookmark_removed'
  | 'highlight_removed'
  | 'settings_updated';

export interface BibleAnalyticsEvent {
  type: BibleAnalyticsEventType;
  data: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

// Configuration de l'API
export interface BibleApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  cacheConfig: CacheConfig;
}