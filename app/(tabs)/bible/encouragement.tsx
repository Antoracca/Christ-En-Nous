import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';

const THOUGHTS = [
  {
    id: '1',
    title: 'La paix dans la tempête',
    verse: 'Je vous laisse la paix, je vous donne ma paix. Jean 14:27',
    content: 'Quand tout s\'agite autour de vous, rappelez-vous que la paix de Dieu ne dépend pas des circonstances extérieures, mais de sa présence intérieure.',
    color: '#EC4899',
  },
  {
    id: '2',
    title: 'Une force nouvelle',
    verse: 'Ceux qui se confient en l\'Éternel renouvellent leur force. Ésaïe 40:31',
    content: 'Ne comptez pas sur vos propres ressources aujourd\'hui. Dieu promet une énergie fraîche à ceux qui savent attendre et espérer en Lui.',
    color: '#8B5CF6',
  },
  {
    id: '3',
    title: 'Jamais seul',
    verse: 'Je suis avec vous tous les jours. Matthieu 28:20',
    content: 'La solitude est un mensonge de l\'ennemi. La vérité est que le Créateur de l\'univers marche à vos côtés à chaque instant.',
    color: '#10B981',
  },
];

export default function BibleEncouragementScreen() {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}>
          Des pensées pour fortifier votre foi au quotidien.
        </Text>

        {THOUGHTS.map((item) => (
          <View key={item.id} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.cardBorder, { backgroundColor: item.color }]} />
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{item.title}</Text>
              <Text style={[styles.cardVerse, { color: item.color }]}>{item.verse}</Text>
              <Text style={[styles.cardText, { color: theme.colors.onSurface }]}>{item.content}</Text>
              
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Feather name="heart" size={20} color={theme.colors.outline} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Feather name="share-2" size={20} color={theme.colors.outline} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  intro: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardBorder: {
    width: 6,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 4,
  },
  cardVerse: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 22,
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  actionBtn: {
    padding: 4,
  },
});