// screens/live/LiveScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function LiveScreen() {
  const theme = useAppTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Ionicons name="radio" size={64} color={theme.colors.primary} />
      <Text style={[styles.title, { color: theme.custom.colors.text }]}>
        Diffusion en Direct
      </Text>
      <Text style={[styles.subtitle, { color: theme.custom.colors.placeholder }]}>
        Rejoignez-nous pour le culte en direct
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
});