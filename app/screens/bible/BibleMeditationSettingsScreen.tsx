// app/screens/bible/BibleMeditationSettingsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BibleMeditationSettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paramètres Méditation</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default BibleMeditationSettingsScreen;
