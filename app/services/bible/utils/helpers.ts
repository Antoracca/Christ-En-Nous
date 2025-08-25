// app/services/bible/utils/helpers.ts
// Fonctions utilitaires optimisées pour l'API Bible

import { BibleReference, BibleBook, BibleVerse, BibleAnalyticsEvent, BibleAnalyticsEventType } from '../types';
import { BIBLE_BOOKS, OSIS_TO_FRENCH, FRENCH_TO_OSIS, BOOK_BY_ORDER } from './constants';

/**
 * Validation et parsing des références bibliques
 */
export class BibleReferenceUtils {
  /**
   * Valide une référence biblique
   */
  static isValidReference(reference: BibleReference): boolean {
    const book = this.getBookByOsis(reference.book);
    if (!book) return false;
    
    if (reference.chapter < 1 || reference.chapter > book.chapters) return false;
    
    if (reference.verse !== undefined && reference.verse < 1) return false;
    
    if (reference.endVerse !== undefined) {
      if (reference.verse === undefined) return false;
      if (reference.endVerse < reference.verse) return false;
    }
    
    return true;
  }

  /**
   * Parse une référence textuelle (ex: "Jean 3:16" → BibleReference)
   */
  static parseReference(text: string): BibleReference | null {
    try {
      // Patterns supportés:
      // "Jean 3:16", "Jean 3:16-20", "Jean 3", "1 Corinthiens 13:4-7"
      const patterns = [
        /^(.+?)\s+(\d+):(\d+)-(\d+)$/,  // "Jean 3:16-20"
        /^(.+?)\s+(\d+):(\d+)$/,        // "Jean 3:16"
        /^(.+?)\s+(\d+)$/,              // "Jean 3"
      ];

      for (const pattern of patterns) {
        const match = text.trim().match(pattern);
        if (match) {
          const bookName = match[1].trim().toLowerCase();
          const osisCode = FRENCH_TO_OSIS.get(bookName);
          
          if (!osisCode) continue;

          const reference: BibleReference = {
            book: osisCode,
            chapter: parseInt(match[2], 10),
          };

          if (match[3]) {
            reference.verse = parseInt(match[3], 10);
          }
          
          if (match[4]) {
            reference.endVerse = parseInt(match[4], 10);
          }

          return this.isValidReference(reference) ? reference : null;
        }
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Formate une référence pour l'affichage
   */
  static formatReference(reference: BibleReference, includeVersion = false): string {
    const bookName = OSIS_TO_FRENCH.get(reference.book) || reference.book;
    
    let formatted = bookName;
    
    if (reference.chapter) {
      formatted += ` ${reference.chapter}`;
      
      if (reference.verse) {
        formatted += `:${reference.verse}`;
        
        if (reference.endVerse && reference.endVerse !== reference.verse) {
          formatted += `-${reference.endVerse}`;
        }
      }
    }
    
    if (includeVersion && reference.version) {
      formatted += ` (${reference.version})`;
    }
    
    return formatted;
  }

  /**
   * Génère un ID unique pour une référence (pour le cache)
   */
  static getReferenceId(reference: BibleReference): string {
    let id = `${reference.book}.${reference.chapter}`;
    if (reference.verse) {
      id += `.${reference.verse}`;
      if (reference.endVerse) {
        id += `-${reference.endVerse}`;
      }
    }
    if (reference.version) {
      id += `@${reference.version}`;
    }
    return id;
  }

  /**
   * Compare deux références
   */
  static compareReferences(a: BibleReference, b: BibleReference): number {
    const bookA = this.getBookByOsis(a.book);
    const bookB = this.getBookByOsis(b.book);
    
    if (!bookA || !bookB) return 0;
    
    // Comparer d'abord par ordre de livre
    if (bookA.order !== bookB.order) {
      return bookA.order - bookB.order;
    }
    
    // Puis par chapitre
    if (a.chapter !== b.chapter) {
      return a.chapter - b.chapter;
    }
    
    // Enfin par verset
    const verseA = a.verse || 0;
    const verseB = b.verse || 0;
    return verseA - verseB;
  }

  /**
   * Récupère un livre par code OSIS
   */
  static getBookByOsis(osisCode: string): BibleBook | null {
    return BIBLE_BOOKS.find(book => book.name === osisCode) || null;
  }

  /**
   * Récupère un livre par nom français
   */
  static getBookByFrenchName(frenchName: string): BibleBook | null {
    const osisCode = FRENCH_TO_OSIS.get(frenchName.toLowerCase());
    return osisCode ? this.getBookByOsis(osisCode) : null;
  }
}

/**
 * Utilitaires pour la navigation entre chapitres
 */
export class BibleNavigationUtils {
  /**
   * Obtient le chapitre suivant
   */
  static getNextChapter(reference: BibleReference): BibleReference | null {
    const book = BibleReferenceUtils.getBookByOsis(reference.book);
    if (!book) return null;

    // Si on peut avancer dans le livre actuel
    if (reference.chapter < book.chapters) {
      return {
        ...reference,
        chapter: reference.chapter + 1,
        verse: undefined,
        endVerse: undefined,
      };
    }

    // Sinon, passer au livre suivant
    const nextBook = BOOK_BY_ORDER.get(book.order + 1);
    if (!nextBook) return null;

    return {
      book: nextBook.name,
      chapter: 1,
      verse: undefined,
      endVerse: undefined,
      version: reference.version,
    };
  }

  /**
   * Obtient le chapitre précédent
   */
  static getPreviousChapter(reference: BibleReference): BibleReference | null {
    const book = BibleReferenceUtils.getBookByOsis(reference.book);
    if (!book) return null;

    // Si on peut reculer dans le livre actuel
    if (reference.chapter > 1) {
      return {
        ...reference,
        chapter: reference.chapter - 1,
        verse: undefined,
        endVerse: undefined,
      };
    }

    // Sinon, passer au livre précédent
    const prevBook = BOOK_BY_ORDER.get(book.order - 1);
    if (!prevBook) return null;

    return {
      book: prevBook.name,
      chapter: prevBook.chapters,
      verse: undefined,
      endVerse: undefined,
      version: reference.version,
    };
  }

  /**
   * Obtient tous les chapitres d'un livre
   */
  static getChaptersForBook(osisCode: string): number[] {
    const book = BibleReferenceUtils.getBookByOsis(osisCode);
    if (!book) return [];
    
    return Array.from({ length: book.chapters }, (_, i) => i + 1);
  }

  /**
   * Calcule le pourcentage de progression dans la Bible
   */
  static calculateBibleProgress(reference: BibleReference): number {
    const book = BibleReferenceUtils.getBookByOsis(reference.book);
    if (!book) return 0;

    // Nombre total de chapitres dans la Bible
    const totalChapters = BIBLE_BOOKS.reduce((sum, b) => sum + b.chapters, 0);
    
    // Chapitres complétés avant ce livre
    const completedChapters = BIBLE_BOOKS
      .filter(b => b.order < book.order)
      .reduce((sum, b) => sum + b.chapters, 0);
    
    // Chapitres complétés dans ce livre
    const currentBookProgress = reference.chapter - 1;
    
    const progress = (completedChapters + currentBookProgress) / totalChapters;
    return Math.round(progress * 100);
  }
}

/**
 * Utilitaires pour la recherche de texte
 */
export class BibleSearchUtils {
  /**
   * Normalise un texte pour la recherche
   */
  static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^\w\s]/g, ' ')       // Remplace la ponctuation par des espaces
      .replace(/\s+/g, ' ')           // Normalise les espaces
      .trim();
  }

