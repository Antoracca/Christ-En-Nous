// app/services/bible/api/bibleApi.ts
// API optimisée avec cache, retry et gestion d'erreurs

import AsyncStorage from '@react-native-async-storage/async-storage';
import { BibleVerse, BibleVersion, BibleChapter, ApiResponse, BibleApiConfig } from '../types';
import { API_CONFIG, CACHE_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '../utils/constants';
import { BibleStorageUtils, retryWithBackoff } from '../utils/helpers';

// Configuration par défaut
const defaultConfig: BibleApiConfig = {
  baseUrl: API_CONFIG.BASE_URL,
  apiKey: process.env.EXPO_PUBLIC_BIBLE_API_KEY || '',
  timeout: API_CONFIG.TIMEOUT,
  retryAttempts: API_CONFIG.RETRY_ATTEMPTS,
  retryDelay: API_CONFIG.RETRY_DELAY,
  cacheConfig: {
    ttl: CACHE_CONFIG.TTL,
    maxSize: CACHE_CONFIG.MAX_SIZE,
    version: CACHE_CONFIG.VERSION,
  },
};

// Interfaces pour les réponses de l'API Scripture
interface ScriptureApiBible {
  id: string;
  name: string;
  abbreviation: string;
  description?: string;
  language: {
    id: string;
    name: string;
    nameLocal: string;
  };
  countries: {
    id: string;
    name: string;
  }[];
}

interface ScriptureApiPassage {
  id: string;
  bibleId: string;
  bookId: string;
  chapterIds: string[];
  content: string;
  reference: string;
  verseCount: number;
  copyright?: string;
}

interface ScriptureApiSearchResult {
  query: string;
  limit: number;
  offset: number;
  total: number;
  verseCount: number;
  verses: {
    id: string;
    bibleId: string;
    bookId: string;
    chapterId: string;
    text: string;
    reference: string;
  }[];
}

/**
 * Classe principale pour l'API Bible avec fonctionnalités avancées
 */
export class BibleApi {
  private config: BibleApiConfig;
  private cache: Map<string, any> = new Map();

  constructor(config: Partial<BibleApiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.loadCacheFromStorage();
  }

  /**
   * Charge le cache depuis AsyncStorage
   */
  private async loadCacheFromStorage(): Promise<void> {
    try {
      const cacheData = await AsyncStorage.getItem(STORAGE_KEYS.CACHE);
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        
        // Nettoyer les entrées expirées
        const cleaned = BibleStorageUtils.cleanExpiredCache(
          parsed, 
          this.config.cacheConfig.ttl
        );
        
        // Reconstruire le Map cache
        for (const [key, value] of Object.entries(cleaned)) {
          this.cache.set(key, value);
        }
        
        console.log(`Cache loaded: ${this.cache.size} entries`);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du cache:', error);
      this.cache.clear();
    }
  }

  /**
   * Sauvegarde le cache dans AsyncStorage
   */
  private async saveCacheToStorage(): Promise<void> {
    try {
      // Limiter la taille du cache
      if (this.cache.size > this.config.cacheConfig.maxSize) {
        this.pruneCache();
      }

      const cacheObject = Object.fromEntries(this.cache);
      await AsyncStorage.setItem(STORAGE_KEYS.CACHE, JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cache:', error);
    }
  }

  /**
   * Nettoie le cache en gardant les entrées les plus récentes
   */
  private pruneCache(): void {
    const entries = Array.from(this.cache.entries());
    
    // Trier par timestamp (plus récent en premier)
    entries.sort((a, b) => {
      const timestampA = new Date(a[1].timestamp || 0).getTime();
      const timestampB = new Date(b[1].timestamp || 0).getTime();
      return timestampB - timestampA;
    });

    // Garder seulement les plus récentes
    const keepCount = Math.floor(this.config.cacheConfig.maxSize * 0.8);
    const toKeep = entries.slice(0, keepCount);

    this.cache.clear();
    for (const [key, value] of toKeep) {
      this.cache.set(key, value);
    }

    console.log(`Cache pruned: kept ${toKeep.length} entries`);
  }

  /**
   * Fait une requête HTTP avec retry et gestion d'erreurs
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    // Créer AbortController pour le timeout (compatible React Native)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    };

    try {
      const response = await retryWithBackoff(
        async () => {
          const res = await fetch(url, requestOptions);
          
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          
          return res;
        },
        this.config.retryAttempts,
        this.config.retryDelay
      );

      const data = await response.json();
      
      // Annuler le timeout car la requête a réussi
      clearTimeout(timeoutId);

      return {
        data: data.data || data,
        success: true,
        cached: false,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error(`API Request failed for ${url}:`, error);
      
      let errorMessage: string = ERROR_MESSAGES.API_ERROR;
      
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          errorMessage = 'Délai d\'attente dépassé. Vérifiez votre connexion.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = ERROR_MESSAGES.NO_INTERNET;
        }
      }

      return {
        data: null as any,
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    } finally {
      // Nettoyer le timeout pour éviter les fuites mémoire
      clearTimeout(timeoutId);
    }
  }

  /**
   * Obtient une réponse du cache ou fait une requête
   */
  private async getCachedOrFetch<T>(
    cacheKey: string,
    fetcher: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> {
    // Vérifier le cache d'abord
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      
      if (BibleStorageUtils.isCacheValid(cached.timestamp, this.config.cacheConfig.ttl)) {
        console.log(`Cache hit for: ${cacheKey}`);
        return { ...cached, cached: true };
      } else {
        // Supprimer l'entrée expirée
        this.cache.delete(cacheKey);
      }
    }

    // Faire la requête
    console.log(`Cache miss for: ${cacheKey}`);
    const response = await fetcher();

    // Mettre en cache si succès
    if (response.success && response.data) {
      this.cache.set(cacheKey, response);
      this.saveCacheToStorage(); // Async, sans attendre
    }

    return response;
  }

  /**
   * Récupère toutes les versions de Bible disponibles
   */
  async getBibles(language: string = ''): Promise<ApiResponse<BibleVersion[]>> {
    const cacheKey = language ? `bibles_${language}` : 'bibles_all';
    
    return this.getCachedOrFetch(cacheKey, async () => {
      // Si pas de langue spécifiée, récupérer toutes les Bibles
      const endpoint = language ? `/bibles?language=${language}` : '/bibles';
      console.log(`🔗 API Call: ${this.config.baseUrl}${endpoint}`);
      
      const response = await this.makeRequest<ScriptureApiBible[]>(endpoint);

      if (!response.success || !response.data) {
        return {
          data: [],
          success: false,
          error: response.error,
          timestamp: response.timestamp
        } as ApiResponse<BibleVersion[]>;
      }

      // Transformer les données
      const versions: BibleVersion[] = response.data.map(bible => ({
        id: bible.id,
        name: bible.name,
        abbreviation: bible.abbreviation,
        language: bible.language.nameLocal || bible.language.name,
        description: bible.description || bible.name,
        copyright: bible.name, // API ne fournit pas de copyright séparé
        isDefault: bible.id === API_CONFIG.DEFAULT_VERSION,
        isOfflineAvailable: false, // TODO: implémenter le mode offline
      }));

      return {
        ...response,
        data: versions,
      };
    });
  }

  /**
   * Récupère un chapitre spécifique
   */
  async getChapter(
    bibleId: string, 
    bookId: string, 
    chapter: number
  ): Promise<ApiResponse<BibleChapter | null>> {
    const passageId = `${bookId}.${chapter}`;
    const cacheKey = BibleStorageUtils.getChapterCacheKey(
      { book: bookId, chapter }, 
      bibleId
    );

    return this.getCachedOrFetch(cacheKey, async () => {
      const params = new URLSearchParams({
        'content-type': 'text',
        'include-notes': 'false',
        'include-titles': 'false',
        'include-chapter-numbers': 'false',
        'include-verse-numbers': 'true',
        'include-verse-spans': 'true',
      });

      const response = await this.makeRequest<ScriptureApiPassage>(
        `/bibles/${bibleId}/passages/${passageId}?${params}`
      );

      if (!response.success || !response.data) {
        return {
          data: null,
          success: false,
          error: response.error,
          timestamp: response.timestamp
        } as ApiResponse<BibleChapter | null>;
      }

      // Parser le contenu en versets
      const verses = this.parseVersesFromContent(
        response.data.content,
        bookId,
        chapter,
        bibleId
      );

      const bibleChapter: BibleChapter = {
        book: bookId,
        chapter,
        verses,
        verseCount: verses.length,
        id: `${bibleId}_${passageId}`,
      };

      return {
        ...response,
        data: bibleChapter,
      } as ApiResponse<BibleChapter | null>;
    });
  }

  /**
   * Parse le contenu HTML/texte en versets individuels
   */
  private parseVersesFromContent(
    content: string,
    bookId: string,
    chapter: number,
    bibleId: string
  ): BibleVerse[] {
    const verses: BibleVerse[] = [];
    
    // Pattern pour matcher les versets avec leurs numéros
    // Format de l'API: [1] Texte du verset [2] Autre texte...
    const versePattern = /\s*\[(\d+)\]\s*([\s\S]*?)(?=\s*\[\d+\]|$)/g;
    
    let match;
    while ((match = versePattern.exec(content)) !== null) {
      const verseNumber = parseInt(match[1], 10);
      const verseText = match[2].trim();
      
      if (verseText) {
        verses.push({
          book: bookId,
          chapter,
          verse: verseNumber,
          text: verseText,
          version: bibleId,
          id: `${bibleId}_${bookId}.${chapter}.${verseNumber}`,
        });
      }
    }
    
    // Fallback: si le parsing échoue, essayer un pattern plus simple
    if (verses.length === 0) {
      const lines = content.split('\n').filter(line => line.trim());
      for (let i = 0; i < lines.length; i++) {
        verses.push({
          book: bookId,
          chapter,
          verse: i + 1,
          text: lines[i].trim(),
          version: bibleId,
          id: `${bibleId}_${bookId}.${chapter}.${i + 1}`,
        });
      }
    }

    return verses.sort((a, b) => a.verse - b.verse);
  }

  /**
   * Recherche dans une version de Bible
   */
  async searchVerses(
    bibleId: string,
    query: string,
    options: {
      limit?: number;
      offset?: number;
      sort?: 'relevance' | 'canonical';
      range?: string; // ex: "GEN-REV" ou "GEN.1-GEN.3"
    } = {}
  ): Promise<ApiResponse<BibleVerse[]>> {
    const cacheKey = BibleStorageUtils.getSearchCacheKey(query, bibleId);
    
    return this.getCachedOrFetch(cacheKey, async () => {
      const params = new URLSearchParams({
        query,
        limit: (options.limit || 50).toString(),
        offset: (options.offset || 0).toString(),
        sort: options.sort || 'relevance',
        ...(options.range && { range: options.range }),
      });

      const response = await this.makeRequest<ScriptureApiSearchResult>(
        `/bibles/${bibleId}/search?${params}`
      );

      if (!response.success || !response.data) {
        return {
          data: [],
          success: false,
          error: response.error,
          timestamp: response.timestamp
        } as ApiResponse<BibleVerse[]>;
      }

      // Transformer les résultats
      const verses: BibleVerse[] = response.data.verses.map(verse => {
        // Parser la référence pour extraire le chapitre et le verset
        const refMatch = verse.reference.match(/(\w+)\s+(\d+):(\d+)/);
        const chapter = refMatch ? parseInt(refMatch[2], 10) : 1;
        const verseNum = refMatch ? parseInt(refMatch[3], 10) : 1;

        return {
          book: verse.bookId,
          chapter,
          verse: verseNum,
          text: verse.text,
          version: bibleId,
          id: verse.id,
        };
      });

      return {
        ...response,
        data: verses,
      };
    });
  }

  /**
   * Vide le cache
   */
  async clearCache(): Promise<void> {
    this.cache.clear();
    await AsyncStorage.removeItem(STORAGE_KEYS.CACHE);
    console.log('Cache cleared');
  }

  /**
   * Obtient les statistiques du cache
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    // TODO: implémenter le tracking du hit rate
    return {
      size: this.cache.size,
      maxSize: this.config.cacheConfig.maxSize,
      hitRate: 0, // Placeholder
    };
  }

  /**
   * Vérifie si l'API est accessible
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Test simple sans paramètres pour vérifier l'API
      const response = await this.makeRequest('/bibles');
      return response.success;
    } catch {
      return false;
    }
  }
}

// Instance singleton
export const bibleApi = new BibleApi();