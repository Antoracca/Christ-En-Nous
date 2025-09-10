// reading-tracker/index.ts
// Moteur de tracking "session-based" pour Bible Reader.
// - Pas d'intervalle métier: calcul par horodatage (robuste au background).
// - Validation stricte via PRESS_NEXT.
// - ETA dynamique (EMA).
// - Streak quotidien.
// - Persistance AsyncStorage (compatible Expo).

import AsyncStorage from '@react-native-async-storage/async-storage';

/* ===================== Types & Interfaces ===================== */

export type Testament = 'OT' | 'NT';

export interface BibleRef {
  bookId: string;
  chapter: number; // 1-based
}

export interface ActiveSession {
  ref: BibleRef;
  startedAtMs: number;   // Date.now()
  maxVerseSeen: number;  // 0..totalVerses
  totalVerses: number;   // cache pour borne supérieure
}

export interface ChapterState {
  totalVerses: number;
  // readVerses: map sparse -> true. Persistable facilement.
  read: Record<number, true>;
  timeSec: number; // temps passé dans ce chapitre (crédité à PAUSE/switch)
}

export interface BookState {
  timeSec: number; // somme des chapitres + sessions créditées
  chapters: Record<number, ChapterState>; // key = chapter (1-based)
}

export interface StreakState {
  current: number;
  best: number;
  lastReadDayISO: string | null; // 'YYYY-MM-DD' en timezone locale
}

export interface ProgressSnapshot {
  version: 1;
  books: Record<string, BookState>; // key = bookId
  streak: StreakState;
  active: ActiveSession | null;
  // Vitesse lissée par livre (versets/min)
  vpmByBook: Record<string, number>;
}

export interface MetaProvider {
  // Fournis ces métadonnées depuis ton bibleService
  getTestament(bookId: string): Testament;
  getTotalChapters(bookId: string): number;
  getTotalVerses(bookId: string, chapter: number): number;
  listBooks(): string[];
}

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface TrackerOptions {
  storage?: StorageAdapter;
  storageKey?: string;
  // fonction pour convertir Date.now() en jour ISO local "YYYY-MM-DD"
  toLocalISODate?: (ms: number) => string;
}

/* ===================== Utils ===================== */

const DEFAULT_STORAGE_KEY = 'reading.tracker.v1';

