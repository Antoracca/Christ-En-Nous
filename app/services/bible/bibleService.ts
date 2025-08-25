// app/services/bible/bibleService.ts
// Service principal orchestrant toutes les fonctionnalités Bible

import { 
  BibleBook, 
  BibleChapter, 
  BibleVerse, 
  BibleVersion,
  BibleReference, 
  BibleBookmark,
  VerseHighlight,
  BibleSettings,
  ReadingProgress,
  BibleSearchResult,
  BibleSearchFilters,
  HighlightTag,
  BibleAnalyticsEvent,
  BibleAnalyticsEventType
} from './types';

import { bibleApi } from './api/bibleApi';
import { bibleStorage } from './storage/bibleStorage';

import { 
  BIBLE_BOOKS, 
  HIGHLIGHT_TAGS, 
  POPULAR_BOOKS, 
  DEFAULT_SETTINGS,
  API_CONFIG,
  ERROR_MESSAGES 
} from './utils/constants';

import {
  BibleReferenceUtils,
  BibleNavigationUtils,
  BibleSearchUtils,
  BibleAnalyticsUtils,
  debounce
} from './utils/helpers';

/**
 * Service principal Bible avec toutes les fonctionnalités optimisées
 */
export class BibleService {
  private isInitialized = false;
  private currentVersion: string = API_CONFIG.DEFAULT_VERSION;
  private analyticsQueue: BibleAnalyticsEvent[] = [];

  // Debounced functions pour éviter les requêtes excessives
  private debouncedSearch = debounce(this.performSearch.bind(this), 300);
  private debouncedAnalytics = debounce(this.flushAnalytics.bind(this), 5000);

  /**
   * Initialise le service Bible
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing BibleService...');
      
      // Initialiser le stockage
      await bibleStorage.initialize();
      
      // Charger les paramètres utilisateur
      const settings = await bibleStorage.getSettings();
      this.currentVersion = settings.version;
      
      // Vérifier la santé de l'API
      const isApiHealthy = await bibleApi.checkHealth();
      if (!isApiHealthy) {
        console.warn('Bible API is not accessible - working in offline mode');
      }
      
      this.isInitialized = true;
      console.log('BibleService initialized successfully');
      
      // Analytics
      this.trackEvent('service_initialized', { 
        version: this.currentVersion,
        apiHealthy: isApiHealthy 
      });
      
    } catch (error) {
      console.error('Failed to initialize BibleService:', error);
      throw error;
    }
  }

  /**
   * Vérifie que le service est initialisé
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('BibleService must be initialized before use');
    }
  }

  // ==================== GESTION DES LIVRES ====================

  /**
   * Récupère tous les livres bibliques
   */
  getBooks(): BibleBook[] {
    return [...BIBLE_BOOKS];
  }

  /**
   * Récupère un livre par code OSIS
   */
  getBook(osisCode: string): BibleBook | null {
    return BibleReferenceUtils.getBookByOsis(osisCode);
  }

  /**
   * Récupère les livres populaires
   */
  getPopularBooks(): BibleBook[] {
    return POPULAR_BOOKS.map(osis => this.getBook(osis)).filter(Boolean) as BibleBook[];
  }

  /**
   * Filtre les livres par testament
   */
  getBooksByTestament(testament: 'OLD' | 'NEW'): BibleBook[] {
    return BIBLE_BOOKS.filter(book => book.testament === testament);
  }

  // ==================== GESTION DES VERSIONS ====================

