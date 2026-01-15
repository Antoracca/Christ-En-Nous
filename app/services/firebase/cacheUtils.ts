// app/services/firebase/cacheUtils.ts
// Utilitaires pour gérer le cache local

import { firebaseSyncService } from './firebaseSyncService';

/**
 * Vide le cache local d'un utilisateur
 * À utiliser quand les données Firebase ont été supprimées mais restent localement
 */
export async function clearUserCache(userId: string): Promise<void> {
  await firebaseSyncService.clearUserCache(userId);
}

/**
 * Vide TOUT le cache local (tous les utilisateurs)
 * ⚠️ À utiliser avec précaution
 */
export async function clearAllCache(): Promise<void> {
  await firebaseSyncService.clearAllCache();
}

/**
 * Fonction de debug pour afficher le contenu du cache
 */
export async function debugCacheInfo(userId: string): Promise<void> {
  try {
    const AsyncStorage = (await import('@/utils/storage')).default;
    const allKeys = await AsyncStorage.getAllKeys();
    const userCacheKeys = allKeys.filter(key =>
      key.startsWith(`@firebase_cache_${userId}_`)
    );

    console.log('=== CACHE INFO ===');
    console.log(`Utilisateur: ${userId}`);
    console.log(`Nombre d'entrées en cache: ${userCacheKeys.length}`);
    console.log('Clés:', userCacheKeys);
    console.log('==================');
  } catch (error) {
    console.error('Erreur lors de l\'inspection du cache:', error);
  }
}
