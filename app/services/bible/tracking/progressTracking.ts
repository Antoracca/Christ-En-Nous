// reading-tracker/index.ts
// Moteur de tracking "session-based" SOUPLE pour Bible Reader.
// v3.1: Confiance totale, logique de reprise intelligente ("Dernier lu"), historique des terminés.

import AsyncStorage from '@/utils/storage';

/* ===================== Configuration ===================== */
const CONFIG = {
  AUTO_PAUSE_DELAY_MS: 5 * 60 * 1000, 
  EMA_ALPHA: 0.2, 
};

/* ===================== Types & Interfaces ===================== */

export type Testament = 'OT' | 'NT';

export interface BibleRef {
  bookId: string;
  chapter: number;
}

export interface ActiveSession {
  ref: BibleRef;
  startedAtMs: number;
  lastActivityMs: number;
  maxVerseSeen: number;
  totalVerses: number;
}

export interface ChapterState {
  totalVerses: number;
  read: Record<number, true>;
  timeSec: number;
  completedAt?: string;
}

export interface BookState {
  timeSec: number;
  chapters: Record<number, ChapterState>;
}

export interface StreakState {
  current: number;
  best: number;
  lastReadDayISO: string | null;
}

export interface ProgressSnapshot {
  version: 2;
  books: Record<string, BookState>;
  streak: StreakState;
  active: ActiveSession | null;
  vpmByBook: Record<string, number>;
  globalVpm: number;
}

export interface MetaProvider {
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
  toLocalISODate?: (ms: number) => string;
}

/* ===================== Utils ===================== */

const DEFAULT_STORAGE_KEY = 'reading.tracker.v2';

function toISODateLocal(ms: number): string {
  const d = new Date(ms);
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
    book.chapters[ref.chapter].totalVerses = totalVerses;
  }
  return book.chapters[ref.chapter];
}

function addSeconds(book: BookState, chapter: ChapterState, sec: number) {
  if (sec <= 0) return;
  const safeSec = Math.min(sec, 3600);
  chapter.timeSec += safeSec;
  book.timeSec += safeSec;
}

async function defaultStorage(): Promise<StorageAdapter> {
  return {
    async getItem(key) { return await AsyncStorage.getItem(key); },
    async setItem(key, value) { await AsyncStorage.setItem(key, value); },
    async removeItem(key) { await AsyncStorage.removeItem(key); },
  };
}

function ema(prev: number | undefined, sample: number, alpha = CONFIG.EMA_ALPHA) {
  if (!isFinite(sample) || sample <= 0) return prev ?? 0;
  if (prev == null || prev <= 0) return sample;
  if (sample > 500 || sample < 0.1) return prev; 
  return alpha * sample + (1 - alpha) * prev;
}

