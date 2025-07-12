import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  // add other routes here if needed
};

export default function Home() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleLogout = () => {
    // À relier avec Firebase Auth si besoin
    navigation.navigate('Login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground
        source={require('assets/images/imagebacklogin.png')}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <Text style={styles.welcome}>Bienvenue, cher(e) frère / sœur !</Text>
      </ImageBackground>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📖 Verset du jour</Text>
        <Text style={styles.verse}>
          &ldquo;L’Éternel est mon berger: je ne manquerai de rien.&ldquo; — Psaume 23:1
        </Text>
      </View>

      <TouchableOpacity style={styles.actionCard}>
        <Ionicons name="calendar" size={24} color="#1D4ED8" style={styles.icon} />
        <Text style={styles.actionText}>Voir les événements</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard}>
        <Ionicons name="people" size={24} color="#1D4ED8" style={styles.icon} />
        <Text style={styles.actionText}>Accéder à la communauté</Text>
      </TouchableOpacity>

      <Button mode="outlined" onPress={handleLogout} style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={18} color="#DC2626" /> Se déconnecter
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#F9FAFB',
  },
  headerBackground: {
    height: 160,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  welcome: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
    borderRadius: 10,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FACC15',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  verse: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actionCard: {
    backgroundColor: '#E0F2FE',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 15,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 20,
    borderColor: '#DC2626',
    alignSelf: 'center',
  },
});
