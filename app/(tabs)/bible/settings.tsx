import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBible } from '@/context/EnhancedBibleContext';

export default function BibleSettingsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { settings, updateSettings, userProgress } = useBible();

  const toggleSwitch = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Zone dangereuse',
      'Voulez-vous vraiment réinitialiser toutes vos données de lecture ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => Alert.alert('Non implémenté', 'Fonctionnalité de sécurité désactivée pour la démo') 
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Section Lecture */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Lecture</Text>
          
          <TouchableOpacity 
            style={[styles.row, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/bible/reader-settings')}
          >
            <View style={styles.rowLeft}>
              <Feather name="type" size={20} color={theme.colors.onSurface} />
              <Text style={[styles.rowLabel, { color: theme.colors.onSurface }]}>Apparence du texte</Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.row, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/bible/version-selector')}
          >
            <View style={styles.rowLeft}>
              <Feather name="book" size={20} color={theme.colors.onSurface} />
              <Text style={[styles.rowLabel, { color: theme.colors.onSurface }]}>Version de la Bible</Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Section Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Options d'affichage</Text>
          
          <View style={[styles.row, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons name="format-list-numbered" size={20} color={theme.colors.onSurface} />
              <Text style={[styles.rowLabel, { color: theme.colors.onSurface }]}>Numéros de versets</Text>
            </View>
            <Switch
              value={settings.verseNumbers}
              onValueChange={() => toggleSwitch('verseNumbers')}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
            />
          </View>

          <View style={[styles.row, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons name="format-color-text" size={20} color={theme.colors.error} />
              <Text style={[styles.rowLabel, { color: theme.colors.onSurface }]}>Paroles de Jésus en rouge</Text>
            </View>
            <Switch
              value={settings.redLetters}
              onValueChange={() => toggleSwitch('redLetters')}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
            />
          </View>
        </View>

        {/* Section Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Statistiques</Text>
          <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{userProgress.chaptersRead}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Chapitres lus</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.outline }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{userProgress.consecutiveDays}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Jours consécutifs</Text>
            </View>
          </View>
        </View>

        {/* Zone Danger */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteData}>
            <Feather name="trash-2" size={20} color={theme.colors.error} />
            <Text style={[styles.dangerText, { color: theme.colors.error }]}>Réinitialiser les données</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
  },
  statsCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '80%',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  dangerText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
});