/* ===================== Core Tracker V3 ===================== */

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

  static async create(opts: TrackerOptions = {}): Promise<ReadingTracker> {
    const storage = opts.storage ?? (await defaultStorage());
    const storageKey = opts.storageKey ?? DEFAULT_STORAGE_KEY;
    const toDayISO = opts.toLocalISODate ?? toISODateLocal;

    let state: ProgressSnapshot | null = null;
    try {
      const raw = await storage.getItem(storageKey);
      if (raw) state = JSON.parse(raw);
    } catch {}

    if (!state || state.version !== 2) {
      state = {
        version: 2,
        books: {},
        streak: { current: 0, best: 0, lastReadDayISO: null },
        active: null,
        vpmByBook: {},
        globalVpm: 0,
      };
    }
    return new ReadingTracker({ state, storage, storageKey, toDayISO });
  }

  async persist(): Promise<void> {
    await this.storage.setItem(this.storageKey, JSON.stringify(this.state));
  }

  // ✅ NOUVEAU: Recharger depuis le disque/cloud (Sync Pull)
  async reload(): Promise<void> {
    try {
        const raw = await this.storage.getItem(this.storageKey);
        if (raw) {
            const remoteState = JSON.parse(raw);
            // Fusion simple : On prend le remote comme vérité (sauf si on a une session active très récente ?)
            // Pour la V1, on écrase local avec remote pour garantir la sync.
            // On préserve juste l'active session si elle existe localement pour ne pas couper brutalement
            const localActive = this.state.active;
            
            this.state = remoteState;
            
            // Si on avait une session active locale, on essaie de la restaurer si le remote n'en a pas
            if (localActive && !this.state.active) {
                this.state.active = localActive;
            }
        }
    } catch (e) {
        console.warn("Erreur reload tracking:", e);
    }
  }

  /* --------- Logic --------- */

  switchTo(ref: BibleRef, totalVerses: number, nowMs = Date.now()): void {
    if (this.state.active) this.pause(nowMs);
    ensureChapter(this.state, ref, totalVerses);
    this.state.active = {
      ref,
      startedAtMs: nowMs,
      lastActivityMs: nowMs,
      maxVerseSeen: 0,
      totalVerses,
    };
  }

  pause(nowMs = Date.now()): void {
    const a = this.state.active;
    if (!a) return;

    const rawElapsed = nowMs - a.lastActivityMs;
    const effectiveElapsed = Math.min(rawElapsed, CONFIG.AUTO_PAUSE_DELAY_MS);
    const sessionTimeToAdd = Math.max(0, Math.floor(((a.lastActivityMs - a.startedAtMs) + effectiveElapsed) / 1000));

    const book = ensureBook(this.state, a.ref.bookId);
    const chapter = ensureChapter(this.state, a.ref, a.totalVerses);
    
    addSeconds(book, chapter, sessionTimeToAdd);
    this.state.active = null;
    
    // ✅ NOUVEAU: Persistance à la pause
    this.persist();
  }

  scrollVerse(verse: number, nowMs = Date.now()): void {
    const a = this.state.active;
    if (!a) return;
    a.maxVerseSeen = Math.max(a.maxVerseSeen, Math.min(verse, a.totalVerses));
    a.lastActivityMs = nowMs; 
    
    // VALIDATION AU SCROLL
    const chapter = ensureChapter(this.state, a.ref, a.totalVerses);
    for (let v = 1; v <= a.maxVerseSeen; v++) {
        if (!chapter.read[v]) chapter.read[v] = true;
    }
  }

  pressNext(meta: MetaProvider, nowMs = Date.now()): {
    chapterCompleted: boolean;
    validatedCount: number;
  } {
    console.log("👉 PressNext appelé");
    const a = this.state.active;
    if (!a) {
        console.warn("❌ Pas de session active pour pressNext");
        return { chapterCompleted: false, validatedCount: 0 };
    }

    const book = ensureBook(this.state, a.ref.bookId);
    const chapter = ensureChapter(this.state, a.ref, a.totalVerses);
    
    const sessionSec = Math.floor((nowMs - a.startedAtMs) / 1000);
    const totalTimeOnChapter = chapter.timeSec + sessionSec;

    this.pause(nowMs); 

    let validated = 0;
    for (let v = 1; v <= a.totalVerses; v++) {
        if (!chapter.read[v]) {
            chapter.read[v] = true;
            validated++;
        }
    }
    chapter.completedAt = new Date().toISOString();

    this.bumpStreak(nowMs);
    
    if (validated > 0 && totalTimeOnChapter > 5) {
        const vpm = (validated / (totalTimeOnChapter / 60));
        this.updateVPM(a.ref.bookId, vpm);
    }

    // Passage au suivant
    const next = this.nextChapter(a.ref, meta);
    if (next) {
        const nextTot = meta.getTotalVerses(next.bookId, next.chapter);
        this.switchTo(next, nextTot, nowMs);
    } else {
        this.state.active = null;
    }

    // ✅ NOUVEAU: Persistance immédiate après validation
    this.persist();

    return { chapterCompleted: true, validatedCount: validated, cheatingDetected: false };
  }

  private updateVPM(bookId: string, sampleVpm: number) {
    this.state.vpmByBook[bookId] = ema(this.state.vpmByBook[bookId], sampleVpm);
    this.state.globalVpm = ema(this.state.globalVpm, sampleVpm);
  }

  private bumpStreak(nowMs = Date.now()) {
    const dayISO = this.toDayISO(nowMs);
    const s = this.state.streak;
    
    if (s.lastReadDayISO === dayISO) return; 

    if (s.lastReadDayISO) {
        const last = new Date(s.lastReadDayISO);
        const curr = new Date(dayISO);
        const diffTime = Math.abs(curr.getTime() - last.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays === 1) s.current += 1;
        else if (diffDays > 1) s.current = 1;
    } else {
        s.current = 1;
    }
    
    s.best = Math.max(s.best, s.current);
    s.lastReadDayISO = dayISO;
  }

  private nextChapter(ref: BibleRef, meta: MetaProvider): BibleRef | null {
    const totalCh = meta.getTotalChapters(ref.bookId);
    if (ref.chapter < totalCh) {
      return { bookId: ref.bookId, chapter: ref.chapter + 1 };
    }
    const books = meta.listBooks();
    const idx = books.indexOf(ref.bookId);
    if (idx >= 0 && idx < books.length - 1) {
      return { bookId: books[idx + 1], chapter: 1 };
    }
    return null;
  }
  
  getSnapshot() { return this.state; }
  getVPM() { return this.state.globalVpm || 15; }
  getStreak() { return this.state.streak; }
  
  getLiveTime(bookId?: string): number {
    let t = 0;
    if (bookId) {
        t = this.state.books[bookId]?.timeSec || 0;
        if (this.state.active?.ref.bookId === bookId) {
            t += Math.floor((Date.now() - this.state.active.startedAtMs) / 1000);
        }
    } else {
        for (const b of Object.values(this.state.books)) t += b.timeSec;
        if (this.state.active) {
            t += Math.floor((Date.now() - this.state.active.startedAtMs) / 1000);
        }
    }
    return t;
  }

  async reset(): Promise<void> {
    this.state = {
      version: 2,
      books: {},
      streak: { current: 0, best: 0, lastReadDayISO: null },
      active: null,
      vpmByBook: {},
      globalVpm: 0,
    };
    await this.storage.removeItem(this.storageKey);
  }

  async reload(): Promise<void> {
    try {
        const raw = await this.storage.getItem(this.storageKey);
        if (raw) {
            this.state = JSON.parse(raw);
        }
    } catch {}
  }

  // ✅ NOUVEAU: Recommencer un livre (garde le temps, reset la lecture)
  restartBook(bookId: string) {
      const book = this.state.books[bookId];
      if (book) {
          // On vide les chapitres lus, mais on garde le temps global du livre
          for (const chKey in book.chapters) {
              book.chapters[chKey].read = {};
              delete book.chapters[chKey].completedAt;
          }
      }
  }

  // ✅ NOUVEAU: Mise à jour depuis le listener temps réel
  updateStateFromRemote(newState: ProgressSnapshot) {
      const localActive = this.state.active;
      
      // On remplace tout sauf la session active si elle existe localement
      this.state = newState;
      
      if (localActive) {
          // On restaure la session active locale pour ne pas interrompre le tracking
          // On pourrait aussi vérifier si newState.active est plus récent, mais en général
          // la vérité locale de lecture prime sur le cloud.
          this.state.active = localActive;
      }
  }
}

