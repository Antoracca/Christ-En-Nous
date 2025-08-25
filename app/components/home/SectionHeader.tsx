// app/components/home/SectionHeader.tsx
// A reusable component for section titles within the home screen.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void; // Optional function for the "See All" button
}

const SectionHeader = ({ title, onSeeAll }: SectionHeaderProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.custom.colors.text }]}>
        {title}
      </Text>
      {onSeeAll && (
        <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAll}>
          <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
            Voir tout
          </Text>
          <Feather name="arrow-right" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20, // Consistent padding
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  seeAllText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    marginRight: 5,
  },
});

export default SectionHeader;
