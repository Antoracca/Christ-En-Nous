// app/utils/debugCache.ts
// Script de debug pour tester le vidage du cache

import AsyncStorage from '@/utils/storage';
import { firebaseSyncService } from '@/services/firebase/firebaseSyncService';

/**
 * Affiche toutes les clés AsyncStorage
 */
export async function listAllAsyncStorageKeys(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('=== TOUTES LES CLÉS ASYNCSTORAGE ===');
    console.log(`Total: ${allKeys.length} clés`);

    const grouped: Record<string, string[]> = {
      'Cache Firebase': [],
      'Autre': []
    };

    allKeys.forEach(key => {
      if (key.startsWith('@firebase_cache_')) {
        grouped['Cache Firebase'].push(key);
      } else {
        grouped['Autre'].push(key);
      }
    });

    console.log('\n📦 Cache Firebase:', grouped['Cache Firebase'].length);
    grouped['Cache Firebase'].forEach(k => console.log(`  - ${k}`));

    console.log('\n📦 Autres clés:', grouped['Autre'].length);
    grouped['Autre'].forEach(k => console.log(`  - ${k}`));

    console.log('=====================================\n');
  } catch (error) {
    console.error('Erreur:', error);
  }
}

/**
 * Vide le cache d'un utilisateur et affiche le résultat
 */
export async function clearAndVerify(userId: string): Promise<void> {
  console.log('\n🧪 TEST DE VIDAGE DU CACHE');
  console.log('==========================\n');

  // Avant
  console.log('📊 AVANT VIDAGE:');
  await listAllAsyncStorageKeys();

  // Vidage
  console.log('\n🗑️ VIDAGE EN COURS...');
  await firebaseSyncService.clearUserCache(userId);

  // Après
  console.log('\n📊 APRÈS VIDAGE:');
  await listAllAsyncStorageKeys();

  console.log('\n✅ Test terminé!\n');
}

/**
 * Vide TOUT AsyncStorage (utiliser avec précaution!)
 */
export async function nukeAllAsyncStorage(): Promise<void> {
  try {
    console.warn('⚠️ SUPPRESSION TOTALE DE ASYNCSTORAGE!');
    const allKeys = await AsyncStorage.getAllKeys();
    console.log(`Suppression de ${allKeys.length} clés...`);

    await AsyncStorage.multiRemove(allKeys);

    console.log('✅ Tout a été supprimé!');

    // Vérification
    const remaining = await AsyncStorage.getAllKeys();
    console.log(`Vérification: ${remaining.length} clés restantes`);
  } catch (error) {
    console.error('Erreur:', error);
  }
}

/**
 * Affiche le contenu d'une clé spécifique
 */
export async function inspectKey(key: string): Promise<void> {
  try {
    const value = await AsyncStorage.getItem(key);
    console.log(`\n🔍 Inspection de: ${key}`);
    console.log('=================================');
    if (value) {
      const parsed = JSON.parse(value);
      console.log(JSON.stringify(parsed, null, 2));
    } else {
      console.log('(vide ou inexistant)');
    }
    console.log('=================================\n');
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Pour utiliser dans la console:
// import * as DebugCache from '@/utils/debugCache';
// await DebugCache.listAllAsyncStorageKeys();
// await DebugCache.clearAndVerify('USER_ID');
// await DebugCache.inspectKey('@firebase_cache_USER_ID_meditationProgress/state');
