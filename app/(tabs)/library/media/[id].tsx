// Écran de détail d'un média
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { LIBRARY_MEDIA, MediaItem, PodcastEpisode, Book, Reference } from '@/data/libraryData';
import SubscriptionModal from '@/components/library/SubscriptionModal';
import { SubscriptionBundle } from '@/data/libraryData';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function MediaDetailScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const media = LIBRARY_MEDIA.find(m => m.id === id);

  if (!media) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.onSurface }]}>
            Contenu introuvable
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handlePlay = () => {
    if (media.accessType === 'premium' || media.accessType === 'subscription') {
      setShowSubscriptionModal(true);
    } else if (media.accessType === 'purchase') {
      Alert.alert(
        'Achat requis',
        `Ce contenu coûte ${media.price} FCFA. Voulez-vous l'acheter ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Acheter',
            onPress: () => {
              // TODO: Implémenter le paiement
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Succès', 'Achat effectué avec succès !');
            },
          },
        ]
      );
    } else {
      // Contenu gratuit - démarrer la lecture
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert('Lecture', 'Démarrage de la lecture...');
    }
  };

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLiked(!isLiked);
  };

  const getAccessButton = () => {
    switch (media.accessType) {
      case 'free':
        return (
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
            onPress={handlePlay}
          >
            <MaterialCommunityIcons name="play" size={24} color="white" />
            <Text style={styles.playButtonText}>Lire / Écouter</Text>
          </TouchableOpacity>
        );
      case 'premium':
      case 'subscription':
        return (
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: '#8B5CF6' }]}
            onPress={handlePlay}
          >
            <MaterialCommunityIcons name="crown" size={24} color="white" />
            <Text style={styles.playButtonText}>Accéder avec abonnement</Text>
          </TouchableOpacity>
        );
      case 'purchase':
        return (
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: '#F59E0B' }]}
            onPress={handlePlay}
          >
            <MaterialCommunityIcons name="cart" size={24} color="white" />
            <Text style={styles.playButtonText}>Acheter {media.price} FCFA</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      
      {/* Header avec image */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: media.thumbnail }} style={styles.headerImage} contentFit="cover" />
        <LinearGradient
          colors={['transparent', theme.colors.background]}
          style={styles.headerGradient}
        />
        
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={[styles.backButtonHeader, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.likeButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
            onPress={handleLike}
          >
            <Feather name={isLiked ? "heart" : "heart"} size={24} color={isLiked ? "#EF4444" : "white"} fill={isLiked ? "#EF4444" : "none"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Type Badge */}
        <View style={[styles.typeBadge, { backgroundColor: theme.colors.primary + '15' }]}>
          <Text style={[styles.typeText, { color: theme.colors.primary }]}>
            {media.type.toUpperCase()}
          </Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {media.title}
        </Text>

        {/* Author */}
        <View style={styles.authorRow}>
          {media.authorAvatar && (
            <Image source={{ uri: media.authorAvatar }} style={styles.authorAvatar} contentFit="cover" />
          )}
          <View style={styles.authorInfo}>
            <Text style={[styles.authorName, { color: theme.colors.onSurface }]}>
              {media.author}
            </Text>
            <Text style={[styles.publishedDate, { color: theme.colors.onSurfaceVariant }]}>
              Publié le {new Date(media.publishedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Feather name="eye" size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
              {media.views.toLocaleString()} vues
            </Text>
          </View>
          <View style={styles.statItem}>
            <Feather name="heart" size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
              {media.likes} likes
            </Text>
          </View>
          {media.duration && (
            <View style={styles.statItem}>
              <Feather name="clock" size={16} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                {media.duration}
              </Text>
            </View>
          )}
          {media.rating && (
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
              <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                {media.rating}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={[styles.descriptionCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.descriptionTitle, { color: theme.colors.onSurface }]}>
            Description
          </Text>
          <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
            {media.description}
          </Text>
        </View>

        {/* Détails spécifiques selon le type */}
        {media.type === 'book' && (media as Book).pages && (
          <View style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.detailsTitle, { color: theme.colors.onSurface }]}>Détails</Text>
            <View style={styles.detailsRow}>
              <Text style={[styles.detailsLabel, { color: theme.colors.onSurfaceVariant }]}>Pages:</Text>
              <Text style={[styles.detailsValue, { color: theme.colors.onSurface }]}>
                {(media as Book).pages}
              </Text>
            </View>
            {(media as Book).chapters && (
              <View style={styles.detailsRow}>
                <Text style={[styles.detailsLabel, { color: theme.colors.onSurfaceVariant }]}>Chapitres:</Text>
                <Text style={[styles.detailsValue, { color: theme.colors.onSurface }]}>
                  {(media as Book).chapters}
                </Text>
              </View>
            )}
            {(media as Book).publisher && (
              <View style={styles.detailsRow}>
                <Text style={[styles.detailsLabel, { color: theme.colors.onSurfaceVariant }]}>Éditeur:</Text>
                <Text style={[styles.detailsValue, { color: theme.colors.onSurface }]}>
                  {(media as Book).publisher}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Tags */}
        {media.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {media.tags.map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={[styles.tagText, { color: theme.colors.onSurfaceVariant }]}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Button */}
        <View style={styles.actionContainer}>
          {getAccessButton()}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={(bundle: SubscriptionBundle) => {
          console.log('Abonnement:', bundle);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  headerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: -40,
    marginBottom: 16,
  },
  typeText: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
  },
  title: {
    fontSize: 26,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 12,
    lineHeight: 32,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 2,
  },
  publishedDate: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
  },
  descriptionCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  descriptionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 24,
  },
  detailsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  detailsTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailsLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
  },
  detailsValue: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },
  actionContainer: {
    marginTop: 8,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  playButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
});
