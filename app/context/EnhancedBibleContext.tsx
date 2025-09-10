// app/context/EnhancedBibleContext.tsx
// Context Bible amélioré, branché au moteur de tracking (progress)

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// Services Bible
import {
  bibleService,
  bibleStorage,
  initializeBibleServices,
  type BibleChapter,
  type BibleReference,
  type BibleBookmark,
  type VerseHighlight,
  type BibleSettings,
  type BibleSearchResult,
  type BibleBook as NewBibleBook,
  type BibleVersion as NewBibleVersion,
  type HighlightTag
} from '../services/bible';

// Tracking
import { progress, type BibleIndex, type ActiveSession } from '../services/bible/tracking/progressTracking';

// ==================== TYPES COMPAT ====================
export interface BibleBook {
  id: string;
  name: string;
  abbrev: string;
  chapters: number;
  testament: 'ancien' | 'nouveau';
}

export interface BibleVersion {
  id: string;
  name: string;
  abbrev: string;
  language: 'fr' | 'en';
}

export interface UserProgress {
  currentBook?: string;
  currentChapter?: number;
  currentVerse?: number;
  readingPlan?: string;
  consecutiveDays: number;
  chaptersRead: number;
  progressPercentage: number;
  lastReadDate?: string;
  meditationsCount: number;
  learningModulesCompleted: number;
}

export interface DailyVerse {
  verse: string;
  reference: string;
  date: string;
}

// ==================== INTERFACE CONTEXT ====================
interface EnhancedBibleContextType {
  currentVersion: BibleVersion;
  availableVersions: BibleVersion[];
  bibleBooks: BibleBook[];

  userProgress: UserProgress;
  dailyVerse: DailyVerse;

  setCurrentVersion: (version: BibleVersion) => void;
  updateProgress: (progress: Partial<UserProgress>) => void;
  markChapterAsRead: (bookId: string, chapter: number) => void;
  incrementMeditation: () => void;
  incrementLearningModule: () => void;
  loading: boolean;

  // Amélioré
  isInitialized: boolean;
  error: string | null;
  currentChapter: BibleChapter | null;
  currentReference: BibleReference | null;

  navigateToChapter: (reference: BibleReference) => Promise<void>;
  goToNextChapter: () => Promise<void>;
  goToPreviousChapter: () => Promise<void>;
  getChapter: (reference: BibleReference, version?: string) => Promise<BibleChapter | null>;

  searchResults: BibleSearchResult[];
  searchVerses: (query: string, maxResults?: number) => Promise<void>;
  clearSearch: () => void;
  isSearching: boolean;

  bookmarks: BibleBookmark[];
  addBookmark: (reference: BibleReference, title?: string, note?: string) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  isBookmarked: (reference: BibleReference) => Promise<boolean>;
  refreshBookmarks: () => Promise<void>;

  highlights: VerseHighlight[];
  highlightTags: HighlightTag[];
  addHighlight: (reference: BibleReference, tag: HighlightTag, note?: string) => Promise<void>;
  removeHighlight: (id: string) => Promise<void>;
  toggleHighlight: (reference: BibleReference, tag: HighlightTag) => Promise<void>;
  refreshHighlights: () => Promise<void>;

  settings: BibleSettings;
  updateSettings: (settings: Partial<BibleSettings>) => Promise<void>;

  formatReference: (reference: BibleReference) => string;
  parseReference: (text: string) => BibleReference | null;
  getDefaultVersion: () => Promise<string>;
  isTemporaryVersion: () => Promise<boolean>;
  returnToDefaultVersion: () => Promise<void>;

  booksStructured: NewBibleBook[];
  versionsStructured: NewBibleVersion[];

  getReadingStats: () => Promise<{
    totalChaptersRead: number;
    totalTimeSpent: number;
    booksCompleted: string[];
    bibleProgress: number;
  }>;
}

// ==================== CONTEXT ====================
const EnhancedBibleContext = createContext<EnhancedBibleContextType | undefined>(undefined);