// ===================== WRAPPER COMPATIBILITÉ =====================

export interface BibleIndex {
  [bookId: string]: {
    id: string;
    testament: 'OT' | 'NT';
    chapters: number;
    versesPerChapter: number[];
  };
}

class ProgressEngine {
  private tracker: ReadingTracker | null = null;
  private bibleIndex: BibleIndex = {};
  private bookOrder: string[] = [];

  configureBibleIndex(index: BibleIndex, order: string[]) {
    this.bibleIndex = index;
    this.bookOrder = order;
  }

  async hydrate(userId?: string) {
    if (userId) {
       const { createFirebaseStorageAdapter } = await import('./firebaseStorageAdapter');
       const adapter = createFirebaseStorageAdapter(userId);
       this.tracker = await ReadingTracker.create({ storage: adapter });
       console.log('✅ [Tracking] Mode Firebase activé (Sync au démarrage uniquement)');
    } else {
       this.tracker = await ReadingTracker.create();
    }
  }
  
  private unsubscribe: (() => void) | null = null;
  
  stopListening() {
      // Nettoyage inutile maintenant, mais gardé pour compatibilité interface
  }

  switchTo(bookId: string, chapter: number, explicitTotal?: number) {
    const total = explicitTotal || this.bibleIndex[bookId]?.versesPerChapter[chapter - 1] || 25;
    console.log(`⏱️ Tracking Switch: ${bookId} ${chapter} (Total: ${total})`);
    this.tracker?.switchTo({ bookId, chapter }, total);
  }

