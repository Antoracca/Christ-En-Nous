import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Image } from 'expo-image';

const QUICK_ACCESS_ITEMS = [
  { id: 'worship', label: 'Cantiques', icon: 'music-note', color: '#EC4899', route: '/(tabs)/cantiques', useIcon: true },
  { id: 'youth', label: 'Jeunesse', imagePath: require('../../../public/assets/markos.png'), route: '/(tabs)/markos', useIcon: false, isImage: true, noBackground: true },
  { id: 'bomi', label: 'BOMI', imagePath: require('../../../public/assets/mission.png'), color: '#3B82F6', route: '/missions', useIcon: false, isImage: true, noBackground: false },
  { id: 'challenges', label: 'Défis', icon: 'target', color: '#F59E0B', route: '/challenges', useIcon: true },
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
            <View style={[
              styles.iconContainer,
              {
                backgroundColor: item.noBackground ? 'transparent' : (item.isImage ? item.color : item.color + '15'),
                borderWidth: item.noBackground ? 1 : 0,
                borderColor: item.noBackground ? 'rgba(0,0,0,0.08)' : 'transparent',
              }
            ]}>
              {item.useIcon ? (
                <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
              ) : (
                <Image
                  source={item.imagePath}
                  style={styles.imageIcon}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
              )}
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
    borderRadius: 22, // Cercle parfait
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    overflow: 'hidden',
  },
  svgIcon: {
    width: 43,
    height: 43,
  },
  imageIcon: {
    width: 28,
    height: 28,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
  },
});