// app/services/firebase/firebaseSyncService.ts
// Service de synchronisation Firebase intelligent - Économise les requêtes
// Stratégie: Cache local (AsyncStorage) + Sync intelligente vers Firestore

import { doc, setDoc, getDoc, updateDoc, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';
import AsyncStorage from '@/utils/storage';

interface SyncConfig {
  debounceMs: number;      // Temps d'attente avant sync (défaut: 3000ms)
  batchSize: number;       // Nombre max d'opérations à grouper
  retryAttempts: number;   // Tentatives en cas d'échec
}

interface PendingWrite {
  path: string;
  data: any;
  timestamp: number;
}

class FirebaseSyncService {
  private config: SyncConfig = {
    debounceMs: 3000,      // 3 secondes de debounce
    batchSize: 10,
    retryAttempts: 3,
  };

  private pendingWrites: Map<string, PendingWrite> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private listeners: Map<string, () => void> = new Map();
  private syncInProgress: boolean = false;

  /**
   * Écrit des données avec debouncing intelligent
   * Évite les écritures excessives vers Firebase
   */
  async syncWrite(
    userId: string,
    collection: string,
    docId: string,
    data: any,
    options: { immediate?: boolean; merge?: boolean } = {}
  ): Promise<void> {
    const path = `${collection}/${docId}`;
    const fullPath = `users/${userId}/${path}`;

    // 1. TOUJOURS écrire en local d'abord (cache)
    const cacheKey = `@firebase_cache_${userId}_${path}`;
    await AsyncStorage.setItem(cacheKey, JSON.stringify(data));

    // 2. Si sync immédiate demandée, écrire directement
    if (options.immediate) {
      return this.writeToFirestore(userId, collection, docId, data, options.merge);
    }

    // 3. Sinon, debounce la sync
    const existingTimer = this.debounceTimers.get(fullPath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Ajouter à pending
    this.pendingWrites.set(fullPath, {
      path: fullPath,
      data,
      timestamp: Date.now(),
    });

    // Programmer la sync
    const timer = setTimeout(async () => {
      await this.flushPendingWrites(userId);
      this.debounceTimers.delete(fullPath);
    }, this.config.debounceMs);

    this.debounceTimers.set(fullPath, timer);
  }

  /**
   * Lit des données (cache-first, puis Firebase)
   */
  async syncRead<T>(
    userId: string,
    collection: string,
    docId: string,
    defaultValue?: T,
    options: { forceRemote?: boolean } = {} // ✅ Nouvelle option
  ): Promise<T | null> {
    const path = `${collection}/${docId}`;
    const cacheKey = `@firebase_cache_${userId}_${path}`;

    try {
      // 1. Essayer le cache local d'abord (RAPIDE) - SAUF SI forceRemote
      if (!options.forceRemote) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const data = JSON.parse(cached);
          // 2. Récupérer Firebase en arrière-plan pour vérifier si à jour
          this.fetchAndUpdateCache(userId, collection, docId, cacheKey).catch(console.error);
          return data as T;
        }
      } else {
          console.log(`☁️ [FirebaseSync] Force Remote Read: ${path}`);
      }

      // 3. Pas de cache ou Force Remote -> aller chercher Firebase
      const docRef = doc(db, `users/${userId}/${collection}`, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as T;

        // Mettre en cache
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));

        return data;
      }

      return defaultValue || null;
    } catch (error) {
      console.error('[FirebaseSync] Read error:', error);
      return defaultValue || null;
    }
  }

  /**
   * Écoute en temps réel les changements d'un document
   * Utile pour sync cross-device
   */
  listenToDocument(
    userId: string,
    collection: string,
    docId: string,
    callback: (data: any) => void
  ): () => void {
    const path = `${collection}/${docId}`;
    const fullPath = `users/${userId}/${path}`;
    const cacheKey = `@firebase_cache_${userId}_${path}`;

    // Créer le listener Firestore
    const docRef = doc(db, `users/${userId}/${collection}`, docId);
    const unsubscribe = onSnapshot(
      docRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          // Mettre à jour le cache
          await AsyncStorage.setItem(cacheKey, JSON.stringify(data));

          // Notifier
          callback(data);
        }
      },
      (error) => {
        console.error('[FirebaseSync] Listener error:', error);
      }
    );

    // Stocker pour cleanup
    this.listeners.set(fullPath, unsubscribe);

    return unsubscribe;
  }

  /**
   * Force le flush de toutes les écritures en attente
   */
  async flushPendingWrites(userId: string): Promise<void> {
    if (this.syncInProgress || this.pendingWrites.size === 0) {
      return;
    }

    this.syncInProgress = true;

    try {
      const writes = Array.from(this.pendingWrites.values());

      console.log(`[FirebaseSync] Flushing ${writes.length} pending writes...`);

      // Batching: Grouper les writes
      for (const write of writes) {
        const parts = write.path.split('/');
        // users/userId/collection/docId
        const collection = parts[2];
        const docId = parts[3];

        await this.writeToFirestore(userId, collection, docId, write.data, true);
        this.pendingWrites.delete(write.path);
      }

      console.log('[FirebaseSync] Flush complete');
    } catch (error) {
      console.error('[FirebaseSync] Flush error:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Écrit directement vers Firestore avec retry
   */
  private async writeToFirestore(
    userId: string,
    collection: string,
    docId: string,
    data: any,
    merge: boolean = true,
    attempt: number = 1
  ): Promise<void> {
    try {
      const docRef = doc(db, `users/${userId}/${collection}`, docId);

      const dataWithTimestamp = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      if (merge) {
        await setDoc(docRef, dataWithTimestamp, { merge: true });
      } else {
        await setDoc(docRef, dataWithTimestamp);
      }

      console.log(`[FirebaseSync] ✅ Synced: ${collection}/${docId}`);
    } catch (error) {
      console.error(`[FirebaseSync] Write error (attempt ${attempt}):`, error);

      // Retry avec backoff exponentiel
      if (attempt < this.config.retryAttempts) {
        const delayMs = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this.writeToFirestore(userId, collection, docId, data, merge, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Récupère depuis Firebase et met à jour le cache en arrière-plan
   */
  private async fetchAndUpdateCache(
    userId: string,
    collection: string,
    docId: string,
    cacheKey: string
  ): Promise<void> {
    try {
      const docRef = doc(db, `users/${userId}/${collection}`, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      }
    } catch (error) {
      // Silent fail - cache reste valide
      console.warn('[FirebaseSync] Background fetch failed:', error);
    }
  }

  /**
   * Nettoie tous les listeners actifs
   */
  cleanup(): void {
    // Annuler tous les timers
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();

    // Unsubscribe listeners
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.clear();

    // Clear pending
    this.pendingWrites.clear();
  }

  /**
   * Vérifie si des writes sont en attente
   */
  hasPendingWrites(): boolean {
    return this.pendingWrites.size > 0;
  }

  /**
   * Configure le service
   */
  configure(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Instance singleton
export const firebaseSyncService = new FirebaseSyncService();

// Export des types
export type { SyncConfig, PendingWrite };