  pause() { this.tracker?.pause(); }

  scrollVerse(v: number) { this.tracker?.scrollVerse(v); }

  async completeChapter() {
     if (!this.tracker) return;
     const meta = this.getMeta();
     this.tracker.pressNext(meta);
  }

  async persist() { await this.tracker?.persist(); }
  
  // ✅ NOUVEAU: Exposer reload
  async reload() { await this.tracker?.reload(); }

  getActiveSession() { return this.tracker?.getSnapshot().active || null; }
  
  getLiveTimes() {
     const t = this.tracker;
     if (!t) return { globalSeconds: 0, otSeconds: 0, ntSeconds: 0 };
     
     const globalSeconds = t.getLiveTime();
     let otSeconds = 0; 
     let ntSeconds = 0;
     
     const snap = t.getSnapshot();
     for (const [bid, book] of Object.entries(snap.books)) {
         const test = this.bibleIndex[bid]?.testament;
         if (test === 'OT') otSeconds += book.timeSec;
         if (test === 'NT') ntSeconds += book.timeSec;
     }
     
     if (snap.active) {
         const delta = Math.floor((Date.now() - snap.active.startedAtMs)/1000);
         const test = this.bibleIndex[snap.active.ref.bookId]?.testament;
         if (test === 'OT') otSeconds += delta;
         if (test === 'NT') ntSeconds += delta;
     }

     return { globalSeconds, otSeconds, ntSeconds, byBook: {} };
  }

  getTestamentPercent(testament: Testament) {
      if (!this.tracker) return { percent: 0, booksCompleted: 0, booksTotal: 0, chapters: {completed:0, total:0}, verses: {read:0, total:0} };
      
      let vRead = 0, vTotal = 0;
      let cRead = 0, cTotal = 0;
      let bRead = 0, bTotal = 0;
      
      const snap = this.tracker.getSnapshot();
      
      for (const bookId of this.bookOrder) {
          if (this.bibleIndex[bookId]?.testament !== testament) continue;
          bTotal++;
          
          const bookMeta = this.bibleIndex[bookId];
          const bookState = snap.books[bookId];
          const chCount = bookMeta.chapters;
          cTotal += chCount;
          
          let bookFull = true;
          for (let c=1; c<=chCount; c++) {
              const vCount = bookMeta.versesPerChapter[c-1] || 0;
              vTotal += vCount;
              
              if (bookState?.chapters[c]?.read) {
                  const readCount = Object.keys(bookState.chapters[c].read).length;
                  vRead += readCount;
                  
                  // Tolérance : Chapitre considéré comme lu si marqué complété OU > 90% des versets lus
                  const isMarkedComplete = !!bookState.chapters[c].completedAt;
                  const isNearlyComplete = vCount > 0 && (readCount / vCount) > 0.9;
                  
                  if (isMarkedComplete || isNearlyComplete) cRead++;
                  else bookFull = false;
              } else {
                  bookFull = false;
              }
          }
          if (bookFull) bRead++;
      }
      
      return {
          percent: vTotal > 0 ? (vRead / vTotal) * 100 : 0,
          booksCompleted: bRead, booksTotal: bTotal,
          chapters: { completed: cRead, total: cTotal },
          verses: { read: vRead, total: vTotal }
      };
  }

