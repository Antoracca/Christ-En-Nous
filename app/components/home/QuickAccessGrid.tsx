import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';

const QUICK_ACCESS_ITEMS = [
  { id: 'worship', label: 'Cantiques', icon: 'music-note', color: '#EC4899', route: '/worship' },
  { id: 'youth', label: 'Jeunesse', icon: 'account-group', color: '#F97316', route: '/youth' },
  { id: 'bomi', label: 'BOMI', icon: 'earth', color: '#10B981', route: '/missions' },
  { id: 'challenges', label: 'Défis', icon: 'target', color: '#F59E0B', route: '/challenges' },
];

export default function QuickAccessGrid() {
  const theme = useAppTheme();
  const router = useRouter();

  const handlePress = (route: string) => {
    if (route.startsWith('/')) {
      router.push(route as any);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>Découvrir</Text>
      
      <View style={styles.grid}>
        {QUICK_ACCESS_ITEMS.map((item) => (
          <TouchableOpacity 
            key={item.id}
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => handlePress(item.route)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
              <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
            </View>
            <Text style={[styles.label, { color: theme.colors.onSurface }]} numberOfLines={1}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    width: '23%',
    height: 90,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
  },
});