// app/context/EnhancedBibleContext.tsx
// Context Bible amélioré utilisant les nouveaux services optimisés

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Import des nouveaux services
import { 
  bibleService, 
  initializeBibleServices,
  type BibleChapter,
  type BibleVerse,
  type BibleReference,
  type BibleBookmark,
  type VerseHighlight,
  type BibleSettings,
  type BibleSearchResult,
  type BibleBook as NewBibleBook,
  type BibleVersion as NewBibleVersion,
  type HighlightTag,
  BIBLE_BOOKS,
  Bible
} from '../services/bible';

// ==================== TYPES DE COMPATIBILITÉ ====================

// Adaptateurs pour maintenir la compatibilité avec l'ancien context
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

// ==================== INTERFACE DU CONTEXT ====================

interface EnhancedBibleContextType {
  // ===== COMPATIBILITÉ ANCIENNE API =====
  // Versions et livres (format ancien)
  currentVersion: BibleVersion;
  availableVersions: BibleVersion[];
  bibleBooks: BibleBook[];
  
  // Progression utilisateur (format ancien)
  userProgress: UserProgress;
  dailyVerse: DailyVerse;
  
  // Actions anciennes
  setCurrentVersion: (version: BibleVersion) => void;
  updateProgress: (progress: Partial<UserProgress>) => void;
  markChapterAsRead: (bookId: string, chapter: number) => void;
  incrementMeditation: () => void;
  incrementLearningModule: () => void;
  loading: boolean;

  // ===== NOUVELLES FONCTIONNALITÉS AMÉLIORÉES =====
  // État avancé
  isInitialized: boolean;
  error: string | null;
  currentChapter: BibleChapter | null;
  currentReference: BibleReference | null;

  // Lecture et navigation
  navigateToChapter: (reference: BibleReference) => Promise<void>;
  goToNextChapter: () => Promise<void>;
  goToPreviousChapter: () => Promise<void>;
  getChapter: (reference: BibleReference, version?: string) => Promise<BibleChapter | null>;
  
  // Recherche avancée
  searchResults: BibleSearchResult[];
  searchVerses: (query: string, maxResults?: number) => Promise<void>;
  clearSearch: () => void;
  isSearching: boolean;

  // Signets et favoris
  bookmarks: BibleBookmark[];
  addBookmark: (reference: BibleReference, title?: string, note?: string) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  isBookmarked: (reference: BibleReference) => Promise<boolean>;
  refreshBookmarks: () => Promise<void>;

  // Surlignages
  highlights: VerseHighlight[];
  highlightTags: HighlightTag[];
  addHighlight: (reference: BibleReference, tag: HighlightTag, note?: string) => Promise<void>;
  removeHighlight: (id: string) => Promise<void>;
  toggleHighlight: (reference: BibleReference, tag: HighlightTag) => Promise<void>;
  refreshHighlights: () => Promise<void>;

  // Paramètres
  settings: BibleSettings;
  updateSettings: (settings: Partial<BibleSettings>) => Promise<void>;

  // Utilitaires
  formatReference: (reference: BibleReference) => string;
  parseReference: (text: string) => BibleReference | null;
  
  // Nouvelles données structurées
  booksStructured: NewBibleBook[];
  versionsStructured: NewBibleVersion[];

  // Statistiques et analytiques
  getReadingStats: () => Promise<{
    totalChaptersRead: number;
    totalTimeSpent: number;
    booksCompleted: string[];
    bibleProgress: number;
  }>;
}

// ==================== CONTEXT ET PROVIDER ====================

const EnhancedBibleContext = createContext<EnhancedBibleContextType | undefined>(undefined);

export const useEnhancedBible = () => {
  const context = useContext(EnhancedBibleContext);
  if (!context) {
    throw new Error('useEnhancedBible must be used within an EnhancedBibleProvider');
  }
  return context;
};

// Maintenir la compatibilité avec l'ancienne API
export const useBible = useEnhancedBible;

// ==================== ADAPTATEURS DE DONNÉES ====================

