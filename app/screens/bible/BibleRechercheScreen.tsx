import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';

export default function BibleRechercheScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const exampleSearches = [
    { text: 'Jean 3:16', category: 'Référence' },
    { text: 'Psaume 23', category: 'Référence' },
    { text: 'Amour', category: 'Thème' },
    { text: 'Foi', category: 'Thème' },
    { text: 'David', category: 'Personnage' },
    { text: 'Espérance', category: 'Thème' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      
      {/* Header avec retour */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.custom.colors.text }]}>
          Recherche Biblique
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Barre de recherche */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
          <Feather name="search" size={20} color={theme.custom.colors.placeholder} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tapez votre recherche..."
            placeholderTextColor={theme.custom.colors.placeholder}
            style={[styles.searchInput, { color: theme.custom.colors.text }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color={theme.custom.colors.placeholder} />
            </TouchableOpacity>
          )}
        </View>

        {/* Recherches rapides */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.custom.colors.text }]}>
            Recherches rapides
          </Text>
          <View style={styles.pillsContainer}>
            {exampleSearches.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSearchQuery(item.text)}
                style={[styles.pill, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary + '30' }]}
              >
                <Text style={[styles.pillText, { color: theme.colors.primary }]}>
                  {item.text}
                </Text>
                <Text style={[styles.pillCategory, { color: theme.custom.colors.placeholder }]}>
                  {item.category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Message si pas de recherche */}
        {searchQuery.length === 0 && (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={[theme.colors.primary + '10', theme.colors.primary + '05']}
              style={styles.emptyStateCard}
            >
              <Feather name="search" size={48} color={theme.colors.primary + '60'} />
              <Text style={[styles.emptyStateTitle, { color: theme.custom.colors.text }]}>
                Commencez votre recherche
              </Text>
              <Text style={[styles.emptyStateText, { color: theme.custom.colors.placeholder }]}>
                Tapez un verset, un thème, ou un nom pour explorer les Écritures
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Résultats (placeholder pour l'instant) */}
        {searchQuery.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.custom.colors.text }]}>
              Résultats pour "{searchQuery}"
            </Text>
            <View style={[styles.resultPlaceholder, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.placeholderText, { color: theme.custom.colors.placeholder }]}>
                Fonctionnalité de recherche en cours de développement...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 12,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  pillText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
  },
  pillCategory: {
    fontSize: 10,
    fontFamily: 'Nunito_400Regular',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    maxWidth: 280,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  resultPlaceholder: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
  },
});