  getGlobalPercent() {
      const ot = this.getTestamentPercent('OT');
      const nt = this.getTestamentPercent('NT');
      const totalV = ot.verses.total + nt.verses.total;
      const readV = ot.verses.read + nt.verses.read;
      return { percent: totalV > 0 ? (readV / totalV) * 100 : 0 };
  }
  
  getEstimates() {
      return { paceVersesPerMin: this.tracker?.getVPM() || 0 };
  }
  
  getETA() {
      const vpm = this.tracker?.getVPM() || 15;
      const ot = this.getTestamentPercent('OT');
      const nt = this.getTestamentPercent('NT');
      
      const remGlobal = (ot.verses.total + nt.verses.total) - (ot.verses.read + nt.verses.read);
      const remOT = ot.verses.total - ot.verses.read;
      const remNT = nt.verses.total - nt.verses.read;
      
      return {
          globalMin: remGlobal / vpm,
          OTMin: remOT / vpm,
          NTMin: remNT / vpm
      };
  }

  private getMeta(): MetaProvider {
      return {
        getTestament: (id) => this.bibleIndex[id]?.testament || 'OT',
        getTotalChapters: (id) => this.bibleIndex[id]?.chapters || 0,
        getTotalVerses: (id, c) => this.bibleIndex[id]?.versesPerChapter[c - 1] || 25,
        listBooks: () => this.bookOrder
      };
  }
  
  getActiveBooks(labels: any) {
     if (!this.tracker) return [];
     const snap = this.tracker.getSnapshot();
     const activeId = snap.active?.ref.bookId;
     
     const res = [];
     for (const bookId of this.bookOrder) {
         const bookState = snap.books[bookId];
         if (!bookState) continue;
         
         const meta = this.bibleIndex[bookId];
         if (!meta) continue;
         let vTotal = 0, vRead = 0;
         for (let c=1; c<=meta.chapters; c++) {
             vTotal += meta.versesPerChapter[c-1] || 0;
             if (bookState.chapters[c]) {
                 vRead += Object.keys(bookState.chapters[c].read).length;
             }
         }
         const pct = vTotal > 0 ? vRead/vTotal : 0;
         
         if (pct > 0.001 && pct < 0.999) { // En cours
             const isAct = activeId === bookId;
             const resumeChap = this.determineResumeChapter(bookId, bookState, meta.chapters);
             
             res.push({
                 bookId,
                 bookName: labels[bookId.toUpperCase()] || bookId,
                 percent: pct * 100,
                 isCurrentlyActive: isAct,
                 etaMin: (vTotal - vRead) / (this.tracker.getVPM() || 15),
                 currentChapter: resumeChap,
                 totalChapters: meta.chapters,
                 buttonState: isAct ? 'continuer' : 'reprendre',
                 buttonText: isAct ? 'En cours' : 'Reprendre',
                 nextRef: { book: bookId, chapter: resumeChap }
             });
         }
     }
     return res.sort((a,b) => (a.isCurrentlyActive ? -1 : 1));
  }