export const useEnhancedBible = () => {
  const context = useContext(EnhancedBibleContext);
  if (!context) throw new Error('useEnhancedBible must be used within an EnhancedBibleProvider');
  return context;
};
export const useBible = useEnhancedBible;

// ==================== ADAPTATEURS ====================
function adaptBooksToOldFormat(books: NewBibleBook[]): BibleBook[] {
  return books.map(book => ({
    id: book.name.toLowerCase(),
    name: book.frenchName || book.name,
    abbrev: book.abbrev || book.name,
    chapters: book.chapters,
    testament: book.testament === 'OLD' ? 'ancien' : 'nouveau'
  }));
}

interface BookIndexEntry {
  id: string;
  testament: 'OT' | 'NT';
  chapters: number;
  versesPerChapter: number[];
}

function createBibleIndex(books: NewBibleBook[]): BibleIndex {
  const booksMap: Record<string, BookIndexEntry> = {};
  books.forEach(book => {
    const versesPerChapter = Array.from({ length: book.chapters }, (_, i) => {
      const chapterNum = i + 1;
      return getEstimatedVersesForChapter(book.name, chapterNum);
    });
    const bookEntry: BookIndexEntry = {
      id: book.name,
      testament: book.testament === 'OLD' ? 'OT' : 'NT',
      chapters: book.chapters,
      versesPerChapter
    };
    booksMap[book.name] = bookEntry;
  });
  return booksMap as any;
}

