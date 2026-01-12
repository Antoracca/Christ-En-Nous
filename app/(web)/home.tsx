// app/(web)/home.tsx
// Page d'accueil WEB - Version web optimisée

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase/firebaseConfig';

export default function WebHomeScreen() {
  const router = useRouter();
  const { user, userProfile } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/(web)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Christ En Nous</Text>
        <View style={styles.headerRight}>
          <Text style={styles.userName}>
            {userProfile?.prenom || user?.email}
          </Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.nav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>🏠 Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(web)/bible')}
        >
          <Text style={styles.navText}>📖 Bible</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>🙏 Prière</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>🎓 Cours</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(web)/profile')}
        >
          <Text style={styles.navText}>👤 Profil</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Bienvenue {userProfile?.prenom || 'cher ami'}!
          </Text>
          <Text style={styles.heroSubtitle}>
            Que souhaitez-vous faire aujourd'hui?
          </Text>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(web)/bible')}
          >
            <Text style={styles.cardIcon}>📖</Text>
            <Text style={styles.cardTitle}>Lire la Bible</Text>
            <Text style={styles.cardDescription}>
              Accédez à la Parole de Dieu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardIcon}>🙏</Text>
            <Text style={styles.cardTitle}>Prières</Text>
            <Text style={styles.cardDescription}>
              Vos requêtes de prière
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardIcon}>🎓</Text>
            <Text style={styles.cardTitle}>Cours</Text>
            <Text style={styles.cardDescription}>
              Formation biblique
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardIcon}>📺</Text>
            <Text style={styles.cardTitle}>En direct</Text>
            <Text style={styles.cardDescription}>
              Services en live
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userName: {
    fontSize: 14,
    color: '#333',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  logoutText: {
    fontSize: 14,
    color: '#666',
  },
  nav: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  navText: {
    fontSize: 14,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  hero: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    flex: 1,
    minWidth: 200,
    maxWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
});