  // ✅ NOUVELLE MÉTHODE : Historique complet (En cours + Terminés)
  getBookHistory(labels: any) {
     if (!this.tracker) {
         console.warn("⚠️ getBookHistory: Tracker not ready");
         return [];
     }
     const snap = this.tracker.getSnapshot();
     const res = [];
     
     // console.log(`🔍 Scan historique sur ${this.bookOrder.length} livres...`);
     
     // Vitesse globale pour fallback
     const globalVpm = this.tracker.getVPM() || 15;

     for (const bookId of this.bookOrder) {
         const bookState = snap.books[bookId];
         if (!bookState) continue;
         
         const meta = this.bibleIndex[bookId];
         if (!meta) continue;
         
         let vTotal = 0, vRead = 0;
         let cTotal = meta.chapters;
         let cRead = 0;

         for (let c=1; c<=cTotal; c++) {
             const vCount = meta.versesPerChapter[c-1] || 0;
             vTotal += vCount;
             
             if (bookState.chapters[c]) {
                 const readCount = Object.keys(bookState.chapters[c].read).length;
                 vRead += readCount;
                 
                 // Tolérance : Chapitre considéré comme lu si marqué complété OU > 90% des versets lus
                 const isMarkedComplete = !!bookState.chapters[c].completedAt;
                 const isNearlyComplete = vCount > 0 && (readCount / vCount) > 0.9;
                 if (isMarkedComplete || isNearlyComplete) cRead++;
             }
         }
         
         const pct = vTotal > 0 ? vRead/vTotal : 0;
         
         // On inclut si commencé (> 0%)
         if (pct > 0) { 
             const isCompleted = pct >= 0.99; // 99% considéré comme fini
             
             // Trouver le prochain chapitre (pour Reprendre ou Recommencer)
             // ✅ CORRECTION: Utiliser determineResumeChapter au lieu de findFirstIncompleteChapter
             const nextChap = isCompleted ? 1 : this.determineResumeChapter(bookId, bookState, meta.chapters);
             
             // Vitesse spécifique au livre ou globale
             const bookVpm = snap.vpmByBook[bookId] || globalVpm;
             const vLeft = Math.max(0, vTotal - vRead);
             const etaMin = bookVpm > 0 ? vLeft / bookVpm : 0;

             res.push({
                 bookId,
                 bookName: labels[bookId.toUpperCase()] || bookId,
                 percent: pct * 100,
                 isCompleted,
                 chaptersRead: cRead,
                 chaptersTotal: cTotal,
                 versesRead: vRead,
                 versesTotal: vTotal,
                 timeSpentSec: bookState.timeSec,
                 etaMin,
                 avgVpm: bookVpm,
                 nextRef: { book: bookId, chapter: nextChap }
             });
         }
     }
     // On pourrait trier par date de dernière lecture si on l'avait stockée par livre
     return res.reverse(); // Ordre biblique inversé (Apocalypse en premier si lu)
  }
  
  // ✅ LOGIQUE INTELLIGENTE DE REPRISE
  private determineResumeChapter(bookId: string, state: BookState, totalChapters: number): number {
      const activeSession = this.tracker?.getSnapshot().active;
      if (activeSession && activeSession.ref.bookId === bookId) {
          return activeSession.ref.chapter;
      }

      if (!state || !state.chapters) return 1;
      
      const touchedChapters = Object.keys(state.chapters)
          .map(Number)
          .sort((a, b) => b - a);
          
      if (touchedChapters.length > 0) {
          const lastTouched = touchedChapters[0];
          // Si le dernier touché est fini, on prend le suivant
          const chState = state.chapters[lastTouched];
          const isComplete = chState && Object.keys(chState.read).length >= chState.totalVerses;
          
          if (isComplete && lastTouched < totalChapters) {
              return lastTouched + 1;
          }
          return lastTouched;
      }
      return 1;
  }
  
  getStreak() {
      return this.tracker?.getStreak() || { current:0, best:0, lastReadDayISO:null };
  }
  
  async resetAll() {
      // Utiliser la méthode reset du tracker actif (qui utilise le bon adaptateur : Local ou Firebase)
      if (this.tracker) {
          await this.tracker.reset();
      } else {
          // Fallback si pas de tracker (rare)
          const s = await defaultStorage();
          await s.removeItem(DEFAULT_STORAGE_KEY);
      }
      // Recharger un état vierge
      await this.hydrate();
  }

  // ✅ Exposé pour l'UI
  async restartBook(bookId: string) {
      this.tracker?.restartBook(bookId);
      await this.tracker?.persist();
  }
}

export const progress = new ProgressEngine();