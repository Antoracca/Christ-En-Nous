// app/utils/clearStorage.ts
// Utilitaire pour supprimer les données AsyncStorage

import AsyncStorage from '@/utils/storage';

/**
 * Clés AsyncStorage utilisées par l'application
 */
export const STORAGE_KEYS = {
  // Bible
  BIBLE_BOOKMARKS: '@bible_bookmarks',
  BIBLE_HIGHLIGHTS: '@bible_highlights',
  BIBLE_SETTINGS: '@bible_settings',
  BIBLE_PROGRESS: '@bible_progress',
  BIBLE_LAST_POSITION: '@bible_last_reading_position',
  BIBLE_SYNC_QUEUE: '@bible_sync_queue',
  BIBLE_LAST_SYNC: '@bible_last_sync',
  BIBLE_TRACKER: '@bible_reading_tracker',

  // Cache Firebase
  FIREBASE_CACHE: '@firebase_cache_',

  // Music (MusicContext)
  MUSIC_FAVORITES: '@music_favorites',
  MUSIC_PLAYLISTS: '@music_playlists',
  MUSIC_RECENTLY_PLAYED: '@music_recently_played',

  // Auth
  AUTH_TOKEN: '@auth_token',
  USER_PROFILE: '@user_profile',
};

/**
 * Supprime toutes les données Bible d'AsyncStorage
 */
export async function clearBibleData(): Promise<void> {
  try {
    console.log('🗑️  Suppression des données Bible...');

    const keys = [
      STORAGE_KEYS.BIBLE_BOOKMARKS,
      STORAGE_KEYS.BIBLE_HIGHLIGHTS,
      STORAGE_KEYS.BIBLE_SETTINGS,
      STORAGE_KEYS.BIBLE_PROGRESS,
      STORAGE_KEYS.BIBLE_LAST_POSITION,
      STORAGE_KEYS.BIBLE_SYNC_QUEUE,
      STORAGE_KEYS.BIBLE_LAST_SYNC,
      STORAGE_KEYS.BIBLE_TRACKER,
    ];

    await AsyncStorage.multiRemove(keys);

    // Supprimer aussi les caches Firebase pour Bible
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key =>
      key.startsWith('@firebase_cache_') && key.includes('bible')
    );

    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }

    console.log('✅ Données Bible supprimées:', keys.length + cacheKeys.length, 'clés');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des données Bible:', error);
    throw error;
  }
}

/**
 * Supprime toutes les données Music d'AsyncStorage
 */
export async function clearMusicData(): Promise<void> {
  try {
    console.log('🗑️  Suppression des données Music...');

    const keys = [
      STORAGE_KEYS.MUSIC_FAVORITES,
      STORAGE_KEYS.MUSIC_PLAYLISTS,
      STORAGE_KEYS.MUSIC_RECENTLY_PLAYED,
    ];

    await AsyncStorage.multiRemove(keys);
    console.log('✅ Données Music supprimées');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des données Music:', error);
    throw error;
  }
}

/**
 * Supprime tous les caches Firebase d'AsyncStorage
 */
export async function clearFirebaseCache(): Promise<void> {
  try {
    console.log('🗑️  Suppression des caches Firebase...');

    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key => key.startsWith('@firebase_cache_'));

    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('✅ Caches Firebase supprimés:', cacheKeys.length, 'clés');
    } else {
      console.log('ℹ️  Aucun cache Firebase à supprimer');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des caches Firebase:', error);
    throw error;
  }
}

/**
 * Liste toutes les clés présentes dans AsyncStorage
 */
export async function listAllStorageKeys(): Promise<string[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('📋 Clés AsyncStorage:', keys.length);
    keys.forEach(key => console.log('  -', key));
    return keys;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des clés:', error);
    return [];
  }
}

/**
 * Obtient la taille estimée des données stockées
 */
export async function getStorageSize(): Promise<{
  totalKeys: number;
  bibleKeys: number;
  musicKeys: number;
  cacheKeys: number;
  otherKeys: number;
}> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();

    const bibleKeys = allKeys.filter(key =>
      key.includes('bible') || key.startsWith('@bible_')
    );

    const musicKeys = allKeys.filter(key =>
      key.includes('music') || key.startsWith('@music_')
    );

    const cacheKeys = allKeys.filter(key =>
      key.startsWith('@firebase_cache_')
    );

    const otherKeys = allKeys.filter(key =>
      !bibleKeys.includes(key) &&
      !musicKeys.includes(key) &&
      !cacheKeys.includes(key)
    );

    return {
      totalKeys: allKeys.length,
      bibleKeys: bibleKeys.length,
      musicKeys: musicKeys.length,
      cacheKeys: cacheKeys.length,
      otherKeys: otherKeys.length,
    };
  } catch (error) {
    console.error('❌ Erreur lors du calcul de la taille:', error);
    return {
      totalKeys: 0,
      bibleKeys: 0,
      musicKeys: 0,
      cacheKeys: 0,
      otherKeys: 0,
    };
  }
}

/**
 * Supprime TOUTES les données d'AsyncStorage (DANGEREUX!)
 * À utiliser uniquement en développement
 */
export async function clearAllStorage(): Promise<void> {
  try {
    console.log('⚠️  SUPPRESSION TOTALE D\'ASYNCSTORAGE...');
    await AsyncStorage.clear();
    console.log('✅ AsyncStorage complètement vidé!');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression totale:', error);
    throw error;
  }
}

/**
 * Utilitaire tout-en-un pour le développement
 */
export const StorageDebug = {
  clearBible: clearBibleData,
  clearMusic: clearMusicData,
  clearCache: clearFirebaseCache,
  clearAll: clearAllStorage,
  list: listAllStorageKeys,
  size: getStorageSize,
};

// Export global pour utilisation dans la console
if (__DEV__) {
  (global as any).StorageDebug = StorageDebug;
  console.log('📦 StorageDebug disponible dans la console globale');
}
