import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { MarkosEvent } from '@/data/markosData';

export default function EventCard({ event, onPress }: { event: MarkosEvent; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <TouchableOpacity 
      style={[styles.eventCard, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={{ uri: event.image }} style={styles.eventImage} />
      <View style={styles.eventDateBadge}>
        <Text style={styles.eventDateDay}>{event.date.split(' ')[0]}</Text>
        <Text style={styles.eventDateMonth}>{event.date.split(' ')[1].substring(0, 3)}</Text>
      </View>
      <View style={styles.eventInfo}>
        <Text style={styles.eventCategory}>{event.type.toUpperCase()}</Text>
        <Text style={[styles.eventTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
          {event.title}
        </Text>
        <View style={styles.eventDetailsRow}>
          <Feather name="map-pin" size={12} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.eventLocation, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
        <View style={styles.eventPriceRow}>
          <Text style={[styles.eventPrice, { color: theme.colors.primary }]}>
            {event.price === 0 ? 'GRATUIT' : `${event.price} FCFA`}
          </Text>
          <TouchableOpacity style={[styles.buyButton, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.buyButtonText}>Réserver</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    width: 250,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    paddingBottom: 12,
  },
  eventImage: {
    width: '100%',
    height: 130,
    backgroundColor: '#E5E7EB',
  },
  eventDateBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 6,
    alignItems: 'center',
    minWidth: 50,
  },
  eventDateDay: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#1F2937',
  },
  eventDateMonth: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    color: '#EF4444',
    textTransform: 'uppercase',
  },
  eventInfo: {
    padding: 12,
  },
  eventCategory: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    color: '#6B7280',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 6,
  },
  eventDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  eventLocation: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    flex: 1,
  },
  eventPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventPrice: {
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
  },
  buyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
  },
});