function toISODateLocal(ms: number): string {
  const d = new Date(ms);
  // African/Casablanca tz not guaranteed here; prendre offset local runtime
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function ensureBook(state: ProgressSnapshot, bookId: string): BookState {
  if (!state.books[bookId]) {
    state.books[bookId] = { timeSec: 0, chapters: {} };
  }
  return state.books[bookId];
}

function ensureChapter(
  state: ProgressSnapshot,
  ref: BibleRef,
  totalVerses: number
): ChapterState {
  const book = ensureBook(state, ref.bookId);
  if (!book.chapters[ref.chapter]) {
    book.chapters[ref.chapter] = { totalVerses, read: {}, timeSec: 0 };
  } else {
    // garde totalVerses à jour si metadata a changé
    book.chapters[ref.chapter].totalVerses = totalVerses;
  }
  return book.chapters[ref.chapter];
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function addSeconds(book: BookState, chapter: ChapterState, sec: number) {
  if (sec <= 0) return;
  chapter.timeSec += sec;
  book.timeSec += sec;
}

/* ===================== Storage (AsyncStorage only for now) ===================== */

async function defaultStorage(): Promise<StorageAdapter> {
  // Utilisation d'AsyncStorage directement (plus compatible avec Expo)
  const adapter: StorageAdapter = {
    async getItem(key) {
      return await AsyncStorage.getItem(key);
    },
    async setItem(key, value) {
      await AsyncStorage.setItem(key, value);
    },
    async removeItem(key) {
      await AsyncStorage.removeItem(key);
    },
  };
  return adapter;
}

/* ===================== LectureSpeed EMA ===================== */

function ema(prev: number | undefined, sample: number, alpha = 0.3) {
  if (!isFinite(sample) || sample <= 0) return prev ?? 0;
  if (prev == null || prev <= 0) return sample;
  return alpha * sample + (1 - alpha) * prev;
}

/* ===================== Core Tracker ===================== */

export class ReadingTracker {
  private state: ProgressSnapshot;
  private storage: StorageAdapter;
  private storageKey: string;
  private toDayISO: (ms: number) => string;

  private constructor(init: {
    state: ProgressSnapshot;
    storage: StorageAdapter;
    storageKey: string;
    toDayISO: (ms: number) => string;
  }) {
    this.state = init.state;
    this.storage = init.storage;
    this.storageKey = init.storageKey;
    this.toDayISO = init.toDayISO;
  }

  /* --------- Factory --------- */
  static async create(opts: TrackerOptions = {}): Promise<ReadingTracker> {
    const storage = opts.storage ?? (await defaultStorage());
    const storageKey = opts.storageKey ?? DEFAULT_STORAGE_KEY;
    const toDayISO = opts.toLocalISODate ?? toISODateLocal;

    let state: ProgressSnapshot | null = null;
    try {
      const raw = await storage.getItem(storageKey);
      if (raw) state = JSON.parse(raw);
    } catch {
      /* ignore parse errors */
    }
    if (!state || state.version !== 1) {
      state = {
        version: 1,
        books: {},
        streak: { current: 0, best: 0, lastReadDayISO: null },
        active: null,
        vpmByBook: {},
      };
    }
    return new ReadingTracker({ state, storage, storageKey, toDayISO });
  }

  /* --------- Persist --------- */
  async persist(): Promise<void> {
    await this.storage.setItem(this.storageKey, JSON.stringify(this.state));
  }

  /* --------- Sessions --------- */

  /** Démarre/switch vers un chapitre. Créditera l'ancienne session si nécessaire. */
  switchTo(ref: BibleRef, totalVerses: number, nowMs = Date.now()): void {
    // Créditer l'actif courant
    if (this.state.active) this.pause(nowMs);
    // S'assurer des structures
    ensureChapter(this.state, ref, totalVerses);
    // Nouvelle session
    this.state.active = {
      ref,
      startedAtMs: nowMs,
      maxVerseSeen: 0,
      totalVerses,
    };
  }

  /** Met en pause la session en cours et crédite le temps. */
  pause(nowMs = Date.now()): void {
    const a = this.state.active;
    if (!a) return;
    const elapsedSec = Math.floor((nowMs - a.startedAtMs) / 1000);
    const book = ensureBook(this.state, a.ref.bookId);
    const chapter = ensureChapter(this.state, a.ref, a.totalVerses);
    addSeconds(book, chapter, elapsedSec);
    this.state.active = null;
  }

  /** Mise à jour du verset max vu (aucune validation d'écriture ici). */
  scrollVerse(verse: number): void {
    const a = this.state.active;
    if (!a) return;
    a.maxVerseSeen = clamp(verse, 0, a.totalVerses);
  }

  /** Valide jusqu'au dernier verset vu, complète le chapitre si tous lus. */
  pressNext(meta: MetaProvider, nowMs = Date.now()): {
    chapterCompleted: boolean;
    validatedCount: number;
  } {
    const a = this.state.active;
    if (!a) return { chapterCompleted: false, validatedCount: 0 };

    // Créditer le temps jusqu'à l'action
    this.pause(nowMs);

    const chapter = ensureChapter(this.state, a.ref, a.totalVerses);
    let validated = 0;
    for (let v = 1; v <= a.maxVerseSeen; v++) {
      if (!chapter.read[v]) {
        chapter.read[v] = true;
        validated++;
      }
    }

    const allRead = this.countReadVerses(chapter) >= chapter.totalVerses;
    if (allRead) {
      // Mark streak (un verset validé aujourd'hui => crédit de jour)
      this.bumpStreak(nowMs);
    }

    // Mettre à jour vitesse lissée (versets/min sur ce chapitre)
    if (validated > 0) {
      ensureBook(this.state, a.ref.bookId);
      const speed = this.estimateVPMForBook(a.ref.bookId, meta);
      this.state.vpmByBook[a.ref.bookId] = speed;
    }

    // Reprendre session sur le chapitre suivant (positionnera maxVerseSeen=0)
    if (allRead) {
      const next = this.nextChapter(a.ref, meta);
      if (next) {
        const nextTot = meta.getTotalVerses(next.bookId, next.chapter);
        this.switchTo(next, nextTot, nowMs);
      } else {
        // Fin du livre (ou fin canon) -> rien d'actif
        this.state.active = null;
      }
    } else {
      // Si pas tout lu, on reprend la session au même chapitre
      this.switchTo(a.ref, a.totalVerses, nowMs);
    }

    return { chapterCompleted: allRead, validatedCount: validated };
  }

  /** Complete explicitement un chapitre (tous versets). */
  completeChapter(ref: BibleRef, totalVerses: number, nowMs = Date.now()): void {
    // Créditer si actif même chapitre
    const a = this.state.active;
    if (a && a.ref.bookId === ref.bookId && a.ref.chapter === ref.chapter) {
      this.pause(nowMs);
    }
    const ch = ensureChapter(this.state, ref, totalVerses);
    for (let v = 1; v <= ch.totalVerses; v++) ch.read[v] = true;
    this.bumpStreak(nowMs);
  }

  /* --------- Selectors (read-only) --------- */

  /** Temps live (inclut delta de la session active). */
  getLiveTimes(nowMs = Date.now()) {
    let globalSec = 0;
    const byBook: Record<string, number> = {};
    for (const [bookId, b] of Object.entries(this.state.books)) {
      byBook[bookId] = b.timeSec;
      globalSec += b.timeSec;
    }
    if (this.state.active) {
      const delta = Math.max(0, Math.floor((nowMs - this.state.active.startedAtMs) / 1000));
      byBook[this.state.active.ref.bookId] = (byBook[this.state.active.ref.bookId] || 0) + delta;
      globalSec += delta;
    }
    return { globalSec, byBook };
  }

  /** Pourcentages & totaux par Testament et global (chapitres/versets exacts via meta). */
  getProgress(meta: MetaProvider) {
    let totalVersesGlobal = 0;
    let readVersesGlobal = 0;
    const perTestament: Record<Testament, { total: number; read: number }> = {
      OT: { total: 0, read: 0 },
      NT: { total: 0, read: 0 },
    };

    for (const bookId of meta.listBooks()) {
      const test = meta.getTestament(bookId);
      const totalCh = meta.getTotalChapters(bookId);
      for (let c = 1; c <= totalCh; c++) {
        const tot = meta.getTotalVerses(bookId, c);
        totalVersesGlobal += tot;
        perTestament[test].total += tot;

        const chSt = this.state.books[bookId]?.chapters[c];
        const read = chSt ? this.countReadVerses(chSt) : 0;
        readVersesGlobal += read;
        perTestament[test].read += read;
      }
    }

    const pct = (num: number, den: number) => (den > 0 ? (num / den) : 0);

    return {
      global: { read: readVersesGlobal, total: totalVersesGlobal, percent: pct(readVersesGlobal, totalVersesGlobal) },
      OT: { ...perTestament.OT, percent: pct(perTestament.OT.read, perTestament.OT.total) },
      NT: { ...perTestament.NT, percent: pct(perTestament.NT.read, perTestament.NT.total) },
    };
  }

  /** Livres en cours & stats par livre (progress, temps, ETA, vitesse). */
  getInProgress(meta: MetaProvider, nowMs = Date.now()) {
    const { byBook } = this.getLiveTimes(nowMs);
    const list = [];
    for (const bookId of meta.listBooks()) {
      const b = this.state.books[bookId];
      if (!b) continue;

      const totalCh = meta.getTotalChapters(bookId);
      let totalVerses = 0, readVerses = 0;
      for (let c = 1; c <= totalCh; c++) {
        const tot = meta.getTotalVerses(bookId, c);
        totalVerses += tot;
        readVerses += b.chapters[c] ? this.countReadVerses(b.chapters[c]) : 0;
      }
      const percent = totalVerses > 0 ? readVerses / totalVerses : 0;
      const timeSpent = byBook[bookId] || 0;

      const vpm = this.estimateVPMForBook(bookId, meta);
      const versesLeft = totalVerses - readVerses;
      const etaMin = vpm > 0 ? versesLeft / vpm : Infinity;

      // Considéré "en cours" si percent > 0 et < 1
      if (percent > 0 && percent < 1) {
        list.push({
          bookId,
          chaptersRead: this.countChaptersDone(bookId, meta),
          chaptersTotal: totalCh,
          percent,
          timeSpentSec: timeSpent,
          etaMin,
          vpm,
        });
      }
    }
    return list;
  }

  /** ETA global/testament */
  getETA(meta: MetaProvider) {
    const vpmGlobal = this.estimateVPMGlobal(meta);
    const vpmByTestament: Record<Testament, number> = {
      OT: this.estimateVPMForTestament('OT', meta),
      NT: this.estimateVPMForTestament('NT', meta),
    };

    const prog = this.getProgress(meta);
    const leftGlobal = Math.max(0, prog.global.total - prog.global.read);
    const leftOT = Math.max(0, prog.OT.total - prog.OT.read);
    const leftNT = Math.max(0, prog.NT.total - prog.NT.read);

    const toMin = (versesLeft: number, vpm: number) => (vpm > 0 ? versesLeft / vpm : Infinity);

    return {
      globalMin: toMin(leftGlobal, vpmGlobal),
      OTMin: toMin(leftOT, vpmByTestament.OT),
      NTMin: toMin(leftNT, vpmByTestament.NT),
    };
  }

  /** Streak (jours consécutifs) */
  getStreak(): StreakState {
    return { ...this.state.streak };
  }

  /* --------- Helpers --------- */

  private bumpStreak(nowMs = Date.now()) {
    const dayISO = this.toDayISO(nowMs);
    const s = this.state.streak;
    if (!s.lastReadDayISO) {
      s.current = 1;
      s.best = Math.max(s.best, s.current);
      s.lastReadDayISO = dayISO;
      return;
    }
    if (s.lastReadDayISO === dayISO) return; // déjà crédité aujourd'hui

    // calculer si hier
    const last = new Date(s.lastReadDayISO + 'T00:00:00');
    const curr = new Date(dayISO + 'T00:00:00');
    const diffDays = Math.round((+curr - +last) / 86400000);
    if (diffDays === 1) s.current += 1;
    else s.current = 1;

    s.best = Math.max(s.best, s.current);
    s.lastReadDayISO = dayISO;
  }

  private countReadVerses(ch: ChapterState): number {
    // read est un map sparse → compter ses keys
    return Object.keys(ch.read).length;
  }

  private countChaptersDone(bookId: string, meta: MetaProvider): number {
    const b = this.state.books[bookId];
    if (!b) return 0;
    let done = 0;
    const totalCh = meta.getTotalChapters(bookId);
    for (let c = 1; c <= totalCh; c++) {
      const tot = meta.getTotalVerses(bookId, c);
      const st = b.chapters[c];
      if (st && this.countReadVerses(st) >= tot) done++;
    }
    return done;
  }

  private nextChapter(ref: BibleRef, meta: MetaProvider): BibleRef | null {
    const totalCh = meta.getTotalChapters(ref.bookId);
    if (ref.chapter < totalCh) {
      return { bookId: ref.bookId, chapter: ref.chapter + 1 };
    }
    // Passer au livre suivant via l'ordre canonique
    const books = meta.listBooks();
    const currentIndex = books.indexOf(ref.bookId);
    if (currentIndex >= 0 && currentIndex < books.length - 1) {
      const nextBookId = books[currentIndex + 1];
      return { bookId: nextBookId, chapter: 1 };
    }
    return null;
  }

  private estimateVPMForBook(bookId: string, meta: MetaProvider): number {
    // Si vitesse déjà lissée, on la réutilise.
    const prev = this.state.vpmByBook[bookId];

    // Mesure empirique: versets lus / minutes investies.
    const b = this.state.books[bookId];
    if (!b) return prev ?? 0;

    let verses = 0;
    let timeSec = b.timeSec;

    // Ajuster avec l'actif si même livre
    if (this.state.active?.ref.bookId === bookId) {
      const delta = Math.max(0, Math.floor((Date.now() - this.state.active.startedAtMs) / 1000));
      timeSec += delta;
    }

    const totalCh = Object.keys(b.chapters).length;
    if (totalCh === 0) return prev ?? 0;

    for (const ch of Object.values(b.chapters)) {
      verses += this.countReadVerses(ch);
    }

    const sampleVPM = timeSec > 0 ? (verses / (timeSec / 60)) : 0;
    return ema(prev, sampleVPM);
  }

  private estimateVPMForTestament(t: Testament, meta: MetaProvider): number {
    let verses = 0;
    let timeSec = 0;
    for (const bookId of meta.listBooks()) {
      if (meta.getTestament(bookId) !== t) continue;
      const b = this.state.books[bookId];
      if (!b) continue;
      timeSec += b.timeSec;
      for (const ch of Object.values(b.chapters)) {
        verses += this.countReadVerses(ch);
      }
    }
    // Valeur par défaut conservatrice : 1 verset/minute si pas de données
    return timeSec > 0 && verses > 0 ? (verses / (timeSec / 60)) : 1;
  }

  private estimateVPMGlobal(meta: MetaProvider): number {
    let verses = 0;
    let timeSec = 0;
    for (const bookId of meta.listBooks()) {
      const b = this.state.books[bookId];
      if (!b) continue;
      timeSec += b.timeSec;
      for (const ch of Object.values(b.chapters)) {
        verses += this.countReadVerses(ch);
      }
    }
    // Valeur par défaut conservatrice : 1 verset/minute si pas de données
    return timeSec > 0 && verses > 0 ? (verses / (timeSec / 60)) : 1;
  }

  /* --------- Snapshots --------- */

  getSnapshot(): ProgressSnapshot {
    return JSON.parse(JSON.stringify(this.state));
  }

  async reset(): Promise<void> {
    this.state = {
      version: 1,
      books: {},
      streak: { current: 0, best: 0, lastReadDayISO: null },
      active: null,
      vpmByBook: {},
    };
    await this.storage.removeItem(this.storageKey);
  }
}

/* ===================== COMPATIBILITÉ AVEC L'ANCIEN CODE ===================== */

// Interface existante pour la compatibilité avec BibleProgressModal & EnhancedBibleContext
export interface BibleIndex {
  [bookId: string]: {
    id: string;
    testament: 'OT' | 'NT';
    chapters: number;
    versesPerChapter: number[];
  };
}

class ProgressCompatibility {
  private tracker: ReadingTracker | null = null;
  private bibleIndex: BibleIndex = {};
  private bookOrder: string[] = [];

  /** Configure l'index des livres Bible et l'ordre canonique */
  configureBibleIndex(index: BibleIndex, order: string[]): void {
    this.bibleIndex = index;
    this.bookOrder = order;
  }

  /** Initialise le tracker depuis le cache */
  async hydrate(): Promise<void> {
    this.tracker = await ReadingTracker.create();
  }

  /** Démarre/switch vers un chapitre */
  switchTo(bookId: string, chapter: number): void {
    if (!this.tracker) return;
    const totalVerses = this.bibleIndex[bookId]?.versesPerChapter[chapter - 1] || 25;
    this.tracker.switchTo({ bookId, chapter }, totalVerses);
  }

  /** Met en pause */
  pause(): void {
    this.tracker?.pause();
  }

  /** Complète un chapitre */
  async completeChapter(): Promise<void> {
    if (!this.tracker) return;
    const active = this.tracker.getSnapshot().active;
    if (!active) return;
    const totalVerses = this.bibleIndex[active.ref.bookId]?.versesPerChapter[active.ref.chapter - 1] || 25;
    this.tracker.completeChapter(active.ref, totalVerses);
  }

  /** Sauvegarde */
  async persist(): Promise<void> {
    await this.tracker?.persist();
  }

  /** Session active */
  getActiveSession(): ActiveSession | null {
    return this.tracker?.getSnapshot().active || null;
  }

  /** Accès au tracker interne pour scrollVerse */
  scrollVerse(verseNumber: number): void {
    this.tracker?.scrollVerse(verseNumber);
  }

  /** Temps en direct */
  getLiveTimes() {
    if (!this.tracker) return { globalSeconds: 0, otSeconds: 0, ntSeconds: 0 };
    const times = this.tracker.getLiveTimes();
    let otSeconds = 0, ntSeconds = 0;
    
    for (const [bookId, time] of Object.entries(times.byBook)) {
      const testament = this.bibleIndex[bookId]?.testament;
      if (testament === 'OT') otSeconds += time;
      else if (testament === 'NT') ntSeconds += time;
    }

    return {
      globalSeconds: times.globalSec,
      otSeconds,
      ntSeconds
    };
  }

  /** Pourcentages par testament */
  getTestamentPercent(testament: Testament) {
    if (!this.tracker) return { 
      percent: 0, 
      booksCompleted: 0, 
      booksTotal: 0,
      chapters: { completed: 0, total: 0 },
      verses: { read: 0, total: 0 }
    };

    const meta: MetaProvider = {
      getTestament: (bookId) => this.bibleIndex[bookId]?.testament || 'OT',
      getTotalChapters: (bookId) => this.bibleIndex[bookId]?.chapters || 0,
      getTotalVerses: (bookId, chapter) => this.bibleIndex[bookId]?.versesPerChapter[chapter - 1] || 25,
      listBooks: () => this.bookOrder
    };

    const progress = this.tracker.getProgress(meta);
    const testamentData = progress[testament];

    // Compter les livres et chapitres
    let booksTotal = 0;
    let booksCompleted = 0;
    let chaptersTotal = 0;
    let chaptersCompleted = 0;

    for (const bookId of this.bookOrder) {
      if (this.bibleIndex[bookId]?.testament !== testament) continue;
      
      booksTotal++;
      const totalCh = this.bibleIndex[bookId]?.chapters || 0;
      chaptersTotal += totalCh;
      
      const bookState = this.tracker.getSnapshot().books[bookId];
      if (bookState) {
        let bookChaptersRead = 0;
        for (let c = 1; c <= totalCh; c++) {
          const chapterState = bookState.chapters[c];
          if (chapterState) {
            const totalVerses = this.bibleIndex[bookId]?.versesPerChapter[c - 1] || 25;
            const readVerses = Object.keys(chapterState.read).length;
            if (readVerses >= totalVerses) {
              chaptersCompleted++;
              bookChaptersRead++;
            }
          }
        }
        if (bookChaptersRead === totalCh) booksCompleted++;
      }
    }

    return {
      percent: testamentData.percent * 100,
      booksCompleted,
      booksTotal,
      chapters: { completed: chaptersCompleted, total: chaptersTotal },
      verses: { read: testamentData.read, total: testamentData.total }
    };
  }

  /** Pourcentage global */
  getGlobalPercent() {
    if (!this.tracker) return { percent: 0 };

    const meta: MetaProvider = {
      getTestament: (bookId) => this.bibleIndex[bookId]?.testament || 'OT',
      getTotalChapters: (bookId) => this.bibleIndex[bookId]?.chapters || 0,
      getTotalVerses: (bookId, chapter) => this.bibleIndex[bookId]?.versesPerChapter[chapter - 1] || 25,
      listBooks: () => this.bookOrder
    };

    const progress = this.tracker.getProgress(meta);
    return { percent: progress.global.percent * 100 };
  }

  /** Estimations de vitesse */
  getEstimates() {
    if (!this.tracker) return { paceVersesPerMin: 0 };

    const meta: MetaProvider = {
      getTestament: (bookId) => this.bibleIndex[bookId]?.testament || 'OT',
      getTotalChapters: (bookId) => this.bibleIndex[bookId]?.chapters || 0,
      getTotalVerses: (bookId, chapter) => this.bibleIndex[bookId]?.versesPerChapter[chapter - 1] || 25,
      listBooks: () => this.bookOrder
    };

    return { paceVersesPerMin: this.tracker['estimateVPMGlobal'](meta) };
  }

  /** ETA précises par testament (nouveau moteur) */
  getETA() {
    if (!this.tracker) return { globalMin: 0, OTMin: 0, NTMin: 0 };

    const meta: MetaProvider = {
      getTestament: (bookId) => this.bibleIndex[bookId]?.testament || 'OT',
      getTotalChapters: (bookId) => this.bibleIndex[bookId]?.chapters || 0,
      getTotalVerses: (bookId, chapter) => this.bibleIndex[bookId]?.versesPerChapter[chapter - 1] || 25,
      listBooks: () => this.bookOrder
    };

    return this.tracker.getETA(meta);
  }

  /** Livres actifs avec états intelligents */
  getActiveBooks(labelsMap: Record<string, string>) {
    if (!this.tracker) return [];

    const meta: MetaProvider = {
      getTestament: (bookId) => this.bibleIndex[bookId]?.testament || 'OT',
      getTotalChapters: (bookId) => this.bibleIndex[bookId]?.chapters || 0,
      getTotalVerses: (bookId, chapter) => this.bibleIndex[bookId]?.versesPerChapter[chapter - 1] || 25,
      listBooks: () => this.bookOrder
    };

    const inProgress = this.tracker.getInProgress(meta);
    this.tracker.getLiveTimes();
    const snapshot = this.tracker.getSnapshot();
    const activeBookId = snapshot.active?.ref.bookId;

    return inProgress.map(book => {
      const currentChapter = this.getCurrentChapter(book.bookId, snapshot);
      const isCompleted = book.percent >= 1;
      const isCurrentlyActive = activeBookId === book.bookId;
      
      // Logique du bouton intelligent
      let buttonState: 'continuer' | 'reprendre' | 'commencer' = 'commencer';
      let buttonText = 'Commencer';
      
      if (book.percent > 0) {
        if (isCurrentlyActive) {
          buttonState = 'continuer';
          buttonText = 'Continuer la lecture';
        } else {
          buttonState = 'reprendre';
          buttonText = 'Reprendre la lecture';
        }
      }
      
      return {
        bookId: book.bookId,
        bookName: labelsMap[book.bookId.toUpperCase()] || book.bookId,
        currentChapter,
        totalChapters: book.chaptersTotal,
        percent: book.percent * 100,
        timeSpentSec: book.timeSpentSec,
        liveDeltaSec: isCurrentlyActive && snapshot.active ? 
          Math.max(0, Math.floor((Date.now() - snapshot.active.startedAtMs) / 1000)) : 0,
        speedVpm: book.vpm,
        etaMin: book.etaMin,
        isCompleted,
        isCurrentlyActive,
        buttonState,
        buttonText,
        nextRef: this.getNextRef(book.bookId, currentChapter)
      };
    });
  }

  /** Progress d'un livre spécifique */
  getBookProgress(bookId: string) {
    const testament = this.bibleIndex[bookId]?.testament;
    return testament ? { testament } : null;
  }

  /** Messages d'encouragement */
  getEncouragementFor(percent: number, bookName: string) {
    if (percent >= 100) {
      return { message: `🎉 Félicitations ! ${bookName} est terminé !` };
    } else if (percent >= 75) {
      return { message: `🔥 Presque fini ! Plus que ${Math.round(100 - percent)}% !` };
    } else if (percent >= 50) {
      return { message: `💪 Super ! Tu es à mi-parcours de ${bookName} !` };
    } else if (percent >= 25) {
      return { message: `📖 Bon rythme ! Continue ta lecture !` };
    } else {
      return { message: `🌟 C'est parti ! ${bookName} t'attend !` };
    }
  }

  /** Reset complet */
  async resetAll(): Promise<void> {
    await this.tracker?.reset();
  }

  /** Récupérer les données de streak */
  getStreak() {
    if (!this.tracker) return { current: 0, best: 0, lastReadDayISO: null };
    return this.tracker.getStreak();
  }

  /** Nouvelle méthode pressNext pour validation stricte */
  async pressNext(): Promise<{ chapterCompleted: boolean; validatedCount: number }> {
    if (!this.tracker) return { chapterCompleted: false, validatedCount: 0 };

    const meta: MetaProvider = {
      getTestament: (bookId) => this.bibleIndex[bookId]?.testament || 'OT',
      getTotalChapters: (bookId) => this.bibleIndex[bookId]?.chapters || 0,
      getTotalVerses: (bookId, chapter) => this.bibleIndex[bookId]?.versesPerChapter[chapter - 1] || 25,
      listBooks: () => this.bookOrder
    };

    return this.tracker.pressNext(meta);
  }

  private getCurrentChapter(bookId: string, snapshot: ProgressSnapshot): number {
    const bookState = snapshot.books[bookId];
    if (!bookState) return 1;
    
    // Trouver le dernier chapitre avec des versets lus
    const chapters = Object.keys(bookState.chapters).map(Number).sort((a, b) => a - b);
    for (let i = chapters.length - 1; i >= 0; i--) {
      const chapterNum = chapters[i];
      const chapter = bookState.chapters[chapterNum];
      if (chapter && Object.keys(chapter.read).length > 0) {
        const totalVerses = this.bibleIndex[bookId]?.versesPerChapter[chapterNum - 1] || 25;
        const readVerses = Object.keys(chapter.read).length;
        if (readVerses < totalVerses) {
          return chapterNum; // Chapitre en cours
        } else if (chapterNum < this.bibleIndex[bookId]?.chapters) {
          return chapterNum + 1; // Chapitre suivant
        }
      }
    }
    
    return chapters.length > 0 ? Math.max(...chapters) : 1;
  }

  private getNextRef(bookId: string, currentChapter: number): { book: string; chapter: number } {
    const totalChapters = this.bibleIndex[bookId]?.chapters || 0;
    if (currentChapter < totalChapters) {
      return { book: bookId, chapter: currentChapter + 1 };
    }
    
    // Livre suivant
    const currentIndex = this.bookOrder.indexOf(bookId);
    if (currentIndex >= 0 && currentIndex < this.bookOrder.length - 1) {
      return { book: this.bookOrder[currentIndex + 1], chapter: 1 };
    }
    
    return { book: bookId, chapter: currentChapter };
  }
}

// Instance singleton pour la compatibilité
export const progress = new ProgressCompatibility();