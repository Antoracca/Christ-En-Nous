// app/components/cantiques/CantiqueCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Cantique } from '@/data/cantiquesData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

interface CantiqueCardProps {
  cantique: Cantique;
  onPress: () => void;
  onFavorite?: () => void;
  onPlay?: () => void;
  language?: 'fr' | 'sg';
  horizontal?: boolean;
}

export default function CantiqueCard({
  cantique,
  onPress,
  onFavorite,
  onPlay,
  language = 'fr',
  horizontal = false,
}: CantiqueCardProps) {
  const theme = useAppTheme();

  if (horizontal) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={[
          styles.horizontalContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline + '20',
          },
        ]}
      >
        <View style={styles.horizontalImageContainer}>
          <Image
            source={{ uri: cantique.image }}
            style={styles.horizontalImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.horizontalGradient}
          />
        </View>

        <View style={styles.horizontalContent}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.horizontalTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
              {cantique.title[language]}
            </Text>
            <View style={styles.horizontalMeta}>
              <Feather name="user" size={12} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.horizontalComposer, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
                {cantique.composer}
              </Text>
            </View>
            <View style={styles.horizontalFooter}>
              <View style={styles.durationBadge}>
                <Feather name="clock" size={12} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.durationText, { color: theme.colors.onSurfaceVariant }]}>
                  {cantique.duration}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.horizontalActions}>
            {onFavorite && (
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: theme.colors.errorContainer }]}
                onPress={onFavorite}
              >
                <Feather
                  name={cantique.isFavorite ? 'heart' : 'heart'}
                  size={18}
                  color={cantique.isFavorite ? theme.colors.error : theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            )}
            {onPlay && (
              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
                onPress={onPlay}
              >
                <Feather name="play" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline + '20',
        },
      ]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: cantique.image }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        {onFavorite && (
          <TouchableOpacity
            style={[styles.favoriteButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            onPress={onFavorite}
          >
            <Feather
              name={cantique.isFavorite ? 'heart' : 'heart'}
              size={20}
              color={cantique.isFavorite ? theme.colors.error : 'white'}
            />
          </TouchableOpacity>
        )}
        {cantique.releaseYear === new Date().getFullYear() && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>{language === 'fr' ? 'NOUVEAU' : 'KUƐ'}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={2}>
          {cantique.title[language]}
        </Text>

        <View style={styles.composerRow}>
          <Feather name="user" size={12} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.composer, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
            {cantique.composer}
          </Text>
        </View>

        {cantique.album && (
          <View style={styles.albumRow}>
            <Feather name="disc" size={12} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.album, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
              {cantique.album}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.metaItem}>
            <Feather name="clock" size={14} color={theme.colors.primary} />
            <Text style={[styles.duration, { color: theme.colors.onSurfaceVariant }]}>
              {cantique.duration}
            </Text>
          </View>

          {onPlay && (
            <TouchableOpacity
              style={[styles.playButtonLarge, { backgroundColor: theme.colors.primary }]}
              onPress={onPlay}
            >
              <Feather name="play" size={16} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Vertical Card Styles
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    width: 280,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  imageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    letterSpacing: 0.5,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 8,
    lineHeight: 20,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  composer: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    flex: 1,
  },
  albumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  album: {
    fontSize: 11,
    fontFamily: 'Nunito_400Regular',
    flex: 1,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },
  playButtonLarge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Horizontal Card Styles
  horizontalContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    width: CARD_WIDTH,
  },
  horizontalImageContainer: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  horizontalGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
  },
  horizontalContent: {
    flex: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalTitle: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 4,
  },
  horizontalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  horizontalComposer: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    flex: 1,
  },
  horizontalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
  },
  horizontalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
