import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function MeditationSettingsScreen() {
  const theme = useAppTheme();
  const router = useRouter();

  const [reminder, setReminder] = useState(true);
  const [backgroundMusic, setBackgroundMusic] = useState(false);
  const [duration, setDuration] = useState(10); // minutes

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Section Préférences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Préférences</Text>
          
          <View style={[styles.row, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.rowLeft}>
              <Feather name="clock" size={20} color={theme.colors.onSurface} />
              <Text style={[styles.rowLabel, { color: theme.colors.onSurface }]}>Durée par défaut</Text>
            </View>
            <View style={styles.durationSelector}>
              <TouchableOpacity onPress={() => setDuration(Math.max(5, duration - 5))}>
                <Feather name="minus-circle" size={24} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
              <Text style={[styles.durationText, { color: theme.colors.onSurface }]}>{duration} min</Text>
              <TouchableOpacity onPress={() => setDuration(duration + 5)}>
                <Feather name="plus-circle" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.row, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.rowLeft}>
              <Feather name="music" size={20} color={theme.colors.onSurface} />
              <Text style={[styles.rowLabel, { color: theme.colors.onSurface }]}>Musique d'ambiance</Text>
            </View>
            <Switch
              value={backgroundMusic}
              onValueChange={setBackgroundMusic}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
            />
          </View>
        </View>

        {/* Section Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Notifications</Text>
          
          <View style={[styles.row, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.rowLeft}>
              <Feather name="bell" size={20} color={theme.colors.onSurface} />
              <Text style={[styles.rowLabel, { color: theme.colors.onSurface }]}>Rappel quotidien</Text>
            </View>
            <Switch
              value={reminder}
              onValueChange={setReminder}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
            />
          </View>
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
  durationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  durationText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    minWidth: 60,
    textAlign: 'center',
  },
});
