// app/services/bible/tracking/firebaseStorageAdapter.ts
// Adaptateur Firebase pour le système de tracking Bible
// Remplace AsyncStorage par Firebase avec cache intelligent

import { firebaseSyncService } from '../../firebase/firebaseSyncService';
import type { StorageAdapter } from './progressTracking';

/**
 * Créé un adaptateur de storage pour le ReadingTracker
 * qui utilise Firebase au lieu d'AsyncStorage
 *
 * Stratégie:
 * - Cache local via firebaseSyncService (AsyncStorage interne)
 * - Sync intelligente vers Firestore avec debouncing
 * - Lecture rapide (cache-first)
 * - Écriture différée (3s debounce)
 */
export function createFirebaseStorageAdapter(userId: string): StorageAdapter {
  const COLLECTION = 'bibleTracking';
  const DOC_ID = 'progress';

  return {
    /**
     * Récupère la progression depuis Firebase
     * MODIFIÉ: Force la lecture serveur pour garantir la sync cross-device
     */
    async getItem(key: string): Promise<string | null> {
      try {
        console.log('☁️ [TrackingAdapter] Récupération forcée depuis Firebase...');
        
        // On utilise syncRead mais on sait que c'est la source de vérité au démarrage
        const data = await firebaseSyncService.syncRead<{ value: string }>(
          userId,
          COLLECTION,
          DOC_ID,
          undefined, // defaultValue
          { forceRemote: true } // ✅ FORCE LE RÉSEAU
        );

        if (data && data.value) {
          console.log('✅ [TrackingAdapter] Données reçues du Cloud');
          return data.value;
        }
        
        console.log('⚠️ [TrackingAdapter] Pas de données distantes trouvées');
        return null;
      } catch (error) {
        console.error('[FirebaseStorageAdapter] getItem error:', error);
        return null;
      }
    },

    /**
     * Sauvegarde la progression vers Firebase (avec debouncing)
     * Écrit en local immédiatement, sync Firebase après 3s
     */
    async setItem(key: string, value: string): Promise<void> {
      try {
        await firebaseSyncService.syncWrite(
          userId,
          COLLECTION,
          DOC_ID,
          {
            value,
            key,
          },
          {
            immediate: false, // Debounce de 3s
            merge: true,
          }
        );
      } catch (error) {
        console.error('[FirebaseStorageAdapter] setItem error:', error);
        throw error;
      }
    },

    /**
     * Supprime la progression (rare)
     */
    async removeItem(key: string): Promise<void> {
      try {
        await firebaseSyncService.syncWrite(
          userId,
          COLLECTION,
          DOC_ID,
          {
            value: null,
            deletedAt: new Date().toISOString(),
          },
          {
            immediate: true, // Suppression immédiate
            merge: false,    // Écrase tout
          }
        );
      } catch (error) {
        console.error('[FirebaseStorageAdapter] removeItem error:', error);
        throw error;
      }
    },
  };
}

/**
 * Force la synchronisation immédiate de toutes les données en attente
 * Utile avant logout ou fermeture app
 */
export async function flushBibleTracking(userId: string): Promise<void> {
  await firebaseSyncService.flushPendingWrites(userId);
}

/**
 * Écoute les changements cross-device de la progression
 * Permet de sync en temps réel entre appareils
 */
export function listenToBibleProgress(
  userId: string,
  callback: (progress: any) => void
): () => void {
  const COLLECTION = 'bibleTracking';
  const DOC_ID = 'progress';

  return firebaseSyncService.listenToDocument(
    userId,
    COLLECTION,
    DOC_ID,
    (data) => {
      if (data && data.value) {
        try {
          const parsed = JSON.parse(data.value);
          callback(parsed);
        } catch (error) {
          console.error('[FirebaseStorageAdapter] Parse error:', error);
        }
      }
    }
  );
}
