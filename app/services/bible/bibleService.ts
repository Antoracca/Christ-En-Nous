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
  ERROR_MESSAGES,
  OSIS_TO_FRENCH
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
        
        // Filtrer pour exclure les versions indésirables
        const versionsToExclude = [
          'byzantine text',
          'apocrypha',
          'english majority text version',
          'emtv' // Acronyme pour English Majority Text Version
        ];

        const filteredVersions = apiResponse.data.filter(version => {
          const versionName = version.name.toLowerCase();
          const versionId = version.id.toLowerCase();
          const versionAbbr = version.abbreviation.toLowerCase();

          return !versionsToExclude.some(excludeTerm => 
            versionName.includes(excludeTerm) ||
            versionId.includes(excludeTerm) ||
            versionAbbr.includes(excludeTerm)
          );
        });
        
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
   * Récupère les versions Sango (République Centrafricaine)
   */
  private async getSangoVersions(): Promise<BibleVersion[]> {
    try {
      console.log('🇨🇫 Récupération des versions Sango...');
      
      // Récupérer les Bibles Sango depuis l'API avec le code langue ISO
      const apiResponse = await bibleApi.getBiblesByLanguage('sag');
      
      if (apiResponse.success && apiResponse.data && apiResponse.data.length > 0) {
        console.log(`✅ ${apiResponse.data.length} version(s) Sango trouvée(s) dans l'API`);
        
        // Convertir les données API en format BibleVersion
        const sangoVersions: BibleVersion[] = apiResponse.data.map((bible, index) => ({
          id: bible.id,
          name: bible.name,
          abbreviation: bible.abbreviation || 'SANGO',
          language: 'Sango',
          description: `${bible.description || 'Bible en Sango'} - République Centrafricaine`,
          isAvailable: true,
          comingSoon: false,
          isDefault: false,
          copyright: `© ${bible.description || 'Société Biblique de Centrafrique'}`
        }));
        
        console.log('📖 Versions Sango récupérées:', sangoVersions.map(v => `${v.name} (${v.id})`));
        return sangoVersions;
        
      } else {
        console.warn('⚠️ Aucune version Sango trouvée dans l\'API Scripture');
        console.info('💡 Le Sango n\'est pas encore disponible dans API.Bible avec cette clé');
        
        // Retourner une version "À venir" au lieu d'une fausse version disponible
        return [{
          id: 'sango-not-available',
          name: 'Mbeti ti Nzapa - Sängö',
          abbreviation: 'MNF2010',
          language: 'Sango',
          description: 'Bible en Sango - Société Biblique de Centrafrique (non disponible dans API.Bible)',
          isAvailable: false,
          comingSoon: true,
          isDefault: false,
          copyright: '© Société Biblique de Centrafrique 2010'
        }];
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des versions Sango:', error);
      
      // En cas d'erreur, retourner une version "À venir"
      return [{
        id: 'sango-error',
        name: 'Mbeti ti Nzapa - Sängö',
        abbreviation: 'MNF2010',
        language: 'Sango',
        description: 'Bible en Sango (erreur de connexion à l\'API)',
        isAvailable: false,
        comingSoon: true,
        isDefault: false,
        copyright: '© Société Biblique de Centrafrique'
      }];
    }
  }

  /**
   * Récupère toutes les versions disponibles
   */
  async getVersions(language?: string): Promise<BibleVersion[]> {
    this.ensureInitialized();
    
    try {
      const frenchVersions = await this.getFrenchVersions();
      const englishVersions = await this.getEnglishVersions();
      const sangoVersions = await this.getSangoVersions();
      
      if (language === 'fra') {
        return frenchVersions;
      } else if (language === 'eng') {
        return englishVersions;
      } else if (language === 'sag') {
        return sangoVersions;
      }
      
      // Retourner toutes les versions (réelles + à venir)
      const allVersions = [...frenchVersions, ...englishVersions, ...sangoVersions];
      console.log(`📚 Versions chargées: ${allVersions.filter(v => v.isAvailable).length} disponibles + ${allVersions.filter(v => v.comingSoon).length} à venir`);
      console.log(`🇨🇫 Versions Sango: ${sangoVersions.length}`);
      
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

  /**
   * Vérifie si la version courante est temporaire (différente de la version par défaut)
   */
  async isTemporaryVersion(): Promise<boolean> {
    this.ensureInitialized();
    const defaultVersion = await this.getDefaultVersion();
    return this.currentVersion !== defaultVersion;
  }

  /**
   * Retourne à la version par défaut
   */
  async returnToDefaultVersion(): Promise<void> {
    this.ensureInitialized();
    const defaultVersion = await this.getDefaultVersion();
    if (this.currentVersion !== defaultVersion) {
      await this.setCurrentVersion(defaultVersion);
      console.log(`🔄 Retour à la version par défaut: ${defaultVersion}`);
    }
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
   * Détermine si une version est française (détection améliorée)
   */
  private isFrenchVersion(versionId: string): boolean {
    // IDs de versions françaises connues
    const knownFrenchVersions = [
      'a93a92589195411f-01',  // Bible J.N. Darby
      'french-lsg-1910',
      'french-semeur-2000', 
      'french-tob',
      'french-jerusalem'
    ];
    
    // Patterns français
    const frenchPatterns = [
      'french',
      'francais', 
      'français',
      'fr_',
      '_fr',
      'darby',
      'segond',
      'semeur',
      'jerusalem',
      'tob'
    ];
    
    const versionLower = versionId.toLowerCase();
    
    // Vérification directe
    if (knownFrenchVersions.includes(versionId)) return true;
    
    // Vérification par patterns
    return frenchPatterns.some(pattern => versionLower.includes(pattern.toLowerCase()));
  }

  /**
   * Mappe les codes OSIS vers les codes acceptés par l'API Scripture selon la langue
   */
  private mapBookCodeToApiFormat(bookCode: string, versionId: string): string {
    const isFrench = this.isFrenchVersion(versionId);
    
    // Mapping spécifique aux versions FRANÇAISES (codes des constants)
    const frenchMapping: Record<string, string> = {
      // AT français - utiliser codes des constants
      'GEN': 'GEN', 'EXO': 'EXO', 'LEV': 'LEV', 'NUM': 'NUM', 'DEU': 'DEU',
      'JOS': 'JOS', 'JDG': 'JDG', 'RUT': 'RUT', 
      '1SA': '1SA', '2SA': '2SA', '1KI': '1KI', '2KI': '2KI',
      '1CH': '1CH', '2CH': '2CH', 'EZR': 'EZR', 'NEH': 'NEH', 'EST': 'EST',
      'JOB': 'JOB', 'PSA': 'PSA', 'PRO': 'PRO', 'ECC': 'ECC', 'SNG': 'SNG',
      'ISA': 'ISA', 'JER': 'JER', 'LAM': 'LAM', 'EZK': 'EZK', 'DAN': 'DAN',  // ✅ EZK pas EZE
      'HOS': 'HOS', 'JOL': 'JOL', 'AMO': 'AMO', 'OBA': 'OBA', 'JON': 'JON',
      'MIC': 'MIC', 'NAM': 'NAM', 'HAB': 'HAB', 'ZEP': 'ZEP', 'HAG': 'HAG',  // ✅ NAM pas NAH
      'ZEC': 'ZEC', 'MAL': 'MAL',
      // NT français - utiliser codes des constants
      'MAT': 'MAT', 'MRK': 'MRK', 'LUK': 'LUK', 'JHN': 'JHN', 'ACT': 'ACT',  // ✅ JHN pas JOH
      'ROM': 'ROM', '1CO': '1CO', '2CO': '2CO', 'GAL': 'GAL', 'EPH': 'EPH',
      'PHP': 'PHP', 'COL': 'COL', '1TH': '1TH', '2TH': '2TH',
      '1TI': '1TI', '2TI': '2TI', 'TIT': 'TIT', 'PHM': 'PHM',
      'HEB': 'HEB', 'JAS': 'JAS', '1PE': '1PE', '2PE': '2PE',
      '1JN': '1JN', '2JN': '2JN', '3JN': '3JN', 'JUD': 'JUD', 'REV': 'REV'
    };
    
    // Mapping spécifique aux versions ANGLAISES (basé sur Scripture API variations)
    const englishMapping: Record<string, string> = {
      // AT anglais - Torah/Pentateuque (standards)
      'GEN': 'GEN', 'EXO': 'EXO', 'LEV': 'LEV', 'NUM': 'NUM', 'DEU': 'DEU',
      
      // Livres historiques (standards)
      'JOS': 'JOS', 'JDG': 'JDG', 'RUT': 'RUT', 
      '1SA': '1SA', '2SA': '2SA', '1KI': '1KI', '2KI': '2KI',
      '1CH': '1CH', '2CH': '2CH', 'EZR': 'EZR', 'NEH': 'NEH', 'EST': 'EST',
      
      // Livres poétiques (standards)
      'JOB': 'JOB', 'PSA': 'PSA', 'PRO': 'PRO', 'ECC': 'ECC', 'SNG': 'SNG',
      
      // Grands prophètes (avec variations API anglaises)
      'ISA': 'ISA', 'JER': 'JER', 'LAM': 'LAM', 'EZK': 'EZK', 'DAN': 'DAN',
      
      // Petits prophètes (avec variations API courantes)
      'HOS': 'HOS', 'JOL': 'JOL', 'AMO': 'AMO', 'OBA': 'OBA', 'JON': 'JON',
      'MIC': 'MIC', 'NAM': 'NAM', 'HAB': 'HAB', 'ZEP': 'ZEP', 'HAG': 'HAG',
      'ZEC': 'ZEC', 'MAL': 'MAL',
      
      // NT anglais - Évangiles
      'MAT': 'MAT', 'MRK': 'MRK', 'LUK': 'LUK', 'JHN': 'JHN', 'ACT': 'ACT',
      
      // Épîtres pauliniennes
      'ROM': 'ROM', '1CO': '1CO', '2CO': '2CO', 'GAL': 'GAL', 'EPH': 'EPH',
      'PHP': 'PHP', 'COL': 'COL', 
      '1TH': '1TH', '2TH': '2TH',  // Garder standard d'abord, fallback ensuite
      
      // Épîtres pastorales
      '1TI': '1TI', '2TI': '2TI', 'TIT': 'TIT', 'PHM': 'PHM',
      
      // Épîtres générales
      'HEB': 'HEB', 'JAS': 'JAS', '1PE': '1PE', '2PE': '2PE',
      '1JN': '1JN', '2JN': '2JN', '3JN': '3JN', 'JUD': 'JUD',
      
      // Apocalypse
      'REV': 'REV'
    };
    
    const mapping = isFrench ? frenchMapping : englishMapping;
    const mappedCode = mapping[bookCode];
    
    if (!mappedCode) {
      console.warn(`⚠️ Code livre non mappé (${isFrench ? 'FR' : 'EN'}): ${bookCode} - utilisation directe`);
      return bookCode;
    }
    
    console.log(`📚 Mapping livre: ${bookCode} -> ${mappedCode} (${isFrench ? 'FR' : 'EN'})`);
    return mappedCode;
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
    
    // ✅ NOUVEAU: Mapper le code du livre vers le format API selon la langue
    const apiBookCode = this.mapBookCodeToApiFormat(reference.book, apiVersion);
    
    console.log(`📖 Récupération chapitre ${reference.book} -> ${apiBookCode} ${reference.chapter} (${versionToUse} -> ${apiVersion})`);
    
    try {
      const response = await bibleApi.getChapter(
        apiVersion,
        apiBookCode,
        reference.chapter
      );

      if (!response.success) {
        console.error('Failed to fetch chapter:', response.error);
        console.error(`❌ API Error: ${reference.book} -> ${apiBookCode} ${reference.chapter} (Version: ${apiVersion})`);
        
        // ✅ FALLBACK INTELLIGENT: Essayer toutes les variations connues
        const isFrench = this.isFrenchVersion(apiVersion);
        console.log(`🔄 Tentative fallback pour ${reference.book} (${isFrench ? 'FR' : 'EN'})...`);
        
        // Définir toutes les variations possibles par livre
        const allVariations: Record<string, string[]> = {
          // Grands prophètes (harmonisation EZK)
          'EZK': isFrench ? ['EZK'] : ['EZK', 'EZEK', 'EZE'],
          
          // Petits prophètes (harmonisation NAM)
          'NAM': isFrench ? ['NAM'] : ['NAM', 'NAH', 'NAHUM'],
          'JOL': isFrench ? ['JOL'] : ['JOL', 'JOEL'],
          'OBA': isFrench ? ['OBA'] : ['OBA', 'OBAD', 'OBADIAH'],
          'JON': isFrench ? ['JON'] : ['JON', 'JONAH'],
          'HAB': isFrench ? ['HAB'] : ['HAB', 'HABAKKUK'],
          'ZEP': isFrench ? ['ZEP'] : ['ZEP', 'ZEPH', 'ZEPHANIAH'],
          'HAG': isFrench ? ['HAG'] : ['HAG', 'HAGGAI'],
          'ZEC': isFrench ? ['ZEC'] : ['ZEC', 'ZECH', 'ZECHARIAH'],
          'MAL': isFrench ? ['MAL'] : ['MAL', 'MALACHI'],
          
          // Nouveau Testament (harmonisation JHN)
          'JHN': isFrench ? ['JHN'] : ['JHN', 'JOH', 'JOHN'],
          '1TH': isFrench ? ['1TH'] : ['1TH', '1THS', '1THESS', 'THI'],
          '2TH': isFrench ? ['2TH'] : ['2TH', '2THS', '2THESS'],
          'PHM': isFrench ? ['PHM'] : ['PHM', 'PHLM', 'PHILEMON'],
          'JUD': isFrench ? ['JUD'] : ['JUD', 'JUDE'],
          'REV': isFrench ? ['REV'] : ['REV', 'REVELATION'],
          
          // Autres variations possibles
          '1JN': ['1JN', '1JO'],  // Codes français alternatifs
          '2JN': ['2JN', '2JO'],
          '3JN': ['3JN', '3JO'],
          'SNG': ['SNG', 'SON', 'SOL'],  // Cantique des cantiques
        };
        
        const variations = allVariations[reference.book];
        if (variations && variations.length > 1) {
          console.log(`🔄 Codes à tester pour ${reference.book}: [${variations.join(', ')}]`);
          
          for (const altCode of variations) {
            if (altCode === apiBookCode) continue; // Skip déjà testé
            
            console.log(`🔄 Essai avec ${altCode}...`);
            const altResponse = await bibleApi.getChapter(apiVersion, altCode, reference.chapter);
            if (altResponse.success) {
              console.log(`✅ SUCCÈS avec code alternatif: ${reference.book} -> ${altCode}`);
              // Sauvegarder cette découverte pour les prochains appels
              return altResponse.data;
            }
          }
        }
        
        // Dernier recours: essayer quelques codes universels
        if (!isFrench) {
          console.log('🔄 Tentative codes universels anglais...');
          const universalTries = [
            reference.book.toLowerCase(),
            reference.book.toUpperCase(),
            reference.book.charAt(0).toUpperCase() + reference.book.slice(1).toLowerCase()
          ];
          
          for (const tryCode of universalTries) {
            if (tryCode === apiBookCode) continue;
            console.log(`🔄 Essai universel: ${tryCode}...`);
            const altResponse = await bibleApi.getChapter(apiVersion, tryCode, reference.chapter);
            if (altResponse.success) {
              console.log(`✅ SUCCÈS universel: ${reference.book} -> ${tryCode}`);
              return altResponse.data;
            }
          }
        }
        
        return null;
      }

      // if (response.data) {
      //   await this.updateReadingProgress(reference, response.data.verses.length);
        
      //   this.trackEvent('chapter_read', {
      //     reference: BibleReferenceUtils.formatReference(reference),
      //     version: versionToUse, // Utiliser la version originale pour l'analytics
      //     apiVersion: apiVersion, // Ajouter la version API utilisée
      //     verseCount: response.data.verseCount,
      //     fromCache: response.cached || false
      //   });
      // }

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
   * Détecte si une requête est une recherche de référence biblique
   */
  private isReferenceQuery(query: string, verse: BibleVerse): boolean {
    // Patterns de références : "Jean 1:2", "Matthieu 5:3-7", "Genèse 1"
    const referencePatterns = [
      /^(.+?)\s+(\d+):(\d+)(-\d+)?$/,  // "Jean 1:2" ou "Jean 1:2-5"
      /^(.+?)\s+(\d+)$/,               // "Jean 1"
    ];

    for (const pattern of referencePatterns) {
      const match = query.trim().match(pattern);
      if (match) {
        const bookName = match[1].toLowerCase();
        const chapter = parseInt(match[2], 10);
        const verseNum = match[3] ? parseInt(match[3], 10) : undefined;

        // Vérifier si ça correspond au verset trouvé
        const frenchBookName = OSIS_TO_FRENCH.get(verse.book)?.toLowerCase();
        const bookMatches = frenchBookName === bookName || verse.book.toLowerCase() === bookName;
        const chapterMatches = verse.chapter === chapter;
        const verseMatches = !verseNum || verse.verse === verseNum;

        console.log('🔍 Vérification référence:', {
          query,
          bookName,
          chapter,
          verseNum,
          verseBook: verse.book,
          frenchBookName,
          bookMatches,
          chapterMatches,
          verseMatches
        });

        return bookMatches && chapterMatches && verseMatches;
      }
    }

    return false;
  }

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
    
    // Essayer différentes variantes pour les termes problématiques
    const alternativeQueries = this.getAlternativeQueries(query);
    console.log('🔍 Requêtes alternatives générées:', alternativeQueries);
    
    return new Promise((resolve) => {
      this.debouncedSearch(query, filters, version || this.currentVersion, resolve);
    });
  }

  /**
   * Génère des variantes alternatives pour des termes de recherche problématiques
   */
  private getAlternativeQueries(query: string): string[] {
    const alternatives: string[] = [query];
    
    const commonAlternatives: Record<string, string[]> = {
      // Pour Jésus : chercher les formes composées car il n'apparaît jamais seul
      'jésus': ['jesus', 'JESUS', 'christ', 'jésus christ', 'christ jésus'],
      'jesus': ['jésus', 'JESUS', 'christ', 'jésus christ', 'christ jésus'],
       'Jésus': ['jesus', 'JESUS', 'christ', 'jésus christ', 'christ jésus'],
      'JESUS': ['jesus', 'jésus', 'christ', 'jésus christ', 'christ jésus'],
       'JESUS-CHRIST': ['jesus-christ', 'JESUS-CHRIST', 'christ jésus', 'jésus christ', 'christ jesus'],
       'JESUS-CHRIST-EN': ['jesus-christ-en', 'JESUS-CHRIST-EN', 'christ jésus en', 'jésus christ en', 'christ jesus en'],
       
       // Marie peut avoir différentes variantes
      'marie': ['marie', 'Marie', 'MARIE'],
      
      // Dieu peut avoir différentes formes  
      'dieu': ['dieu', 'Dieu', 'DIEU'],
      
      // Références bibliques avec chiffres - chercher directement le verset spécifique
      '1 pierre 2:5': ['pierre pierre', 'Pierre Pierre', 'pierre pierre fondement'],
      '1 pierre': ['pierre pierre', 'Pierre Pierre'],
      '2 pierre': ['pierre pierre', 'Pierre Pierre'],  
      '1 jean': ['jean jean', 'Jean Jean'],
      '2 jean': ['jean jean', 'Jean Jean'],
      '3 jean': ['jean jean', 'Jean Jean'],
      '1 corinthiens': ['corinthiens', 'Corinthiens'],
      '2 corinthiens': ['corinthiens', 'Corinthiens'],
      '1 samuel': ['samuel', 'Samuel'],
      '2 samuel': ['samuel', 'Samuel'],
      '1 rois': ['rois', 'Rois'],
      '2 rois': ['rois', 'Rois'],
      '1 chroniques': ['chroniques', 'Chroniques'],
      '2 chroniques': ['chroniques', 'Chroniques'],
      '1 thessaloniciens': ['thessaloniciens', 'Thessaloniciens'],
      '2 thessaloniciens': ['thessaloniciens', 'Thessaloniciens'],
      '1 timothée': ['timothée', 'Timothée'],
      '2 timothée': ['timothée', 'Timothée'],
      
      // Autres termes composés courants
      'jésus christ': ['jesus christ', 'christ jésus', 'christ'],
      'jesus christ': ['jésus christ', 'christ jésus', 'christ'],
      'christ jésus': ['christ jesus', 'jésus christ', 'christ'],
      'christ jesus': ['christ jésus', 'jésus christ', 'christ'],
    };
    
    const normalizedQuery = query.toLowerCase();
    
    // Chercher les alternatives exactes
    if (commonAlternatives[normalizedQuery]) {
      alternatives.push(...commonAlternatives[normalizedQuery]);
    }
    
    // Détecter les patterns de références bibliques avec chiffres
    const referencePatterns = [
      /^(1|2|3)\s+(pierre|jean|corinthiens|samuel|rois|chroniques|thessaloniciens|timothée)(\s+\d+:\d+)?$/,
    ];
    
    for (const pattern of referencePatterns) {
      const match = normalizedQuery.match(pattern);
      if (match) {
        const number = match[1];
        const bookName = match[2];
        const reference = match[3] || '';
        
        console.log(`🔍 Référence détectée: ${number} ${bookName}${reference}`);
        
        // Ajouter des alternatives spécifiques pour les livres avec chiffres
        switch (bookName) {
          case 'pierre':
            alternatives.push('pierre pierre', 'Pierre Pierre', 'pierre');
            if (reference === ' 2:5') {
              alternatives.push('pierre pierre fondement', 'pierre vive', 'pierre angulaire');
            }
            break;
          case 'jean':
            alternatives.push('jean jean', 'Jean Jean', 'jean');
            break;
          case 'corinthiens':
            alternatives.push('corinthiens', 'Corinthiens');
            break;
          case 'samuel':
            alternatives.push('samuel', 'Samuel');
            break;
          case 'rois':
            alternatives.push('rois', 'Rois');
            break;
          case 'chroniques':
            alternatives.push('chroniques', 'Chroniques');
            break;
          case 'thessaloniciens':
            alternatives.push('thessaloniciens', 'Thessaloniciens');
            break;
          case 'timothée':
            alternatives.push('timothée', 'Timothée');
            break;
        }
        break;
      }
    }
    
    return [...new Set(alternatives)]; // Supprimer les doublons
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
      
      // Essayer d'abord la requête originale
      let response = await bibleApi.searchVerses(apiVersion, query, {
        limit: filters.maxResults || 50,
        sort: 'relevance'
      });

      // Si pas de résultats, essayer les variantes
      if (!response.success || !response.data || response.data.length === 0) {
        console.log('🔄 Aucun résultat avec la requête originale, test des variantes...');
        
        const alternatives = this.getAlternativeQueries(query);
        for (const altQuery of alternatives.slice(1)) { // Skip la première qui est l'originale
          console.log(`🔍 Test variante: "${altQuery}"`);
          
          const altResponse = await bibleApi.searchVerses(apiVersion, altQuery, {
            limit: filters.maxResults || 50,
            sort: 'relevance'
          });

          if (altResponse.success && altResponse.data && altResponse.data.length > 0) {
            console.log(`✅ Résultats trouvés avec la variante: "${altQuery}"`);
            response = altResponse;
            break;
          }
        }
      }

      if (!response.success) {
        console.error('Search failed:', response.error);
        resolve([]);
        return;
      }

      // Traiter et enrichir les résultats
      console.log('🔄 Traitement de', response.data?.length || 0, 'versets trouvés');
      
      const results = (response.data || [])
        .map(verse => this.enrichSearchResult(verse, query, filters))
        .filter(result => result.relevance > 0) // Remettre le filtre avec le nouvel algorithme
        .sort((a, b) => b.relevance - a.relevance);

      console.log('✅ Résultats finaux:', results.length, 'après traitement');

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
    console.log('🔍 Enrichissement résultat:', {
      query,
      verseText: verse.text,
      verseBook: verse.book,
      verseRef: `${verse.chapter}:${verse.verse}`
    });

    // Détecter si c'est une recherche de référence biblique
    const isReferenceSearch = this.isReferenceQuery(query, verse);
    
    let relevance: number;
    if (isReferenceSearch) {
      // Pour les recherches de références, donner un score élevé
      relevance = 100;
      console.log('📍 Détection de recherche de référence → score maximal');
    } else {
      // Pour les recherches de texte, utiliser l'algorithme normal
      relevance = BibleSearchUtils.calculateRelevance(query, verse);
    }
    
    const highlightedText = BibleSearchUtils.highlightSearchTerms(verse.text, query);
    
    console.log('📊 Pertinence calculée:', relevance);
    
    // Déterminer le type de correspondance de manière plus précise
    const normalizedQuery = BibleSearchUtils.normalizeText(query);
    const normalizedText = BibleSearchUtils.normalizeText(verse.text);
    const queryWords = normalizedQuery.split(' ').filter(w => w.length > 1);
    const textWords = normalizedText.split(' ');
    
    let matchType: 'exact' | 'partial' | 'fuzzy' = 'fuzzy';
    
    // Correspondance exacte : tous les mots de la requête sont trouvés exactement
    const exactMatches = queryWords.filter(queryWord => 
      textWords.some(textWord => textWord === queryWord)
    ).length;
    
    // Correspondance partielle : au moins un mot est trouvé (exactement ou partiellement)
    const partialMatches = queryWords.filter(queryWord => 
      textWords.some(textWord => 
        textWord.includes(queryWord) || queryWord.includes(textWord)
      )
    ).length;
    
    if (isReferenceSearch) {
      matchType = 'exact'; // Les recherches de références sont toujours exactes
    } else if (exactMatches === queryWords.length && queryWords.length > 0) {
      matchType = 'exact';
    } else if (partialMatches > 0) {
      matchType = 'partial';
    }

    const result = {
      verse,
      relevance,
      highlightedText,
      matchType,
      context: filters.includeContext ? this.generateContext(verse) : undefined
    };

    console.log('✅ Résultat enrichi:', {
      relevance: result.relevance,
      matchType: result.matchType,
      hasHighlight: !!result.highlightedText
    });

    return result;
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
   *
   * Accept both the strongly-typed BibleAnalyticsEventType and plain string literals
   * to allow flexible event names (casted when creating the event).
   */
  private trackEvent(type: BibleAnalyticsEventType | string, data: Record<string, any>): void {
    // Cast to the expected type for the analytics utility (safe since utility handles unknowns)
    const event = BibleAnalyticsUtils.createEvent(type as BibleAnalyticsEventType, data);
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