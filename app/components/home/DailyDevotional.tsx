import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useBible } from '../../context/EnhancedBibleContext';

export default function DailyDevotional() {
  const theme = useAppTheme();
  const router = useRouter();
  const { dailyVerse } = useBible();

  return (
    <View style={styles.section}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(tabs)/bible')}>
        <LinearGradient
          colors={[theme.colors.surface, theme.colors.surface]}
          style={[styles.verseCard, { borderColor: theme.colors.outline + '20' }]}
        >
          <View style={styles.verseHeader}>
            <View style={styles.verseHeaderLeft}>
              <MaterialCommunityIcons name="book-open-variant" size={20} color={theme.colors.primary} />
              <Text style={[styles.verseTitle, { color: theme.colors.onSurfaceVariant }]}>PAIN DE VIE</Text>
            </View>
            <Feather name="share-2" size={18} color={theme.colors.primary} />
          </View>
          
          <Text style={[styles.verseText, { color: theme.colors.onSurface }]}>
            "{dailyVerse?.verse || "Car je connais les projets que j'ai formés sur vous, dit l'Éternel..."}"
          </Text>
          
          <View style={styles.verseFooter}>
            <Text style={[styles.verseRef, { color: theme.colors.primary }]}>
              {dailyVerse?.reference || "Jérémie 29:11"}
            </Text>
            <TouchableOpacity 
              style={[styles.meditateBtn, { backgroundColor: theme.colors.primary + '15' }]}
              onPress={() => router.push('/(tabs)/bible/meditation')}
            >
              <Text style={[styles.meditateText, { color: theme.colors.primary }]}>Méditer</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { 
    marginTop: 24, 
    paddingHorizontal: 20 
  },
  verseCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  verseHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  verseHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  verseTitle: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', letterSpacing: 1 },
  verseText: { fontSize: 18, fontFamily: 'Nunito_600SemiBold', fontStyle: 'italic', lineHeight: 28 },
  verseFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  verseRef: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  meditateBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
  meditateText: { fontSize: 12, fontFamily: 'Nunito_700Bold' },
});
