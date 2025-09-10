// app/services/bible/utils/constants.ts
// Constantes et données bibliques corrigées et optimisées

import { BibleBook, HighlightTag } from '../types';

// Configuration API
export const API_CONFIG = {
  BASE_URL: 'https://api.scripture.api.bible/v1' as const,
  DEFAULT_VERSION: 'a93a92589195411f-01', // Bible J.N. Darby (French)
  TIMEOUT: 10000 as const, // 10 secondes
  RETRY_ATTEMPTS: 3 as const,
  RETRY_DELAY: 1000 as const, // 1 seconde
};

// Configuration cache
export const CACHE_CONFIG = {
  TTL: 24 * 60 * 60 * 1000, // 24 heures
  MAX_SIZE: 100, // 100 chapitres max
  VERSION: '1.0.0',
} as const;

// Clés AsyncStorage
export const STORAGE_KEYS = {
  BOOKMARKS: '@bible_bookmarks_v2',
  HIGHLIGHTS: '@bible_highlights_v2', 
  SETTINGS: '@bible_settings_v2',
  PROGRESS: '@bible_progress_v2',
  CACHE: '@bible_cache_v2',
  VERSIONS: '@bible_versions_v2',
  LAST_READING_POSITION: '@bible_last_position_v2',
} as const;

// Tags de surlignage standardisés
export const HIGHLIGHT_TAGS: HighlightTag[] = [
  { id: 'yellow', label: 'Jaune', color: '#FFE066', description: 'Passage important', order: 1 },
  { id: 'green', label: 'Vert', color: '#4ADE80', description: 'Promesse', order: 2 },
  { id: 'blue', label: 'Bleu', color: '#60A5FA', description: 'Étude approfondie', order: 3 },
  { id: 'purple', label: 'Violet', color: '#A78BFA', description: 'Prière', order: 4 },
  { id: 'orange', label: 'Orange', color: '#FB923C', description: 'Action requise', order: 5 },
  { id: 'red', label: 'Rouge', color: '#EF4444', description: 'Avertissement', order: 6 },
  { id: 'pink', label: 'Rose', color: '#F472B6', description: 'Amour/Grâce', order: 7 },
  { id: 'gray', label: 'Gris', color: '#9CA3AF', description: 'Question/Réflexion', order: 8 },
];