  /**
   * Récupère les versions françaises : 1 réelle (Bible J.N. Darby) + 4 à venir
   */
  private async getFrenchVersions(): Promise<BibleVersion[]> {
    const defaultVersion = await this.getDefaultVersion();
    
    try {
      // Récupérer les versions françaises depuis l'API
      const apiResponse = await bibleApi.getBibles('fra');
      
      if (apiResponse.success && apiResponse.data && apiResponse.data.length > 0) {
        console.log('✅ Versions françaises récupérées depuis l\'API:', apiResponse.data.length);
        
        // Prendre seulement la première version française (Bible J.N. Darby) avec description corrigée
        const realVersion = {
          ...apiResponse.data[0],
          description: 'Traduction française', // Description corrigée
          isDefault: defaultVersion === apiResponse.data[0].id,
          isAvailable: true,
          comingSoon: false,
        };
        
        // 4 versions françaises à venir populaires
        const comingSoonVersions = [
          {
            id: 'french-lsg-1910',
            name: 'Louis Segond 1910',
            abbreviation: 'LSG',
            language: 'French',
            description: 'Bientôt disponible',
            copyright: 'Public Domain',
            isDefault: defaultVersion === 'french-lsg-1910',
            isOfflineAvailable: false,
            isAvailable: false,
            comingSoon: true,
          },
          {
            id: 'french-semeur-2000',
            name: 'Bible du Semeur',
            abbreviation: 'BDS',
            language: 'French',
            description: 'Bientôt disponible',
            copyright: '© Société Biblique Internationale',
            isDefault: defaultVersion === 'french-semeur-2000',
            isOfflineAvailable: false,
            isAvailable: false,
            comingSoon: true,
          },
          {
            id: 'french-tob',
            name: 'Traduction Oecuménique de la Bible',
            abbreviation: 'TOB',
            language: 'French',
            description: 'Bientôt disponible',
            copyright: '© Société Biblique Française',
            isDefault: defaultVersion === 'french-tob',
            isOfflineAvailable: false,
            isAvailable: false,
            comingSoon: true,
          },
          {
            id: 'french-jerusalem',
            name: 'Bible de Jérusalem',
            abbreviation: 'BJ',
            language: 'French',
            description: 'Bientôt disponible',
            copyright: '© Editions du Cerf',
            isDefault: defaultVersion === 'french-jerusalem',
            isOfflineAvailable: false,
            isAvailable: false,
            comingSoon: true,
          }
        ];
        
        return [realVersion, ...comingSoonVersions];
        
      } else {
        console.warn('⚠️ Pas de versions françaises de l\'API, utilisation du fallback');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des versions françaises:', error);
    }
    
    // Fallback avec la version française Bible J.N. Darby
    return [
      {
        id: 'a93a92589195411f-01',
        name: 'Bible J.N. Darby',
        abbreviation: 'DARBY',
        language: 'French',
        description: 'Traduction française',
        copyright: 'Public Domain',
        isDefault: defaultVersion === 'a93a92589195411f-01',
        isOfflineAvailable: false,
        isAvailable: true,
      },
      // 4 versions françaises à venir
      {
        id: 'french-lsg-1910',
        name: 'Louis Segond 1910',
        abbreviation: 'LSG',
        language: 'French',
        description: 'Bientôt disponible',
        copyright: 'Public Domain',
        isDefault: defaultVersion === 'french-lsg-1910',
        isOfflineAvailable: false,
        isAvailable: false,
        comingSoon: true,
      },
      {
        id: 'french-semeur-2000',
        name: 'Bible du Semeur',
        abbreviation: 'BDS',
        language: 'French',
        description: 'Bientôt disponible',
        copyright: '© Société Biblique Internationale',
        isDefault: defaultVersion === 'french-semeur-2000',
        isOfflineAvailable: false,
        isAvailable: false,
        comingSoon: true,
      },
      {
        id: 'french-tob',
        name: 'Traduction Oecuménique de la Bible',
        abbreviation: 'TOB',
        language: 'French',
        description: 'Bientôt disponible',
        copyright: '© Société Biblique Française',
        isDefault: defaultVersion === 'french-tob',
        isOfflineAvailable: false,
        isAvailable: false,
        comingSoon: true,
      },
      {
        id: 'french-jerusalem',
        name: 'Bible de Jérusalem',
        abbreviation: 'BJ',
        language: 'French',
        description: 'Bientôt disponible',
        copyright: '© Editions du Cerf',
        isDefault: defaultVersion === 'french-jerusalem',
        isOfflineAvailable: false,
        isAvailable: false,
        comingSoon: true,
      }
    ];
  }

  /**
   * Récupère les versions anglaises réelles depuis l'API + versions à venir
   */
  private async getEnglishVersions(): Promise<BibleVersion[]> {
    const defaultVersion = await this.getDefaultVersion();
    
    try {
      // Récupérer les versions anglaises depuis l'API
      const apiResponse = await bibleApi.getBibles('eng');
      
      if (apiResponse.success && apiResponse.data && apiResponse.data.length > 0) {
        console.log('✅ Versions anglaises récupérées depuis l\'API:', apiResponse.data.length);
        
        // Filtrer pour exclure "American Standard Version (Byzantine Text) with Apocrypha"
        const filteredVersions = apiResponse.data.filter(version => 
          !version.name.toLowerCase().includes('byzantine text') &&
          !version.name.toLowerCase().includes('apocrypha')
        );
        
        // Prendre les 8 premières versions filtrées de l'API
        const realVersions = filteredVersions.slice(0, 8).map(version => ({
          ...version,
          isDefault: defaultVersion === version.id,
          isAvailable: true,
          comingSoon: false,
        }));
        
        // Ajouter les versions à venir
        const comingSoonVersions = [
          {
            id: 'english-niv',
            name: 'New International Version',
            abbreviation: 'NIV',
            language: 'English',
            description: 'Bientôt disponible',
            copyright: '© Biblica, Inc.',
            isDefault: defaultVersion === 'english-niv',
            isOfflineAvailable: false,
            isAvailable: false,
            comingSoon: true,
          },
          {
            id: 'english-esv',
            name: 'English Standard Version',
            abbreviation: 'ESV',
            language: 'English',
            description: 'Bientôt disponible',
            copyright: '© Crossway Bibles',
            isDefault: defaultVersion === 'english-esv',
            isOfflineAvailable: false,
            isAvailable: false,
            comingSoon: true,
          },
          {
            id: 'english-nasb',
            name: 'New American Standard Bible',
            abbreviation: 'NASB',
            language: 'English',
            description: 'Bientôt disponible',
            copyright: '© The Lockman Foundation',
            isDefault: defaultVersion === 'english-nasb',
            isOfflineAvailable: false,
            isAvailable: false,
            comingSoon: true,
          },
          {
            id: 'english-nlt',
            name: 'New Living Translation',
            abbreviation: 'NLT',
            language: 'English',
            description: 'Bientôt disponible',
            copyright: '© Tyndale House Publishers',
            isDefault: defaultVersion === 'english-nlt',
            isOfflineAvailable: false,
            isAvailable: false,
            comingSoon: true,
          }
        ];
        
        return [...realVersions, ...comingSoonVersions];
        
      } else {
        console.warn('⚠️ Pas de versions anglaises de l\'API, utilisation du fallback');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des versions anglaises:', error);
    }
    
    // Fallback avec quelques versions connues qui fonctionnent
    return [
      // Version de fallback connue qui fonctionne
      {
        id: 'de4e12af7f28f599-02',
        name: 'King James Version',
        abbreviation: 'KJV',
        language: 'English',
        description: 'King James Version 1769',
        copyright: 'Public Domain',
        isDefault: defaultVersion === 'de4e12af7f28f599-02',
        isOfflineAvailable: false,
        isAvailable: true, // Réelle
      },
      // Versions à venir (grisées)  
      {
        id: 'english-niv',
        name: 'New International Version',
        abbreviation: 'NIV',
        language: 'English',
        description: 'Bientôt disponible',
        copyright: '© Biblica, Inc.',
        isDefault: defaultVersion === 'english-niv',
        isOfflineAvailable: false,
        isAvailable: false,
        comingSoon: true,
      }
    ];
  }

  /**
   * Récupère toutes les versions disponibles
   */
  async getVersions(language?: string): Promise<BibleVersion[]> {
    this.ensureInitialized();
    
    try {
      const frenchVersions = await this.getFrenchVersions();
      const englishVersions = await this.getEnglishVersions();
      
      if (language === 'fra') {
        return frenchVersions;
      } else if (language === 'eng') {
        return englishVersions;
      }
      
      // Retourner toutes les versions (réelles + à venir)
      const allVersions = [...frenchVersions, ...englishVersions];
      console.log(`📚 Versions chargées: ${allVersions.filter(v => v.isAvailable).length} disponibles + ${allVersions.filter(v => v.comingSoon).length} à venir`);
      
      return allVersions;
      
    } catch (error) {
      console.error('Error in getVersions:', error);
      // En cas d'erreur, retourner au minimum les versions de base
      return [...await this.getFrenchVersions(), ...await this.getEnglishVersions()];
    }
  }

  /**
   * Définit la version active
   */
  async setCurrentVersion(versionId: string): Promise<void> {
    this.ensureInitialized();
    
    const previousVersion = this.currentVersion;
    this.currentVersion = versionId;
    await bibleStorage.updateSettings({ version: versionId });
    
    // Vérifier si la nouvelle version est disponible
    const isComingSoon = this.isComingSoonVersion(versionId);
    const apiVersion = isComingSoon ? this.mapToAvailableVersion(versionId) : versionId;
    
    console.log(`🔄 Version changée: ${previousVersion} -> ${versionId}${isComingSoon ? ` (Temporaire: ${apiVersion})` : ''}`);
    
    this.trackEvent('version_changed', { 
      newVersion: versionId,
      previousVersion: previousVersion,
      isComingSoon,
      apiVersion: isComingSoon ? apiVersion : versionId
    });
  }

  /**
   * Récupère la version active
   */
  getCurrentVersion(): string {
    return this.currentVersion;
  }

  /**
   * Définit une version comme par défaut
   */
  async setDefaultVersion(versionId: string): Promise<void> {
    this.ensureInitialized();
    
    console.log(`📌 Définition de la version par défaut: ${versionId}`);
    
    // Mettre à jour les paramètres avec la nouvelle version par défaut
    await bibleStorage.updateSettings({ 
      defaultVersion: versionId,
      version: versionId // Aussi changer la version courante
    });
    
    this.currentVersion = versionId;
    
    this.trackEvent('default_version_changed', { 
      newDefaultVersion: versionId
    });
  }

  /**
   * Récupère la version par défaut de l'utilisateur
   */
  async getDefaultVersion(): Promise<string> {
    this.ensureInitialized();
    const settings = await this.getSettings();
    return settings.defaultVersion;
  }

  // ==================== LECTURE DE CHAPITRES ====================

  /**
   * Vérifie si une version est à venir (non encore disponible)
   */
  private isComingSoonVersion(versionId: string): boolean {
    const comingSoonVersions = [
      'french-lsg-1910', 'french-semeur-2000', 'french-tob', 'french-jerusalem',
      'english-niv', 'english-esv', 'english-nasb', 'english-nlt'
    ];
    return comingSoonVersions.includes(versionId);
  }

  /**
   * Mappe une version à venir vers une version réelle pour les tests
   */
  private mapToAvailableVersion(versionId: string): string {
    const mapping: Record<string, string> = {
      // Versions françaises à venir -> Bible J.N. Darby (version française qui fonctionne)
      'french-lsg-1910': 'a93a92589195411f-01',
      'french-semeur-2000': 'a93a92589195411f-01',
      'french-tob': 'a93a92589195411f-01',
      'french-jerusalem': 'a93a92589195411f-01',
      
      // Versions anglaises à venir -> KJV (version anglaise qui fonctionne)
      'english-niv': 'de4e12af7f28f599-02',
      'english-esv': 'de4e12af7f28f599-02',
      'english-nasb': 'de4e12af7f28f599-02',
      'english-nlt': 'de4e12af7f28f599-02',
    };
    
    return mapping[versionId] || versionId;
  }

  /**
   * Récupère un chapitre complet
   */
  async getChapter(reference: BibleReference, version?: string): Promise<BibleChapter | null> {
    this.ensureInitialized();
    
    if (!BibleReferenceUtils.isValidReference(reference)) {
      throw new Error(ERROR_MESSAGES.INVALID_REFERENCE);
    }

    const versionToUse = version || this.currentVersion;
    
    // Mapper vers une version réelle si c'est une version à venir
    const apiVersion = this.isComingSoonVersion(versionToUse) 
      ? this.mapToAvailableVersion(versionToUse)
      : versionToUse;
    
    console.log(`📖 Récupération chapitre ${reference.book} ${reference.chapter} (${versionToUse} -> ${apiVersion})`);
    
    try {
      const response = await bibleApi.getChapter(
        apiVersion,
        reference.book,
        reference.chapter
      );

      if (!response.success) {
        console.error('Failed to fetch chapter:', response.error);
        return null;
      }

      // Mettre à jour le progrès de lecture
      if (response.data) {
        await this.updateReadingProgress(reference, response.data.verses.length);
        
        this.trackEvent('chapter_read', {
          reference: BibleReferenceUtils.formatReference(reference),
          version: versionToUse, // Utiliser la version originale pour l'analytics
          apiVersion: apiVersion, // Ajouter la version API utilisée
          verseCount: response.data.verseCount,
          fromCache: response.cached || false
        });
      }

      return response.data;
      
    } catch (error) {
      console.error('Error fetching chapter:', error);
      throw new Error(ERROR_MESSAGES.CHAPTER_NOT_FOUND);
    }
  }

  /**
   * Navigation vers le chapitre suivant
   */
  async getNextChapter(currentReference: BibleReference): Promise<BibleChapter | null> {
    const nextRef = BibleNavigationUtils.getNextChapter(currentReference);
    return nextRef ? this.getChapter(nextRef) : null;
  }

  /**
   * Navigation vers le chapitre précédent
   */
  async getPreviousChapter(currentReference: BibleReference): Promise<BibleChapter | null> {
    const prevRef = BibleNavigationUtils.getPreviousChapter(currentReference);
    return prevRef ? this.getChapter(prevRef) : null;
  }

  // ==================== RECHERCHE ====================

  /**
   * Recherche des versets (avec debounce)
   */
  async searchVerses(
    query: string,
    filters: BibleSearchFilters = {},
    version?: string
  ): Promise<BibleSearchResult[]> {
    this.ensureInitialized();
    
    if (!query.trim()) return [];
    
    return new Promise((resolve) => {
      this.debouncedSearch(query, filters, version || this.currentVersion, resolve);
    });
  }

  /**
   * Effectue la recherche réelle
   */
  private async performSearch(
    query: string,
    filters: BibleSearchFilters,
    version: string,
    resolve: (results: BibleSearchResult[]) => void
  ): Promise<void> {
    try {
      // Mapper vers une version réelle si c'est une version à venir
      const apiVersion = this.isComingSoonVersion(version) 
        ? this.mapToAvailableVersion(version)
        : version;
      
      console.log(`🔍 Recherche "${query}" dans ${version} (API: ${apiVersion})`);
      
      const response = await bibleApi.searchVerses(apiVersion, query, {
        limit: filters.maxResults || 50,
        sort: 'relevance'
      });

      if (!response.success) {
        console.error('Search failed:', response.error);
        resolve([]);
        return;
      }

      // Traiter et enrichir les résultats
      const results = (response.data || [])
        .map(verse => this.enrichSearchResult(verse, query, filters))
        .filter(result => result.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance);

      // Analytics
      this.trackEvent('search_performed', {
        query,
        resultCount: results.length,
        filters,
        version, // Version originale
        apiVersion // Version API utilisée
      });

      resolve(results);
      
    } catch (error) {
      console.error('Search error:', error);
      resolve([]);
    }
  }

  /**
   * Enrichit un résultat de recherche avec des métadonnées
   */
  private enrichSearchResult(
    verse: BibleVerse, 
    query: string, 
    filters: BibleSearchFilters
  ): BibleSearchResult {
    const relevance = BibleSearchUtils.calculateRelevance(query, verse);
    const highlightedText = BibleSearchUtils.highlightSearchTerms(verse.text, query);
    
    // Déterminer le type de correspondance
    const normalizedQuery = BibleSearchUtils.normalizeText(query);
    const normalizedText = BibleSearchUtils.normalizeText(verse.text);
    
    let matchType: 'exact' | 'partial' | 'fuzzy' = 'fuzzy';
    
    if (normalizedText.includes(normalizedQuery)) {
      matchType = 'exact';
    } else if (normalizedQuery.split(' ').some(word => normalizedText.includes(word))) {
      matchType = 'partial';
    }

    return {
      verse,
      relevance,
      highlightedText,
      matchType,
      context: filters.includeContext ? this.generateContext(verse) : undefined
    };
  }

  /**
   * Génère du contexte pour un verset (versets adjacents)
   */
  private generateContext(verse: BibleVerse): string {
    // TODO: Implémenter la récupération du contexte
    return `Contexte pour ${BibleReferenceUtils.formatReference({
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse
    })}`;
  }

  // ==================== SIGNETS/FAVORIS ====================

  /**
   * Récupère tous les signets
   */
  async getBookmarks(): Promise<BibleBookmark[]> {
    this.ensureInitialized();
    return bibleStorage.getBookmarks();
  }

  /**
   * Ajoute un signet
   */
  async addBookmark(
    reference: BibleReference,
    title?: string,
    note?: string,
    color?: string
  ): Promise<BibleBookmark> {
    this.ensureInitialized();
    
    const bookmark = await bibleStorage.addBookmark({
      reference,
      title,
      note,
      color,
      tags: [],
    });

    this.trackEvent('verse_bookmarked', {
      reference: BibleReferenceUtils.formatReference(reference),
      hasNote: !!note,
      hasColor: !!color
    });

    return bookmark;
  }

  /**
   * Met à jour un signet
   */
  async updateBookmark(id: string, updates: Partial<BibleBookmark>): Promise<void> {
    this.ensureInitialized();
    return bibleStorage.updateBookmark(id, updates);
  }

  /**
   * Supprime un signet
   */
  async removeBookmark(id: string): Promise<void> {
    this.ensureInitialized();
    await bibleStorage.removeBookmark(id);
    
    this.trackEvent('bookmark_removed', { bookmarkId: id });
  }

  /**
   * Vérifie si une référence est dans les signets
   */
  async isBookmarked(reference: BibleReference): Promise<boolean> {
    const bookmarks = await this.getBookmarks();
    return bookmarks.some(b => 
      BibleReferenceUtils.compareReferences(b.reference, reference) === 0
    );
  }

  // ==================== SURLIGNAGES ====================

  /**
   * Récupère tous les surlignages
   */
  async getHighlights(): Promise<VerseHighlight[]> {
    this.ensureInitialized();
    return bibleStorage.getHighlights();
  }

  /**
   * Ajoute un surlignage
   */
  async addHighlight(
    reference: BibleReference,
    tag: HighlightTag,
    note?: string
  ): Promise<VerseHighlight> {
    this.ensureInitialized();
    
    const highlight = await bibleStorage.addHighlight({
      reference,
      tag,
      note
    });

    this.trackEvent('highlight_added', {
      reference: BibleReferenceUtils.formatReference(reference),
      tagId: tag.id,
      hasNote: !!note
    });

    return highlight;
  }

  /**
   * Supprime un surlignage
   */
  async removeHighlight(id: string): Promise<void> {
    this.ensureInitialized();
    await bibleStorage.removeHighlight(id);
    
    this.trackEvent('highlight_removed', { highlightId: id });
  }

  /**
   * Toggle un surlignage (ajoute ou supprime)
   */
  async toggleHighlight(
    reference: BibleReference,
    tag: HighlightTag
  ): Promise<VerseHighlight | null> {
    const highlights = await this.getHighlights();
    const existing = highlights.find(h => 
      BibleReferenceUtils.compareReferences(h.reference, reference) === 0 &&
      h.tag.id === tag.id
    );

    if (existing) {
      await this.removeHighlight(existing.id);
      return null;
    } else {
      return this.addHighlight(reference, tag);
    }
  }

  /**
   * Récupère les tags de surlignage disponibles
   */
  getHighlightTags(): HighlightTag[] {
    return [...HIGHLIGHT_TAGS];
  }

  // ==================== PARAMÈTRES ====================

  /**
   * Récupère les paramètres
   */
  async getSettings(): Promise<BibleSettings> {
    this.ensureInitialized();
    return bibleStorage.getSettings();
  }

  /**
   * Met à jour les paramètres
   */
  async updateSettings(settings: Partial<BibleSettings>): Promise<void> {
    this.ensureInitialized();
    
    // Mettre à jour la version courante si changée
    if (settings.version && settings.version !== this.currentVersion) {
      this.currentVersion = settings.version;
    }
    
    await bibleStorage.updateSettings(settings);
    
    this.trackEvent('settings_updated', { updatedFields: Object.keys(settings) });
  }

  // ==================== PROGRÈS DE LECTURE ====================

  /**
   * Récupère le progrès de lecture
   */
  async getReadingProgress(): Promise<ReadingProgress[]> {
    this.ensureInitialized();
    return bibleStorage.getReadingProgress();
  }

  /**
   * Met à jour le progrès de lecture pour un chapitre
   */
  async updateReadingProgress(
    reference: BibleReference,
    totalVerses: number,
    timeSpent = 0
  ): Promise<void> {
    this.ensureInitialized();
    
    const progress = BibleNavigationUtils.calculateBibleProgress(reference);
    
    await bibleStorage.updateReadingProgress({
      book: reference.book,
      chapter: reference.chapter,
      verse: reference.verse,
      progress,
      timeSpent,
      isCompleted: true
    });
  }

  /**
   * Calcule les statistiques de lecture globales
   */
  async getReadingStats(): Promise<{
    totalChaptersRead: number;
    totalTimeSpent: number;
    booksCompleted: string[];
    averageTimePerChapter: number;
    bibleProgress: number;
  }> {
    const progress = await this.getReadingProgress();
    
    const stats = BibleAnalyticsUtils.calculateReadingStats(progress);
    const booksCompleted = [...new Set(
      progress.filter(p => p.isCompleted).map(p => p.book)
    )];
    
    // Calculer le progrès global de la Bible
    const totalChapters = BIBLE_BOOKS.reduce((sum, book) => sum + book.chapters, 0);
    const bibleProgress = Math.round((progress.length / totalChapters) * 100);

    return {
      totalChaptersRead: stats.totalChapters,
      totalTimeSpent: stats.totalTimeSpent,
      booksCompleted,
      averageTimePerChapter: stats.averageTimePerChapter,
      bibleProgress
    };
  }

  // ==================== UTILITAIRES ====================

  /**
   * Formate une référence pour l'affichage
   */
  formatReference(reference: BibleReference, includeVersion = false): string {
    return BibleReferenceUtils.formatReference(reference, includeVersion);
  }

  /**
   * Parse une référence textuelle
   */
  parseReference(text: string): BibleReference | null {
    return BibleReferenceUtils.parseReference(text);
  }

  /**
   * Valide une référence
   */
  isValidReference(reference: BibleReference): boolean {
    return BibleReferenceUtils.isValidReference(reference);
  }

  // ==================== ANALYTICS ====================

  /**
   * Enregistre un événement d'analytics
   */
  private trackEvent(type: BibleAnalyticsEventType, data: Record<string, any>): void {
    const event = BibleAnalyticsUtils.createEvent(type, data);
    this.analyticsQueue.push(event);
    
    // Déclencher le flush avec debounce
    this.debouncedAnalytics();
  }

  /**
   * Envoie les événements d'analytics accumulés
   */
  private async flushAnalytics(): Promise<void> {
    if (this.analyticsQueue.length === 0) return;
    
    try {
      // TODO: Implémenter l'envoi vers un service d'analytics
      console.log('Analytics events:', this.analyticsQueue);
      
      this.analyticsQueue = [];
    } catch (error) {
      console.error('Failed to flush analytics:', error);
    }
  }

  // ==================== MAINTENANCE ====================

  /**
   * Nettoie les anciennes données
   */
  async cleanup(daysToKeep = 365): Promise<void> {
    this.ensureInitialized();
    await bibleStorage.cleanupOldData(daysToKeep);
  }

  /**
   * Vide le cache
   */
  async clearCache(): Promise<void> {
    await bibleApi.clearCache();
  }

  /**
   * Exporte les données utilisateur
   */
  async exportUserData(): Promise<any> {
    this.ensureInitialized();
    return bibleStorage.exportUserData();
  }

  /**
   * Récupère l'état de santé du service
   */
  async getHealthStatus(): Promise<{
    api: boolean;
    storage: boolean;
    cache: any;
    sync: any;
  }> {
    const [apiHealth, syncStatus] = await Promise.all([
      bibleApi.checkHealth(),
      bibleStorage.getSyncStatus()
    ]);

    return {
      api: apiHealth,
      storage: true, // TODO: implémenter des checks storage
      cache: bibleApi.getCacheStats(),
      sync: syncStatus
    };
  }
}

// Instance singleton
export const bibleService = new BibleService();