  /**
   * Calcule un score de pertinence pour un résultat de recherche
   */
  static calculateRelevance(query: string, verse: BibleVerse): number {
    const normalizedQuery = this.normalizeText(query);
    const normalizedText = this.normalizeText(verse.text);
    
    let score = 0;
    
    // Correspondance exacte de phrase (score maximum)
    if (normalizedText.includes(normalizedQuery)) {
      score += 100;
    }
    
    // Correspondance de tous les mots
    const queryWords = normalizedQuery.split(' ').filter(w => w.length > 2);
    const textWords = normalizedText.split(' ');
    
    let matchingWords = 0;
    for (const queryWord of queryWords) {
      if (textWords.some(textWord => textWord.includes(queryWord))) {
        matchingWords++;
        score += 10;
      }
    }
    
    // Bonus pour un pourcentage élevé de mots correspondants
    if (queryWords.length > 0) {
      const matchPercentage = matchingWords / queryWords.length;
      score += Math.round(matchPercentage * 20);
    }
    
    return Math.min(score, 100);
  }

  /**
   * Met en évidence les termes de recherche dans un texte
   */
  static highlightSearchTerms(text: string, query: string): string {
    const normalizedQuery = this.normalizeText(query);
    const words = normalizedQuery.split(' ').filter(w => w.length > 2);
    
    let highlightedText = text;
    
    for (const word of words) {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    }
    
    return highlightedText;
  }
}

/**
 * Utilitaires pour la gestion du cache et du stockage
 */
export class BibleStorageUtils {
  /**
   * Génère une clé de cache pour un chapitre
   */
  static getChapterCacheKey(reference: BibleReference, version: string): string {
    return `chapter_${version}_${reference.book}_${reference.chapter}`;
  }

  /**
   * Génère une clé de cache pour une recherche
   */
  static getSearchCacheKey(query: string, version: string): string {
    const normalizedQuery = BibleSearchUtils.normalizeText(query);
    return `search_${version}_${Buffer.from(normalizedQuery).toString('base64')}`;
  }

  /**
   * Vérifie si une entrée de cache est encore valide
   */
  static isCacheValid(timestamp: string, ttl: number): boolean {
    const cacheTime = new Date(timestamp).getTime();
    const now = Date.now();
    return (now - cacheTime) < ttl;
  }

  /**
   * Nettoie les entrées de cache expirées
   */
  static cleanExpiredCache(cacheData: Record<string, any>, ttl: number): Record<string, any> {
    const cleaned: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(cacheData)) {
      if (value.timestamp && this.isCacheValid(value.timestamp, ttl)) {
        cleaned[key] = value;
      }
    }
    
    return cleaned;
  }
}

/**
 * Utilitaires pour les analytics et métriques
 */
export class BibleAnalyticsUtils {
  /**
   * Génère un événement d'analytics
   */
  static createEvent(type: BibleAnalyticsEventType, data: Record<string, any>): BibleAnalyticsEvent {
    return {
      type,
      data,
      timestamp: new Date().toISOString(),
      sessionId: this.generateSessionId(),
    };
  }

  /**
   * Génère un ID de session unique
   */
  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calcule les statistiques de lecture
   */
  static calculateReadingStats(progress: any[]): Record<string, number> {
    const stats = {
      totalChapters: progress.length,
      totalTimeSpent: progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
      completedBooks: new Set(progress.filter(p => p.isCompleted).map(p => p.book)).size,
      averageTimePerChapter: 0,
    };

    if (stats.totalChapters > 0) {
      stats.averageTimePerChapter = Math.round(stats.totalTimeSpent / stats.totalChapters);
    }

    return stats;
  }
}

/**
 * Debounce function pour optimiser les requêtes
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * Fonction de retry avec backoff exponentiel
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Backoff exponentiel avec jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}