function getEstimatedVersesForChapter(bookName: string, chapter: number): number {
  const estimates: Record<string, number[]> = {
    // ✅ ANCIEN TESTAMENT COMPLET - 39 livres avec données précises par chapitre
    'GEN': [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26],
    'EXO': [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38],
    'LEV': [17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34],
    'NUM': [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 50, 13, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 40, 16, 54, 42, 56, 29, 34, 13],
    'DEU': [46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 32, 18, 29, 23, 22, 20, 22, 21, 20, 23, 30, 25, 22, 19, 19, 26, 68, 29, 20, 30, 52, 29, 12],
    'JOS': [18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 45, 34, 16, 33],
    'JDG': [36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 25],
    'RUT': [22, 23, 18, 22],
    '1SA': [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 15, 23, 29, 22, 44, 25, 12, 25, 11, 31, 13],
    '2SA': [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 33, 43, 26, 22, 51, 39, 25],
    '1KI': [53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 53],
    '2KI': [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 21, 21, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30],
    '1CH': [54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 47, 40, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30],
    '2CH': [17, 18, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 22, 15, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23],
    'EZR': [11, 70, 13, 24, 17, 22, 28, 36, 15, 44],
    'NEH': [11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31],
    'EST': [22, 23, 15, 17, 14, 14, 10, 17, 32, 3],
    'JOB': [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 24, 34, 17],
    'PSA': [6, 12, 8, 8, 12, 10, 17, 9, 20, 18, 7, 8, 6, 7, 5, 11, 15, 50, 14, 9, 13, 31, 6, 10, 22, 12, 14, 9, 11, 12, 24, 11, 22, 22, 28, 12, 40, 22, 13, 17, 13, 11, 5, 26, 17, 11, 9, 14, 20, 23, 19, 9, 6, 7, 23, 13, 11, 11, 17, 12, 8, 12, 11, 10, 13, 20, 7, 35, 36, 5, 24, 20, 28, 23, 10, 11, 20, 72, 13, 19, 16, 8, 18, 12, 13, 24, 7, 8, 12, 13, 7, 9, 4, 12, 8, 12, 2, 3, 18, 19, 15, 48, 22, 51, 66, 21, 32, 27, 26, 17, 12, 5, 21, 9, 12, 20, 20, 31, 51, 7, 37, 10, 14, 20, 28, 10, 26, 10, 31, 34, 21, 7, 9, 6, 7, 20, 14, 35, 20, 28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35, 21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13, 11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9],
    'PRO': [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31],
    'ECC': [18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14],
    'SNG': [17, 17, 11, 16, 16, 13, 13, 14],
    'ISA': [31, 22, 26, 6, 30, 13, 25, 22, 21, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 12, 25, 24],
    'JER': [19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34],
    'LAM': [22, 22, 66, 22, 22],
    'EZK': [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35],
    'DAN': [21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13],
    'HOS': [11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9],
    'JOL': [20, 32, 21],
    'AMO': [15, 16, 15, 13, 27, 14, 17, 14, 15],
    'OBA': [21],
    'JON': [17, 10, 10, 11],
    'MIC': [16, 13, 12, 13, 15, 16, 20],
    'NAM': [15, 13, 19],
    'HAB': [17, 20, 19],
    'ZEP': [18, 15, 20],
    'HAG': [15, 23],
    'ZEC': [21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21],
    'MAL': [14, 17, 18, 6],
    
    // ✅ NOUVEAU TESTAMENT COMPLET - 27 livres avec données précises par chapitre
    'MAT': [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20],
    'MRK': [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20],
    'LUK': [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53],
    'JHN': [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25],
    'ACT': [26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31],
    'ROM': [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27],
    '1CO': [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24],
    '2CO': [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14],
    'GAL': [24, 21, 29, 31, 26, 18],
    'EPH': [23, 22, 21, 32, 33, 24],
    'PHP': [30, 30, 21, 23],
    'COL': [29, 23, 25, 18],
    '1TH': [10, 20, 13, 18, 28],
    '2TH': [12, 17, 18],
    '1TI': [20, 15, 16, 16, 25, 21],
    '2TI': [18, 26, 17, 22],
    'TIT': [16, 15, 15],
    'PHM': [25],
    'HEB': [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25],
    'JAS': [27, 26, 18, 17, 20],
    '1PE': [25, 25, 22, 19, 14],
    '2PE': [21, 22, 18],
    '1JN': [10, 29, 24, 21, 21],
    '2JN': [13],
    '3JN': [14],
    'JUD': [25],
    'REV': [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 22]
  };
  const bookEstimates = estimates[bookName];
  if (bookEstimates && bookEstimates[chapter - 1]) {
    return bookEstimates[chapter - 1];
  }

  // ⚠️ FALLBACK: Si un livre/chapitre n'est pas trouvé dans nos données complètes
  console.warn(`⚠️ Données manquantes pour ${bookName} chapitre ${chapter}, utilisation fallback`);
  
  // Fallbacks sécurisés par testament
  if (['GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL'].includes(bookName)) {
    return 25; // Ancien Testament fallback
  } else if (['MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV'].includes(bookName)) {
    return 25; // Nouveau Testament fallback
  } else {
    return 25; // Fallback universel
  }
}

function adaptVersionsToOldFormat(versions: NewBibleVersion[]): BibleVersion[] {
  return versions.map(version => ({
    id: version.id,
    name: version.name,
    abbrev: version.abbreviation,
    language: version.language.toLowerCase().includes('fr') ? 'fr' : 'en'
  }));
}

