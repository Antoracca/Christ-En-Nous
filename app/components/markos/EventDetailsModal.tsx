import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '@/hooks/useAppTheme';
import { MarkosEvent } from '@/data/markosData';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface EventDetailsModalProps {
  visible: boolean;
  event: MarkosEvent | null;
  onClose: () => void;
  onParticipate: () => void;
}

export default function EventDetailsModal({ visible, event, onClose, onParticipate }: EventDetailsModalProps) {
  const theme = useAppTheme();

  if (!event) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop flou */}
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        </BlurView>

        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          {/* Image Header */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: event.image }} style={styles.image} contentFit="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageGradient}
            />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{event.type.toUpperCase()}</Text>
              </View>
              <Text style={styles.title}>{event.title}</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Info Grid */}
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                  <Feather name="calendar" size={20} color="#4F46E5" />
                </View>
                <View>
                  <Text style={[styles.infoLabel, { color: theme.colors.outline }]}>Date</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>{event.date}</Text>
                  <Text style={[styles.infoSubValue, { color: theme.colors.primary }]}>{event.time}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                  <Feather name="map-pin" size={20} color="#10B981" />
                </View>
                <View>
                  <Text style={[styles.infoLabel, { color: theme.colors.outline }]}>Lieu</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.onSurface }]} numberOfLines={2}>
                    {event.location}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
                  <Feather name="tag" size={20} color="#F59E0B" />
                </View>
                <View>
                  <Text style={[styles.infoLabel, { color: theme.colors.outline }]}>Participation</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                    {event.price === 0 ? 'Gratuit' : `${event.price} FCFA`}
                  </Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>À propos</Text>
            <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              {event.description || "Aucune description disponible pour cet événement."}
            </Text>

            {/* Participants */}
            <View style={styles.participantsRow}>
              <View style={styles.avatars}>
                {[...Array(3)].map((_, i) => (
                  <View key={i} style={[styles.avatarCircle, { marginLeft: i > 0 ? -10 : 0, zIndex: 3 - i, backgroundColor: theme.colors.primary }]}>
                    <Feather name="user" size={12} color="white" />
                  </View>
                ))}
              </View>
              <Text style={[styles.participantsText, { color: theme.colors.onSurfaceVariant }]}>
                +{event.participants} participants déjà inscrits
              </Text>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Bottom Action Bar */}
          <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline + '20' }]}>
            <TouchableOpacity 
              style={[styles.participateButton, { backgroundColor: theme.colors.primary }]}
              onPress={onParticipate}
            >
              <Text style={styles.participateText}>Je participe</Text>
              <Feather name="check-circle" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  categoryText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Nunito_800ExtraBold',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    padding: 24,
  },
  infoGrid: {
    gap: 20,
    marginBottom: 30,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
  },
  infoSubValue: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 24,
    marginBottom: 24,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 12,
    borderRadius: 16,
  },
  avatars: {
    flexDirection: 'row',
    marginRight: 12,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  participantsText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
  },
  participateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  participateText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
  },
});
