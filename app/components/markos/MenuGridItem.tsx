import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

const { width } = Dimensions.get('window');

interface MenuGridItemProps {
  title: string;
  icon: any;
  color: string;
  subtitle: string;
  onPress: () => void;
}

export default function MenuGridItem({ title, icon, color, subtitle, onPress }: MenuGridItemProps) {
  const theme = useAppTheme();
  return (
    <TouchableOpacity 
      style={[styles.menuGridItem, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <View style={[styles.menuIconCircle, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.menuGridTitle, { color: theme.colors.onSurface }]}>{title}</Text>
      <Text style={[styles.menuGridSubtitle, { color: theme.colors.onSurfaceVariant }]}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuGridItem: {
    width: (width - 52) / 2, // 20 padding * 2 + 12 gap = 52
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  menuIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuGridTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 2,
  },
  menuGridSubtitle: {
    fontSize: 11,
    fontFamily: 'Nunito_500Medium',
  },
});