// ==================== PROVIDER ====================
export const EnhancedBibleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentVersion, setCurrentVersionState] = useState<BibleVersion>({
    id: 'a93a92589195411f-01',
    name: 'Bible J.N. Darby',
    abbrev: 'DARBY',
    language: 'fr'
  });
  const [availableVersions, setAvailableVersions] = useState<BibleVersion[]>([]);
  const [bibleBooks, setBibleBooks] = useState<BibleBook[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    consecutiveDays: 0,
    chaptersRead: 0,
    progressPercentage: 0,
    meditationsCount: 0,
    learningModulesCompleted: 0,
  });

  const [currentChapter, setCurrentChapter] = useState<BibleChapter | null>(null);
  const [currentReference, setCurrentReference] = useState<BibleReference | null>(null);
  const [searchResults, setSearchResults] = useState<BibleSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [bookmarks, setBookmarks] = useState<BibleBookmark[]>([]);
  const [highlights, setHighlights] = useState<VerseHighlight[]>([]);
  const [settings, setSettings] = useState<BibleSettings>({
    version: 'a93a92589195411f-01',
    defaultVersion: 'a93a92589195411f-01',
    fontSize: 16,
    fontFamily: 'default',
    lineHeight: 1.5,
    theme: 'light',
    verseNumbers: true,
    redLetters: false,
    autoScroll: true,
    nightMode: false,
  });

  const [dailyVerse] = useState<DailyVerse>({
    verse: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.",
    reference: "Jean 3:16",
    date: new Date().toISOString().split('T')[0],
  });

  // ===== Helpers =====
  const loadReadingStats = useCallback(async () => {
    try {
      const stats = await bibleService.getReadingStats();
      setUserProgress(prev => ({
        ...prev,
        chaptersRead: stats.totalChaptersRead,
        progressPercentage: stats.bibleProgress,
      }));
    } catch (e) {
      console.error('Failed to load reading stats:', e);
    }
  }, []);

  const refreshBookmarks = useCallback(async () => {
    try {
      const userBookmarks = await bibleService.getBookmarks();
      setBookmarks(userBookmarks);
    } catch (e) { console.error('Failed to refresh bookmarks:', e); }
  }, []);

  const refreshHighlights = useCallback(async () => {
    try {
      const userHighlights = await bibleService.getHighlights();
      setHighlights(userHighlights);
    } catch (e) { console.error('Failed to refresh highlights:', e); }
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      const structuredBooks = bibleService.getBooks();
      setBibleBooks(adaptBooksToOldFormat(structuredBooks));

      // Tracking index + ordre réel des livres
      const bibleIndex = createBibleIndex(structuredBooks);
      const order = structuredBooks.map(b => b.name); // OSIS order si fourni par le service
      progress.configureBibleIndex(bibleIndex, order);
      await progress.hydrate();

      // Versions
      const versions = await bibleService.getVersions();
      const adaptedVersions = adaptVersionsToOldFormat(versions);
      setAvailableVersions(adaptedVersions);

      // Settings (et sync version)
      const userSettings = await bibleService.getSettings();
      setSettings(userSettings);

      const savedVersionId = userSettings.version;
      const defaultVersionId = userSettings.defaultVersion;

      let found = adaptedVersions.find(v => v.id === savedVersionId)
        || adaptedVersions.find(v => v.id === defaultVersionId)
        || adaptedVersions.find(v => v.id === 'a93a92589195411f-01')
        || adaptedVersions.find(v => v.language === 'fr')
        || adaptedVersions[0];

      if (found) {
        await bibleService.updateSettings({
          version: found.id,
          defaultVersion: defaultVersionId || found.id
        });
        setSettings(prev => ({
          ...prev,
          version: found.id,
          defaultVersion: defaultVersionId || found.id
        }));
      }

      const finalVersion = found || {
        id: 'a93a92589195411f-01',
        name: 'Bible J.N. Darby',
        abbrev: 'DARBY',
        language: 'fr'
      };
      setCurrentVersionState(finalVersion);

      await refreshBookmarks();
      await refreshHighlights();
      await loadReadingStats();

      // Position de lecture sera restaurée dans un useEffect séparé après l'initialisation

      console.log('✅ Initial data loaded');

    } catch (e) {
      console.error('Failed to load initial data:', e);
    }
  }, [refreshBookmarks, refreshHighlights, loadReadingStats]);

  const initializeServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await initializeBibleServices();
      await loadInitialData();
      setIsInitialized(true);
      console.log('✅ Enhanced Bible Context initialized');
    } catch (e: any) {
      console.error('❌ Failed to initialize Enhanced Bible Context:', e);
      setError(e instanceof Error ? e.message : 'Erreur d\'initialisation');
    } finally {
      setLoading(false);
    }
  }, [loadInitialData]);

  useEffect(() => { initializeServices(); }, [initializeServices]);

  // ===== Navigation & Tracking =====
  const navigateToChapter = useCallback(async (reference: BibleReference) => {
    setLoading(true);
    setError(null);
    try {
      const ref = { book: reference.book.toUpperCase(), chapter: reference.chapter, verse: reference.verse };
      const chapter = await bibleService.getChapter(ref);
      if (!chapter) throw new Error(`Le chapitre ${ref.book} ${ref.chapter} est introuvable pour cette version.`);

      setCurrentChapter(chapter);
      setCurrentReference({ book: ref.book, chapter: ref.chapter, verse: ref.verse });

      setUserProgress(prev => ({
        ...prev,
        currentBook: ref.book,
        currentChapter: ref.chapter,
        currentVerse: ref.verse || 1,
        lastReadDate: new Date().toISOString(),
      }));

      // Démarre (ou bascule) le timer sur ce chapitre
      try { progress.switchTo(ref.book, ref.chapter); } catch {}

      // ✅ NOUVEAU: Sauvegarder la position de lecture actuelle
      try {
        await bibleStorage.saveLastReadingPosition({
          book: ref.book,
          chapter: ref.chapter,
          verse: ref.verse || 1,
          version: currentVersion.id
        });
      } catch (err) {
        console.warn('⚠️ Impossible de sauvegarder la position de lecture:', err);
      }

      console.log('✅ Navigation:', `${ref.book} ${ref.chapter}${ref.verse ? ':' + ref.verse : ''}`);
    } catch (e: any) {
      console.error('Failed to navigate to chapter:', e);
      setError(e?.message || 'Erreur lors de la navigation');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [currentVersion]);

  // ✅ NOUVEAU: Restaurer la dernière position de lecture après l'initialisation
  useEffect(() => {
    if (!isInitialized) return;
    
    const restoreLastPosition = async () => {
      try {
        const lastPosition = await bibleStorage.getLastReadingPosition();
        if (lastPosition) {
          console.log('📍 Restauration de la dernière position:', `${lastPosition.book} ${lastPosition.chapter}:${lastPosition.verse}`);
          
          // Naviguer vers la dernière position connue
          await navigateToChapter({ book: lastPosition.book, chapter: lastPosition.chapter });
          
          // TODO: Si besoin, on pourrait aussi scroll vers le verset spécifique
          // mais pour l'instant on se contente du chapitre
        } else {
          // Aucune position sauvée, commencer par Genèse 1
          console.log('📍 Aucune position sauvée, démarrage à Genèse 1');
          await navigateToChapter({ book: 'GEN', chapter: 1 });
        }
      } catch (err) {
        console.warn('⚠️ Impossible de charger la dernière position, démarrage à Genèse 1:', err);
        await navigateToChapter({ book: 'GEN', chapter: 1 });
      }
    };
    
    restoreLastPosition();
  }, [isInitialized, navigateToChapter]);

  // ===== Versions (compat) =====
  const setCurrentVersion = useCallback(async (version: BibleVersion) => {
    console.log('🔄 Changement de version vers:', version.name, '(ID:', version.id, ')');
    try {
      setCurrentVersionState(version);
      await bibleService.setCurrentVersion(version.id);
      await bibleService.updateSettings({ version: version.id });
      setSettings(prev => ({ ...prev, version: version.id }));
      console.log('✅ Version courante changée');
    } catch (e) {
      console.error('❌ Erreur lors du changement de version:', e);
      throw e;
    }
  }, []);

  const updateProgress = useCallback((patch: Partial<UserProgress>) => {
    setUserProgress(prev => ({ ...prev, ...patch }));
  }, []);

  const markChapterAsRead = useCallback(async (bookId: string, chapter: number) => {
    try {
      const reference: BibleReference = { book: bookId.toUpperCase(), chapter };
      await bibleService.updateReadingProgress(reference, 25);
      await loadReadingStats();
    } catch (e) { console.error('Failed to mark chapter as read:', e); }
  }, [loadReadingStats]);

  const incrementMeditation = useCallback(() => {
    setUserProgress(prev => ({ ...prev, meditationsCount: prev.meditationsCount + 1 }));
  }, []);
  const incrementLearningModule = useCallback(() => {
    setUserProgress(prev => ({ ...prev, learningModulesCompleted: prev.learningModulesCompleted + 1 }));
  }, []);

  const goToNextChapter = useCallback(async () => {
    if (!currentReference) return;
    try {
      // ✅ NOUVEAU: Validation COMPLÈTE du chapitre indépendamment du scroll
      console.log('▶️ Bouton Suivant pressé - validation complète du chapitre');
      
      // Forcer la complétion du chapitre entier
      await progress.completeChapter();
      console.log('✅ Chapitre complété explicitement:', currentReference.book, currentReference.chapter);
      
      // Navigation vers le chapitre suivant
      const next = await bibleService.getNextChapter(currentReference);
      if (next) {
        await navigateToChapter({ book: next.book, chapter: next.chapter });
        console.log('📖 Navigation vers chapitre suivant:', next.book, next.chapter);
      } else {
        console.log('📚 Fin du livre atteinte');
      }
    } catch (e) {
      console.error('goToNextChapter error:', e);
    }
  }, [currentReference, navigateToChapter]);

  const goToPreviousChapter = useCallback(async () => {
    if (!currentReference) return;
    try {
      // pas de completeChapter ici (on revient en arrière)
      const prev = await bibleService.getPreviousChapter(currentReference);
      if (prev) {
        await navigateToChapter({ book: prev.book, chapter: prev.chapter });
      }
    } catch (e) {
      console.error('goToPreviousChapter error:', e);
    }
  }, [currentReference, navigateToChapter]);

  const getChapter = useCallback(async (reference: BibleReference, version?: string) => {
    return bibleService.getChapter(reference, version);
  }, []);

  // ===== Recherche =====
  const searchVerses = useCallback(async (query: string, maxResults = 25) => {
    try {
      setIsSearching(true);
      const results = await bibleService.searchVerses(query, { maxResults });
      setSearchResults(results);
    } catch (e) {
      console.error('Search failed:', e);
      setSearchResults([]);
    } finally { setIsSearching(false); }
  }, []);
  const clearSearch = useCallback(() => { setSearchResults([]); setIsSearching(false); }, []);

  // ===== Signets =====
  const addBookmark = useCallback(async (reference: BibleReference, title?: string, note?: string) => {
    try { await bibleService.addBookmark(reference, title, note); await refreshBookmarks(); }
    catch (e) { console.error('Failed to add bookmark:', e); }
  }, [refreshBookmarks]);
  const removeBookmark = useCallback(async (id: string) => {
    try { await bibleService.removeBookmark(id); await refreshBookmarks(); }
    catch (e) { console.error('Failed to remove bookmark:', e); }
  }, [refreshBookmarks]);
  const isBookmarked = useCallback(async (reference: BibleReference) => bibleService.isBookmarked(reference), []);

  // ===== Surlignages =====
  const addHighlight = useCallback(async (reference: BibleReference, tag: HighlightTag, note?: string) => {
    try { await bibleService.addHighlight(reference, tag, note); await refreshHighlights(); }
    catch (e) { console.error('Failed to add highlight:', e); }
  }, [refreshHighlights]);
  const removeHighlight = useCallback(async (id: string) => {
    try { await bibleService.removeHighlight(id); await refreshHighlights(); }
    catch (e) { console.error('Failed to remove highlight:', e); }
  }, [refreshHighlights]);
  const toggleHighlight = useCallback(async (reference: BibleReference, tag: HighlightTag) => {
    try { await bibleService.toggleHighlight(reference, tag); await refreshHighlights(); }
    catch (e) { console.error('Failed to toggle highlight:', e); }
  }, [refreshHighlights]);

  // ===== Paramètres =====
  const updateSettings = useCallback(async (newSettings: Partial<BibleSettings>) => {
    try {
      await bibleService.updateSettings(newSettings);
      const updatedSettings = await bibleService.getSettings();
      setSettings(updatedSettings);
      // éventuel réglage future: vitesse cible par défaut → progress.setDefaultPace(...)
    } catch (e) { console.error('Failed to update settings:', e); }
  }, []);

  // ===== Utilitaires =====
  const formatReference = useCallback((reference: BibleReference) => bibleService.formatReference(reference), []);
  const parseReference = useCallback((text: string) => bibleService.parseReference(text), []);
  const getReadingStats = useCallback(async () => bibleService.getReadingStats(), []);
  const getDefaultVersion = useCallback(async () => bibleService.getDefaultVersion(), []);
  const isTemporaryVersion = useCallback(async () => bibleService.isTemporaryVersion(), []);

  const returnToDefaultVersion = useCallback(async () => {
    try {
      await bibleService.returnToDefaultVersion();
      const newVersion = bibleService.getCurrentVersion();
      const adaptedVersion = adaptVersionsToOldFormat([{
        id: newVersion,
        name: 'Version par défaut',
        abbreviation: 'DEFAULT',
        language: 'fr'
      } as any])[0];
      setCurrentVersionState(adaptedVersion);
    } catch (e) {
      console.error('Failed to return to default version:', e);
    }
  }, []);

  // ===== AppState → Pause/Resume tracking =====
  useEffect(() => {
    const onChange = async (s: AppStateStatus) => {
      try {
        if (s === 'background' || s === 'inactive') {
          progress.pause();
          await progress.persist?.();
          
          // ✅ NOUVEAU: Sauvegarder la position actuelle quand l'app passe en arrière-plan
          if (currentReference) {
            try {
              await bibleStorage.saveLastReadingPosition({
                book: currentReference.book,
                chapter: currentReference.chapter,
                verse: currentReference.verse || 1,
                version: currentVersion.id
              });
              console.log('📱 Position sauvegardée avant passage en arrière-plan:', `${currentReference.book} ${currentReference.chapter}:${currentReference.verse || 1}`);
            } catch (err) {
              console.warn('⚠️ Impossible de sauvegarder la position lors du passage en arrière-plan:', err);
            }
          }
        } else if (s === 'active') {
          // Reprendre la session active ou celle du contexte
          const activeSession: ActiveSession | null = progress.getActiveSession();
          const bookId = activeSession?.ref.bookId || currentReference?.book;
          const chapter = activeSession?.ref.chapter || currentReference?.chapter;
          if (bookId && chapter) {
            progress.switchTo(bookId, chapter);
            console.log('\u{1F4F1} App redevenue active - timer repris:', bookId, chapter);
          }
        }
      } catch (err) {
        console.error('AppState onChange error:', err);
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => { sub.remove(); };
  }, [currentReference]);

  // Flush & persist au démontage du provider
  useEffect(() => {
    return () => {
      try { progress.pause(); } catch {}
      progress.persist?.().catch(() => {});
    };
  }, []);

  // ===== CONTEXT VALUE =====
  const contextValue: EnhancedBibleContextType = {
    currentVersion,
    availableVersions,
    bibleBooks,

    userProgress,
    dailyVerse,
    setCurrentVersion,
    updateProgress,
    markChapterAsRead,
    incrementMeditation,
    incrementLearningModule,
    loading,

    isInitialized,
    error,
    currentChapter,
    currentReference,

    navigateToChapter,
    goToNextChapter,
    goToPreviousChapter,
    getChapter,

    searchResults,
    searchVerses,
    clearSearch,
    isSearching,

    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    refreshBookmarks,

    highlights,
    highlightTags: bibleService.getHighlightTags(),
    addHighlight,
    removeHighlight,
    toggleHighlight,
    refreshHighlights,

    settings,
    updateSettings,

    formatReference,
    parseReference,
    getDefaultVersion,
    isTemporaryVersion,
    returnToDefaultVersion,

    booksStructured: bibleService.getBooks(),
    versionsStructured: [],

    getReadingStats,
  };

  return (
    <EnhancedBibleContext.Provider value={contextValue}>
      {children}
    </EnhancedBibleContext.Provider>
  );
};

export const BibleProvider = EnhancedBibleProvider;
