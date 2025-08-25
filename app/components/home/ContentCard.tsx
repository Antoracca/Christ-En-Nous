// app/components/home/ContentCard.tsx
// Carte pour afficher du contenu riche comme les prédications ou les articles.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

interface ContentCardProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  onPress?: () => void;
}

const ContentCard = ({ title, subtitle, imageUrl, onPress }: ContentCardProps) => {
  const theme = useAppTheme();

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.colors.surface }]} onPress={onPress}>
      <Image source={{ uri: imageUrl }} style={styles.cardImage} />
      <View style={styles.textContainer}>
        <Text style={[styles.cardTitle, { color: theme.custom.colors.text }]}>{title}</Text>
        <Text style={[styles.cardSubtitle, { color: theme.custom.colors.placeholder }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={theme.custom.colors.placeholder} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 3,
    height: 90,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 15,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
  },
});

export default ContentCard;
