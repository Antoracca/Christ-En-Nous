// scripts/clearBibleData.js
// Script pour supprimer toutes les données Bible d'AsyncStorage

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function clearAllBibleData() {
  try {
    console.log('🗑️  Suppression des données Bible...');

    // Keys spécifiques à la Bible
    const bibleKeys = [
      '@bible_bookmarks',
      '@bible_highlights',
      '@bible_settings',
      '@bible_progress',
      '@bible_last_reading_position',
      '@bible_sync_queue',
      '@bible_last_sync',
      '@bible_cache',

      // Anciennes clés (au cas où)
      'bible_bookmarks',
      'bible_highlights',
      'bible_settings',
      'bible_progress',

      // Tracking
      '@bible_reading_tracker',
    ];

    // Supprimer toutes les clés
    await AsyncStorage.multiRemove(bibleKeys);

    console.log('✅ Données Bible supprimées avec succès!');
    console.log(`📊 ${bibleKeys.length} clés supprimées`);

  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
  }
}

// Fonction pour lister toutes les clés AsyncStorage
async function listAllKeys() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('📋 Toutes les clés AsyncStorage:');
    keys.forEach(key => console.log('  -', key));
    return keys;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des clés:', error);
  }
}

// Fonction pour tout supprimer (ATTENTION: dangereux!)
async function clearEverything() {
  try {
    console.log('⚠️  SUPPRESSION TOTALE D\'ASYNCSTORAGE...');
    await AsyncStorage.clear();
    console.log('✅ AsyncStorage complètement vidé!');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression totale:', error);
  }
}

// Export des fonctions
module.exports = {
  clearAllBibleData,
  listAllKeys,
  clearEverything,
};

// Si exécuté directement
if (require.main === module) {
  clearAllBibleData();
}
