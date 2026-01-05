// app/screens/prayer/PrayerScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PrayerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demandes de Prière</Text>
      {/* Le contenu de cette page sera développé plus tard */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#002366',
  },
});