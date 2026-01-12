// app/components/dev/StorageDebugPanel.tsx
// Panneau de debug pour gérer AsyncStorage (développement uniquement)

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StorageDebug } from '@/utils/clearStorage';

export default function StorageDebugPanel() {
  const [storageSize, setStorageSize] = useState<{
    totalKeys: number;
    bibleKeys: number;
    musicKeys: number;
    cacheKeys: number;
    otherKeys: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Afficher uniquement en mode développement
  if (!__DEV__) {
    return null;
  }

  const handleClearBible = () => {
    Alert.alert(
      'Supprimer les données Bible?',
      'Cela supprimera tous les signets, surlignages, et progression locale.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await StorageDebug.clearBible();
              Alert.alert('✅ Succès', 'Données Bible supprimées');
              loadStorageSize();
            } catch (error) {
              Alert.alert('❌ Erreur', 'Échec de la suppression');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClearMusic = () => {
    Alert.alert(
      'Supprimer les données Music?',
      'Cela supprimera les favoris, playlists, et historique local.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await StorageDebug.clearMusic();
              Alert.alert('✅ Succès', 'Données Music supprimées');
              loadStorageSize();
            } catch (error) {
              Alert.alert('❌ Erreur', 'Échec de la suppression');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Vider le cache Firebase?',
      'Cela supprimera tous les caches locaux Firebase.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await StorageDebug.clearCache();
              Alert.alert('✅ Succès', 'Cache Firebase vidé');
              loadStorageSize();
            } catch (error) {
              Alert.alert('❌ Erreur', 'Échec du vidage');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      '⚠️ DANGER: Tout supprimer?',
      'ATTENTION: Cela supprimera TOUTES les données AsyncStorage, y compris auth!',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'TOUT SUPPRIMER',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await StorageDebug.clearAll();
              Alert.alert('✅ Tout supprimé', 'AsyncStorage complètement vidé');
              loadStorageSize();
            } catch (error) {
              Alert.alert('❌ Erreur', 'Échec de la suppression');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleListKeys = async () => {
    setIsLoading(true);
    try {
      await StorageDebug.list();
      Alert.alert('📋 Liste des clés', 'Vérifiez la console pour voir toutes les clés');
    } catch (error) {
      Alert.alert('❌ Erreur', 'Échec de la récupération des clés');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStorageSize = async () => {
    setIsLoading(true);
    try {
      const size = await StorageDebug.size();
      setStorageSize(size);
    } catch (error) {
      console.error('Erreur lors du calcul de la taille:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadStorageSize();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="bug" size={24} color="#FF6B6B" />
        <Text style={styles.title}>Storage Debug (DEV)</Text>
      </View>

      {storageSize && (
        <View style={styles.stats}>
          <Text style={styles.statsTitle}>📊 Statistiques:</Text>
          <Text style={styles.statsText}>Total: {storageSize.totalKeys} clés</Text>
          <Text style={styles.statsText}>Bible: {storageSize.bibleKeys} clés</Text>
          <Text style={styles.statsText}>Music: {storageSize.musicKeys} clés</Text>
          <Text style={styles.statsText}>Cache: {storageSize.cacheKeys} clés</Text>
          <Text style={styles.statsText}>Autres: {storageSize.otherKeys} clés</Text>
        </View>
      )}

      <ScrollView>
        <TouchableOpacity
          style={[styles.button, styles.buttonWarning]}
          onPress={handleClearBible}
          disabled={isLoading}
        >
          <MaterialCommunityIcons name="book-remove" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Supprimer données Bible</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonWarning]}
          onPress={handleClearMusic}
          disabled={isLoading}
        >
          <MaterialCommunityIcons name="music-off" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Supprimer données Music</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonInfo]}
          onPress={handleClearCache}
          disabled={isLoading}
        >
          <MaterialCommunityIcons name="cached" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Vider cache Firebase</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleListKeys}
          disabled={isLoading}
        >
          <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Lister toutes les clés</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={loadStorageSize}
          disabled={isLoading}
        >
          <MaterialCommunityIcons name="refresh" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Actualiser statistiques</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonDanger]}
          onPress={handleClearAll}
          disabled={isLoading}
        >
          <MaterialCommunityIcons name="delete-forever" size={20} color="#FFF" />
          <Text style={styles.buttonText}>⚠️ TOUT SUPPRIMER</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: '#FF6B6B',
    marginLeft: 8,
  },
  stats: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 8,
    color: '#333',
  },
  statsText: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    marginBottom: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonPrimary: {
    backgroundColor: '#4A90E2',
  },
  buttonInfo: {
    backgroundColor: '#50C878',
  },
  buttonWarning: {
    backgroundColor: '#FF9500',
  },
  buttonDanger: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    marginLeft: 8,
  },
});