// Convertit les nouveaux BibleBook vers l'ancien format
function adaptBooksToOldFormat(books: NewBibleBook[]): BibleBook[] {
  return books.map(book => ({
    id: book.name.toLowerCase(),
    name: book.frenchName,
    abbrev: book.abbrev || book.name,
    chapters: book.chapters,
    testament: book.testament === 'OLD' ? 'ancien' : 'nouveau'
  }));
}

// Convertit les nouvelles BibleVersion vers l'ancien format
function adaptVersionsToOldFormat(versions: NewBibleVersion[]): BibleVersion[] {
  return versions.map(version => ({
    id: version.id,
    name: version.name,
    abbrev: version.abbreviation,
    language: version.language.toLowerCase().includes('fr') ? 'fr' : 'en'
  }));
}

// ==================== PROVIDER PRINCIPAL ====================

export const EnhancedBibleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();

  // ===== ÉTATS LOCAUX =====
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour la compatibilité - Version par défaut Bible J.N. Darby français
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

  // États avancés
  const [currentChapter, setCurrentChapter] = useState<BibleChapter | null>(null);
  const [currentReference, setCurrentReference] = useState<BibleReference | null>(null);
  const [searchResults, setSearchResults] = useState<BibleSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [bookmarks, setBookmarks] = useState<BibleBookmark[]>([]);
  const [highlights, setHighlights] = useState<VerseHighlight[]>([]);
  const [settings, setSettings] = useState<BibleSettings>({
    version: 'a93a92589195411f-01', // Bible J.N. Darby par défaut
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

  // Verset du jour (statique pour l'instant)
  const [dailyVerse] = useState<DailyVerse>({
    verse: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.",
    reference: "Jean 3:16",
    date: new Date().toISOString().split('T')[0],
  });

  // ===== INITIALISATION =====
  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialiser les services Bible
      await initializeBibleServices();
      
      // Charger les données initiales
      await loadInitialData();
      
      setIsInitialized(true);
      console.log('✅ Enhanced Bible Context initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Enhanced Bible Context:', error);
      setError(error instanceof Error ? error.message : 'Erreur d\'initialisation');
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      // Charger les livres (adaptés)
      const structuredBooks = bibleService.getBooks();
      setBibleBooks(adaptBooksToOldFormat(structuredBooks));

      // Charger toutes les versions populaires (français + anglaises populaires)
      const versions = await bibleService.getVersions();
      const adaptedVersions = adaptVersionsToOldFormat(versions);
      setAvailableVersions(adaptedVersions);

      // Charger les paramètres utilisateur
      const userSettings = await bibleService.getSettings();
      setSettings(userSettings);
      
      // Charger la version depuis les paramètres utilisateur (persistance)
      const savedVersionId = userSettings.version;
      console.log('🔍 Version sauvegardée dans les paramètres:', savedVersionId);
      
      // Chercher cette version dans les versions disponibles
      let currentVersion = adaptedVersions.find(v => v.id === savedVersionId);
      
      // Si la version sauvegardée n'existe pas, utiliser la version par défaut
      if (!currentVersion) {
        console.log('⚠️ Version sauvegardée non trouvée, utilisation de la version par défaut');
        currentVersion = adaptedVersions.find(v => v.id === 'a93a92589195411f-01'); // Bible J.N. Darby
        
        // Si même la version par défaut n'est pas trouvée
        if (!currentVersion && adaptedVersions.length > 0) {
          currentVersion = adaptedVersions.find(v => v.language === 'fr') || adaptedVersions[0];
        }
        
        // Sauvegarder la nouvelle version par défaut
        if (currentVersion) {
          const versionId = currentVersion.id;
          await bibleService.updateSettings({ version: versionId });
          setSettings(prev => ({ ...prev, version: versionId }));
        }
      }
      
      // Mettre à jour la version courante
      const finalVersion = currentVersion || {
        id: 'a93a92589195411f-01',
        name: 'Bible J.N. Darby',
        abbrev: 'DARBY',
        language: 'fr'
      };
      
      console.log('✅ Version finale chargée:', finalVersion.name, '(ID:', finalVersion.id, ')');
      setCurrentVersionState(finalVersion);

      // Charger les signets et surlignages
      await refreshBookmarks();
      await refreshHighlights();

      // Charger les statistiques de lecture
      await loadReadingStats();

      console.log('✅ Données initiales chargées - Version:', finalVersion?.name || 'Louis Segond 1910');

    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const loadReadingStats = async () => {
    try {
      const stats = await bibleService.getReadingStats();
      setUserProgress(prev => ({
        ...prev,
        chaptersRead: stats.totalChaptersRead,
        progressPercentage: stats.bibleProgress,
      }));
    } catch (error) {
      console.error('Failed to load reading stats:', error);
    }
  };

  // ===== ACTIONS DE COMPATIBILITÉ =====
  const setCurrentVersion = useCallback(async (version: BibleVersion) => {
    console.log('🔄 Changement de version vers:', version.name, '(ID:', version.id, ')');
    
    try {
      // 1. Mettre à jour l'état local immédiatement
      setCurrentVersionState(version);
      
      // 2. Sauvegarder dans le service et le stockage
      await bibleService.setCurrentVersion(version.id);
      
      // 3. Mettre à jour les paramètres pour la persistance
      await bibleService.updateSettings({ version: version.id });
      setSettings(prev => ({ ...prev, version: version.id }));
      
      console.log('✅ Version changée et sauvegardée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors du changement de version:', error);
      // En cas d'erreur, revenir à la version précédente
      // setCurrentVersionState(currentVersion);
    }
  }, []);

  const updateProgress = useCallback((progress: Partial<UserProgress>) => {
    setUserProgress(prev => ({ ...prev, ...progress }));
  }, []);

  const markChapterAsRead = useCallback(async (bookId: string, chapter: number) => {
    try {
      // Convertir l'ancien format vers le nouveau
      const reference: BibleReference = { 
        book: bookId.toUpperCase(), 
        chapter 
      };
      
      await bibleService.updateReadingProgress(reference, 25); // Estimation de 25 versets
      
      // Mettre à jour les stats locales
      await loadReadingStats();
      
    } catch (error) {
      console.error('Failed to mark chapter as read:', error);
    }
  }, []);

  const incrementMeditation = useCallback(() => {
    setUserProgress(prev => ({
      ...prev,
      meditationsCount: prev.meditationsCount + 1,
    }));
  }, []);

  const incrementLearningModule = useCallback(() => {
    setUserProgress(prev => ({
      ...prev,
      learningModulesCompleted: prev.learningModulesCompleted + 1,
    }));
  }, []);

  // ===== NOUVELLES ACTIONS AVANCÉES =====
  const navigateToChapter = useCallback(async (reference: BibleReference) => {
    try {
      setLoading(true);
      const chapter = await bibleService.getChapter(reference);
      
      if (chapter) {
        setCurrentChapter(chapter);
        setCurrentReference(reference);
        
        // Mettre à jour la progression utilisateur avec les nouvelles données
        setUserProgress(prev => ({
          ...prev,
          currentBook: reference.book,
          currentChapter: reference.chapter,
          currentVerse: reference.verse || 1,
          lastReadDate: new Date().toISOString(),
        }));
        
        console.log('✅ Navigation réussie vers:', `${reference.book} ${reference.chapter}${reference.verse ? ':' + reference.verse : ''}`);
      }
    } catch (error) {
      console.error('Failed to navigate to chapter:', error);
      setError('Erreur lors de la navigation');
    } finally {
      setLoading(false);
    }
  }, []);

  const goToNextChapter = useCallback(async () => {
    if (!currentReference) return;
    
    const nextChapter = await bibleService.getNextChapter(currentReference);
    if (nextChapter) {
      const nextRef = { 
        book: nextChapter.book, 
        chapter: nextChapter.chapter 
      };
      await navigateToChapter(nextRef);
    }
  }, [currentReference, navigateToChapter]);

  const goToPreviousChapter = useCallback(async () => {
    if (!currentReference) return;
    
    const prevChapter = await bibleService.getPreviousChapter(currentReference);
    if (prevChapter) {
      const prevRef = { 
        book: prevChapter.book, 
        chapter: prevChapter.chapter 
      };
      await navigateToChapter(prevRef);
    }
  }, [currentReference, navigateToChapter]);

  const getChapter = useCallback(async (reference: BibleReference, version?: string) => {
    return bibleService.getChapter(reference, version);
  }, []);

  // Recherche
  const searchVerses = useCallback(async (query: string, maxResults = 25) => {
    try {
      setIsSearching(true);
      const results = await bibleService.searchVerses(query, { maxResults });
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  // Signets
  const refreshBookmarks = useCallback(async () => {
    try {
      const userBookmarks = await bibleService.getBookmarks();
      setBookmarks(userBookmarks);
    } catch (error) {
      console.error('Failed to refresh bookmarks:', error);
    }
  }, []);

  const addBookmark = useCallback(async (reference: BibleReference, title?: string, note?: string) => {
    try {
      await bibleService.addBookmark(reference, title, note);
      await refreshBookmarks();
    } catch (error) {
      console.error('Failed to add bookmark:', error);
    }
  }, [refreshBookmarks]);

  const removeBookmark = useCallback(async (id: string) => {
    try {
      await bibleService.removeBookmark(id);
      await refreshBookmarks();
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  }, [refreshBookmarks]);

  const isBookmarked = useCallback(async (reference: BibleReference) => {
    return bibleService.isBookmarked(reference);
  }, []);

  // Surlignages
  const refreshHighlights = useCallback(async () => {
    try {
      const userHighlights = await bibleService.getHighlights();
      setHighlights(userHighlights);
    } catch (error) {
      console.error('Failed to refresh highlights:', error);
    }
  }, []);

  const addHighlight = useCallback(async (reference: BibleReference, tag: HighlightTag, note?: string) => {
    try {
      await bibleService.addHighlight(reference, tag, note);
      await refreshHighlights();
    } catch (error) {
      console.error('Failed to add highlight:', error);
    }
  }, [refreshHighlights]);

  const removeHighlight = useCallback(async (id: string) => {
    try {
      await bibleService.removeHighlight(id);
      await refreshHighlights();
    } catch (error) {
      console.error('Failed to remove highlight:', error);
    }
  }, [refreshHighlights]);

  const toggleHighlight = useCallback(async (reference: BibleReference, tag: HighlightTag) => {
    try {
      await bibleService.toggleHighlight(reference, tag);
      await refreshHighlights();
    } catch (error) {
      console.error('Failed to toggle highlight:', error);
    }
  }, [refreshHighlights]);

  // Paramètres
  const updateSettings = useCallback(async (newSettings: Partial<BibleSettings>) => {
    try {
      await bibleService.updateSettings(newSettings);
      const updatedSettings = await bibleService.getSettings();
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  }, []);

  // Utilitaires
  const formatReference = useCallback((reference: BibleReference) => {
    return bibleService.formatReference(reference);
  }, []);

  const parseReference = useCallback((text: string) => {
    return bibleService.parseReference(text);
  }, []);

  const getReadingStats = useCallback(async () => {
    return bibleService.getReadingStats();
  }, []);

  // ===== CONTEXT VALUE =====
  const contextValue: EnhancedBibleContextType = {
    // Compatibilité ancienne API
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

    // Nouvelles fonctionnalités
    isInitialized,
    error,
    currentChapter,
    currentReference,
    
    // Navigation
    navigateToChapter,
    goToNextChapter,
    goToPreviousChapter,
    getChapter,
    
    // Recherche
    searchResults,
    searchVerses,
    clearSearch,
    isSearching,
    
    // Signets
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    refreshBookmarks,
    
    // Surlignages
    highlights,
    highlightTags: bibleService.getHighlightTags(),
    addHighlight,
    removeHighlight,
    toggleHighlight,
    refreshHighlights,
    
    // Paramètres
    settings,
    updateSettings,
    
    // Utilitaires
    formatReference,
    parseReference,
    
    // Nouvelles données
    booksStructured: bibleService.getBooks(),
    versionsStructured: [], // TODO: charger dynamiquement
    
    // Stats
    getReadingStats,
  };

  return (
    <EnhancedBibleContext.Provider value={contextValue}>
      {children}
    </EnhancedBibleContext.Provider>
  );
};

// Export pour compatibilité
export const BibleProvider = EnhancedBibleProvider;