// Base de données complète des livres bibliques (codes OSIS corrigés)
export const BIBLE_BOOKS: BibleBook[] = [
  // ===== ANCIEN TESTAMENT =====
  // Pentateuque (Loi)
  { name: 'GEN', frenchName: 'Genèse', testament: 'OLD', chapters: 50, category: 'LAW', abbrev: 'Gn', order: 1 },
  { name: 'EXO', frenchName: 'Exode', testament: 'OLD', chapters: 40, category: 'LAW', abbrev: 'Ex', order: 2 },
  { name: 'LEV', frenchName: 'Lévitique', testament: 'OLD', chapters: 27, category: 'LAW', abbrev: 'Lv', order: 3 },
  { name: 'NUM', frenchName: 'Nombres', testament: 'OLD', chapters: 36, category: 'LAW', abbrev: 'Nb', order: 4 },
  { name: 'DEU', frenchName: 'Deutéronome', testament: 'OLD', chapters: 34, category: 'LAW', abbrev: 'Dt', order: 5 },
  
  // Livres historiques
  { name: 'JOS', frenchName: 'Josué', testament: 'OLD', chapters: 24, category: 'HISTORY', abbrev: 'Jos', order: 6 },
  { name: 'JDG', frenchName: 'Juges', testament: 'OLD', chapters: 21, category: 'HISTORY', abbrev: 'Jg', order: 7 },
  { name: 'RUT', frenchName: 'Ruth', testament: 'OLD', chapters: 4, category: 'HISTORY', abbrev: 'Rt', order: 8 },
  { name: '1SA', frenchName: '1 Samuel', testament: 'OLD', chapters: 31, category: 'HISTORY', abbrev: '1S', order: 9 },
  { name: '2SA', frenchName: '2 Samuel', testament: 'OLD', chapters: 24, category: 'HISTORY', abbrev: '2S', order: 10 },
  { name: '1KI', frenchName: '1 Rois', testament: 'OLD', chapters: 22, category: 'HISTORY', abbrev: '1R', order: 11 },
  { name: '2KI', frenchName: '2 Rois', testament: 'OLD', chapters: 25, category: 'HISTORY', abbrev: '2R', order: 12 },
  { name: '1CH', frenchName: '1 Chroniques', testament: 'OLD', chapters: 29, category: 'HISTORY', abbrev: '1Ch', order: 13 },
  { name: '2CH', frenchName: '2 Chroniques', testament: 'OLD', chapters: 36, category: 'HISTORY', abbrev: '2Ch', order: 14 },
  { name: 'EZR', frenchName: 'Esdras', testament: 'OLD', chapters: 10, category: 'HISTORY', abbrev: 'Esd', order: 15 },
  { name: 'NEH', frenchName: 'Néhémie', testament: 'OLD', chapters: 13, category: 'HISTORY', abbrev: 'Né', order: 16 },
  { name: 'EST', frenchName: 'Esther', testament: 'OLD', chapters: 10, category: 'HISTORY', abbrev: 'Est', order: 17 },
  
  // Livres poétiques et de sagesse
  { name: 'JOB', frenchName: 'Job', testament: 'OLD', chapters: 42, category: 'POETRY', abbrev: 'Jb', order: 18 },
  { name: 'PSA', frenchName: 'Psaumes', testament: 'OLD', chapters: 150, category: 'POETRY', abbrev: 'Ps', order: 19 },
  { name: 'PRO', frenchName: 'Proverbes', testament: 'OLD', chapters: 31, category: 'POETRY', abbrev: 'Pr', order: 20 },
  { name: 'ECC', frenchName: 'Ecclésiaste', testament: 'OLD', chapters: 12, category: 'POETRY', abbrev: 'Ec', order: 21 },
  { name: 'SNG', frenchName: 'Cantique des Cantiques', testament: 'OLD', chapters: 8, category: 'POETRY', abbrev: 'Ct', order: 22 },
  
  // Grands prophètes
  { name: 'ISA', frenchName: 'Ésaïe', testament: 'OLD', chapters: 66, category: 'PROPHETS', abbrev: 'És', order: 23 },
  { name: 'JER', frenchName: 'Jérémie', testament: 'OLD', chapters: 52, category: 'PROPHETS', abbrev: 'Jr', order: 24 },
  { name: 'LAM', frenchName: 'Lamentations', testament: 'OLD', chapters: 5, category: 'PROPHETS', abbrev: 'Lm', order: 25 },
  { name: 'EZK', frenchName: 'Ézéchiel', testament: 'OLD', chapters: 48, category: 'PROPHETS', abbrev: 'Éz', order: 26 },
  { name: 'DAN', frenchName: 'Daniel', testament: 'OLD', chapters: 12, category: 'PROPHETS', abbrev: 'Dn', order: 27 },
  
  // Petits prophètes
  { name: 'HOS', frenchName: 'Osée', testament: 'OLD', chapters: 14, category: 'PROPHETS', abbrev: 'Os', order: 28 },
  { name: 'JOL', frenchName: 'Joël', testament: 'OLD', chapters: 3, category: 'PROPHETS', abbrev: 'Jl', order: 29 },
  { name: 'AMO', frenchName: 'Amos', testament: 'OLD', chapters: 9, category: 'PROPHETS', abbrev: 'Am', order: 30 },
  { name: 'OBA', frenchName: 'Abdias', testament: 'OLD', chapters: 1, category: 'PROPHETS', abbrev: 'Ab', order: 31 },
  { name: 'JON', frenchName: 'Jonas', testament: 'OLD', chapters: 4, category: 'PROPHETS', abbrev: 'Jon', order: 32 },
  { name: 'MIC', frenchName: 'Michée', testament: 'OLD', chapters: 7, category: 'PROPHETS', abbrev: 'Mi', order: 33 },
  { name: 'NAM', frenchName: 'Nahum', testament: 'OLD', chapters: 3, category: 'PROPHETS', abbrev: 'Na', order: 34 },
  { name: 'HAB', frenchName: 'Habacuc', testament: 'OLD', chapters: 3, category: 'PROPHETS', abbrev: 'Ha', order: 35 },
  { name: 'ZEP', frenchName: 'Sophonie', testament: 'OLD', chapters: 3, category: 'PROPHETS', abbrev: 'So', order: 36 },
  { name: 'HAG', frenchName: 'Aggée', testament: 'OLD', chapters: 2, category: 'PROPHETS', abbrev: 'Ag', order: 37 },
  { name: 'ZEC', frenchName: 'Zacharie', testament: 'OLD', chapters: 14, category: 'PROPHETS', abbrev: 'Za', order: 38 },
  { name: 'MAL', frenchName: 'Malachie', testament: 'OLD', chapters: 4, category: 'PROPHETS', abbrev: 'Ml', order: 39 },
  
  // ===== NOUVEAU TESTAMENT =====
  // Évangiles
  { name: 'MAT', frenchName: 'Matthieu', testament: 'NEW', chapters: 28, category: 'GOSPELS', abbrev: 'Mt', order: 40 },
  { name: 'MRK', frenchName: 'Marc', testament: 'NEW', chapters: 16, category: 'GOSPELS', abbrev: 'Mc', order: 41 },
  { name: 'LUK', frenchName: 'Luc', testament: 'NEW', chapters: 24, category: 'GOSPELS', abbrev: 'Lc', order: 42 },
  { name: 'JHN', frenchName: 'Jean', testament: 'NEW', chapters: 21, category: 'GOSPELS', abbrev: 'Jn', order: 43 },
  
  // Actes
  { name: 'ACT', frenchName: 'Actes', testament: 'NEW', chapters: 28, category: 'ACTS', abbrev: 'Ac', order: 44 },
  
  // Épîtres pauliniennes
  { name: 'ROM', frenchName: 'Romains', testament: 'NEW', chapters: 16, category: 'EPISTLES', abbrev: 'Rm', order: 45 },
  { name: '1CO', frenchName: '1 Corinthiens', testament: 'NEW', chapters: 16, category: 'EPISTLES', abbrev: '1Co', order: 46 },
  { name: '2CO', frenchName: '2 Corinthiens', testament: 'NEW', chapters: 13, category: 'EPISTLES', abbrev: '2Co', order: 47 },
  { name: 'GAL', frenchName: 'Galates', testament: 'NEW', chapters: 6, category: 'EPISTLES', abbrev: 'Ga', order: 48 },
  { name: 'EPH', frenchName: 'Éphésiens', testament: 'NEW', chapters: 6, category: 'EPISTLES', abbrev: 'Ép', order: 49 },
  { name: 'PHP', frenchName: 'Philippiens', testament: 'NEW', chapters: 4, category: 'EPISTLES', abbrev: 'Ph', order: 50 },
  { name: 'COL', frenchName: 'Colossiens', testament: 'NEW', chapters: 4, category: 'EPISTLES', abbrev: 'Col', order: 51 },
  { name: '1TH', frenchName: '1 Thessaloniciens', testament: 'NEW', chapters: 5, category: 'EPISTLES', abbrev: '1Th', order: 52 },
  { name: '2TH', frenchName: '2 Thessaloniciens', testament: 'NEW', chapters: 3, category: 'EPISTLES', abbrev: '2Th', order: 53 },
  { name: '1TI', frenchName: '1 Timothée', testament: 'NEW', chapters: 6, category: 'EPISTLES', abbrev: '1Ti', order: 54 },
  { name: '2TI', frenchName: '2 Timothée', testament: 'NEW', chapters: 4, category: 'EPISTLES', abbrev: '2Ti', order: 55 },
  { name: 'TIT', frenchName: 'Tite', testament: 'NEW', chapters: 3, category: 'EPISTLES', abbrev: 'Tt', order: 56 },
  { name: 'PHM', frenchName: 'Philémon', testament: 'NEW', chapters: 1, category: 'EPISTLES', abbrev: 'Phm', order: 57 },
  
  // Épîtres générales
  { name: 'HEB', frenchName: 'Hébreux', testament: 'NEW', chapters: 13, category: 'EPISTLES', abbrev: 'Hé', order: 58 },
  { name: 'JAS', frenchName: 'Jacques', testament: 'NEW', chapters: 5, category: 'EPISTLES', abbrev: 'Jc', order: 59 },
  { name: '1PE', frenchName: '1 Pierre', testament: 'NEW', chapters: 5, category: 'EPISTLES', abbrev: '1P', order: 60 },
  { name: '2PE', frenchName: '2 Pierre', testament: 'NEW', chapters: 3, category: 'EPISTLES', abbrev: '2P', order: 61 },
  { name: '1JN', frenchName: '1 Jean', testament: 'NEW', chapters: 5, category: 'EPISTLES', abbrev: '1Jn', order: 62 },
  { name: '2JN', frenchName: '2 Jean', testament: 'NEW', chapters: 1, category: 'EPISTLES', abbrev: '2Jn', order: 63 },
  { name: '3JN', frenchName: '3 Jean', testament: 'NEW', chapters: 1, category: 'EPISTLES', abbrev: '3Jn', order: 64 },
  { name: 'JUD', frenchName: 'Jude', testament: 'NEW', chapters: 1, category: 'EPISTLES', abbrev: 'Jd', order: 65 },
  
  // Apocalypse
  { name: 'REV', frenchName: 'Apocalypse', testament: 'NEW', chapters: 22, category: 'REVELATION', abbrev: 'Ap', order: 66 },
];

