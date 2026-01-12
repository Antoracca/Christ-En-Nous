// app/(tabs)/bible/settings.tsx
// Refonte V2 Premium : Design unifié avec le reste de l'app.

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
import { progress } from '@/services/bible/tracking/progressTracking';

const SettingCard = ({ title, icon, color, children, theme }: any) => (
  <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline + '10' }]}>
    <View style={styles.cardHeader}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.cardTitle, { color: theme.custom.colors.text }]}>{title}</Text>
    </View>
    <View style={styles.cardContent}>
      {children}
    </View>
  </View>
);

const SettingRow = ({ label, sublabel, icon, onPress, theme }: any) => (
  <TouchableOpacity 
    style={[styles.row, { borderBottomColor: theme.colors.outline + '10' }]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.rowLeft}>
      {icon && <Feather name={icon} size={20} color={theme.custom.colors.placeholder} style={{marginRight: 12}} />}
      <View>
        <Text style={[styles.rowLabel, { color: theme.custom.colors.text }]}>{label}</Text>
        {sublabel && <Text style={[styles.rowSublabel, { color: theme.custom.colors.placeholder }]}>{sublabel}</Text>}
      </View>
    </View>
    <Feather name="chevron-right" size={20} color={theme.custom.colors.placeholder} />
  </TouchableOpacity>
);

const SwitchRow = ({ label, value, onValueChange, icon, color, theme }: any) => (
  <View style={[styles.row, { borderBottomColor: theme.colors.outline + '10' }]}>
    <View style={styles.rowLeft}>
      <MaterialCommunityIcons name={icon} size={22} color={value ? color : theme.custom.colors.placeholder} style={{marginRight: 12}} />
      <Text style={[styles.rowLabel, { color: theme.custom.colors.text }]}>{label}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: theme.colors.outline + '40', true: color + '50' }}
      thumbColor={value ? color : '#f4f3f4'}
    />
  </View>
);

export default function BibleSettingsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { settings, updateSettings, userProgress } = useBible();

  const toggleSwitch = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleReset = () => {
    Alert.alert(
      'Zone dangereuse',
      'Voulez-vous vraiment réinitialiser TOUTES vos données (lecture, temps, historique) ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Tout effacer', 
          style: 'destructive',
          onPress: async () => {
             await progress.resetAll();
             Alert.alert("Succès", "Toutes les données ont été effacées.");
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Section Apparence */}
        <SettingCard title="Apparence & Lecture" icon="eye" color={theme.colors.primary} theme={theme}>
          <SettingRow 
            label="Préférences de lecture" 
            sublabel="Police, taille, interligne"
            icon="type"
            onPress={() => router.push('/bible/reader-settings')}
            theme={theme}
          />
          <SettingRow 
            label="Version de la Bible" 
            sublabel="Choisir une traduction"
            icon="book"
            onPress={() => router.push('/bible/version-selector')}
            theme={theme}
          />
        </SettingCard>

        {/* Section Options */}
        <SettingCard title="Options d'affichage" icon="sliders" color={theme.colors.secondary} theme={theme}>
          <SwitchRow 
            label="Numéros de versets" 
            value={settings.verseNumbers}
            onValueChange={() => toggleSwitch('verseNumbers')}
            icon="format-list-numbered"
            color={theme.colors.secondary}
            theme={theme}
          />
          <SwitchRow 
            label="Paroles de Jésus en rouge" 
            value={settings.redLetters}
            onValueChange={() => toggleSwitch('redLetters')}
            icon="format-color-text"
            color={theme.colors.error}
            theme={theme}
          />
        </SettingCard>

        {/* Section Stats Rapides */}
        <SettingCard title="Aperçu des Stats" icon="bar-chart-2" color={theme.colors.tertiary} theme={theme}>
           <View style={styles.statsContainer}>
               <View style={styles.statItem}>
                   <Text style={[styles.statValue, { color: theme.colors.tertiary }]}>{userProgress.chaptersRead}</Text>
                   <Text style={[styles.statLabel, { color: theme.custom.colors.placeholder }]}>Chapitres</Text>
               </View>
               <View style={[styles.verticalDivider, { backgroundColor: theme.colors.outline + '20' }]} />
               <View style={styles.statItem}>
                   <Text style={[styles.statValue, { color: theme.colors.tertiary }]}>{userProgress.consecutiveDays}</Text>
                   <Text style={[styles.statLabel, { color: theme.custom.colors.placeholder }]}>Jours streak</Text>
               </View>
           </View>
        </SettingCard>

        {/* Zone Danger */}
        <TouchableOpacity 
            style={[styles.dangerButton, { backgroundColor: theme.colors.error + '10', borderColor: theme.colors.error + '30' }]}
            onPress={handleReset}
            activeOpacity={0.8}
        >
            <Feather name="trash-2" size={18} color={theme.colors.error} />
            <Text style={[styles.dangerText, { color: theme.colors.error }]}>Réinitialiser toutes les données</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: theme.custom.colors.placeholder }]}>
            Christ-En-Nous Bible v1.0 • Synchronisation Cloud Active
        </Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    gap: 12
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 8
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
  },
  rowSublabel: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    marginTop: 2
  },

  statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 12,
      alignItems: 'center'
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontFamily: 'Nunito_900Black' },
  statLabel: { fontSize: 12, fontFamily: 'Nunito_600SemiBold' },
  verticalDivider: { width: 1, height: 30 },

  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    marginTop: 8,
    marginBottom: 16
  },
  dangerText: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
  },
  versionText: {
      textAlign: 'center',
      fontSize: 11,
      fontFamily: 'Nunito_500Medium',
      opacity: 0.5
  }
});