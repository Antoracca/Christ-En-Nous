import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { MARKOS_EVENTS, MarkosEvent } from '@/data/markosData';
import EventCard from '@/components/markos/EventCard';
import EventDetailsModal from '@/components/markos/EventDetailsModal';
import TopToast from '@/components/markos/TopToast';

export default function AllEventsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = React.useState<MarkosEvent | null>(null);
  const [eventModalVisible, setEventModalVisible] = React.useState(false);
  const [toastVisible, setToastVisible] = React.useState(false);

  const handleEventPress = (event: MarkosEvent) => {
    setSelectedEvent(event);
    setEventModalVisible(true);
  };

  const handleParticipate = () => {
    setEventModalVisible(false);
    setTimeout(() => setToastVisible(true), 300);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* Toast */}
      <TopToast 
        visible={toastVisible} 
        message="Participation confirmée. Shalom !"
        onHide={() => setToastVisible(false)}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Tous les Événements</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* List */}
      <FlatList
        data={MARKOS_EVENTS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <EventCard 
              event={item} 
              onPress={() => handleEventPress(item)}
            />
          </View>
        )}
      />

      {/* Modal */}
      <EventDetailsModal 
        visible={eventModalVisible}
        event={selectedEvent}
        onClose={() => setEventModalVisible(false)}
        onParticipate={handleParticipate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold' },
  listContent: {
    padding: 20,
    alignItems: 'center', // Center cards since they have fixed width in EventCard component
  },
  cardContainer: {
    marginBottom: 20,
  },
});