// Maps pour des accès rapides
export const OSIS_TO_FRENCH = new Map(
  BIBLE_BOOKS.map(book => [book.name, book.frenchName])
);

export const FRENCH_TO_OSIS = new Map(
  BIBLE_BOOKS.map(book => [book.frenchName.toLowerCase(), book.name])
);

export const BOOK_BY_ORDER = new Map(
  BIBLE_BOOKS.map(book => [book.order, book])
);

// Livres populaires pour navigation rapide
export const POPULAR_BOOKS = [
  'GEN', // Genèse
  'PSA', // Psaumes  
  'MAT', // Matthieu
  'JHN', // Jean
  'ROM', // Romains
  'REV', // Apocalypse
] as const;

// Paramètres par défaut
export const DEFAULT_SETTINGS = {
  version: API_CONFIG.DEFAULT_VERSION,
  defaultVersion: API_CONFIG.DEFAULT_VERSION, // Version par défaut de l'utilisateur
  fontSize: 16,
  fontFamily: 'default' as const,
  lineHeight: 1.5,
  theme: 'light' as const,
  verseNumbers: true,
  redLetters: false,
  autoScroll: true,
  nightMode: false,
};

// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
  NO_INTERNET: 'Pas de connexion Internet. Vérifiez votre connexion.',
  API_ERROR: 'Erreur lors de la communication avec le serveur.',
  BOOK_NOT_FOUND: 'Livre non trouvé.',
  CHAPTER_NOT_FOUND: 'Chapitre non trouvé.',
  INVALID_REFERENCE: 'Référence biblique invalide.',
  STORAGE_ERROR: 'Erreur de stockage local.',
  CACHE_ERROR: 'Erreur du cache.',
  SEARCH_ERROR: 'Erreur lors de la recherche.',
} as const;