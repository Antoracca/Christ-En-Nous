// app/components/cantiques/AudioPlayer.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Cantique } from '@/data/cantiquesData';
import Slider from '@react-native-community/slider';
import { useMusic } from '@/context/MusicContext';

const { width } = Dimensions.get('window');

interface AudioPlayerProps {
  cantique: Cantique;
  language?: 'fr' | 'sg';
  onClose?: () => void;
}

export default function AudioPlayer({ cantique, language = 'fr', onClose }: AudioPlayerProps) {
  const theme = useAppTheme();
  const { isFavorite, toggleFavorite, addToRecentlyPlayed } = useMusic();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [listenStartTime, setListenStartTime] = useState<number>(0);

  // Simulated audio duration (convert "4:32" to seconds)
  useEffect(() => {
    const [mins, secs] = cantique.duration.split(':').map(Number);
    setDuration((mins * 60) + secs);
  }, [cantique.duration]);

  // Track listen start time
  useEffect(() => {
    if (isPlaying && listenStartTime === 0) {
      setListenStartTime(Date.now());
    }
  }, [isPlaying]);

  // Save to recently played when closing or finishing
  useEffect(() => {
    return () => {
      if (listenStartTime > 0) {
        const listenDuration = Math.floor((Date.now() - listenStartTime) / 1000);
        if (listenDuration > 5) { // Only save if listened for more than 5 seconds
          addToRecentlyPlayed(cantique.id, listenDuration);
        }
      }
    };
  }, [listenStartTime, cantique.id]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Here you would integrate with expo-av Audio API
  };

  const handleSeek = (value: number) => {
    setCurrentTime(value);
    // Here you would seek the audio
  };

  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 10);
    setCurrentTime(newTime);
    // Here you would seek the audio
  };

  const handleSkipForward = () => {
    const newTime = Math.min(duration, currentTime + 10);
    setCurrentTime(newTime);
    // Here you would seek the audio
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulate playing progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < duration) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              return duration;
            }
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration, isLooping]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Feather name="chevron-down" size={28} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          {language === 'fr' ? 'En lecture' : 'Yeke na tene'}
        </Text>
        <TouchableOpacity style={styles.moreButton}>
          <Feather name="more-vertical" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Album Art */}
      <View style={styles.albumArtContainer}>
        <View style={[styles.albumArt, { borderColor: theme.colors.outline + '40' }]}>
          <Image
            source={{ uri: cantique.image }}
            style={styles.albumImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.albumGradient}
          />
        </View>
      </View>

      {/* Song Info */}
      <View style={styles.songInfo}>
        <Text style={[styles.songTitle, { color: theme.colors.onSurface }]} numberOfLines={2}>
          {cantique.title[language]}
        </Text>
        <Text style={[styles.songComposer, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
          {cantique.composer}
        </Text>
        {cantique.album && (
          <Text style={[styles.songAlbum, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
            {cantique.album}
          </Text>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={currentTime}
          onValueChange={handleSeek}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.surfaceVariant}
          thumbTintColor={theme.colors.primary}
        />
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: theme.colors.onSurfaceVariant }]}>
            {formatTime(currentTime)}
          </Text>
          <Text style={[styles.timeText, { color: theme.colors.onSurfaceVariant }]}>
            {formatTime(duration)}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setIsLooping(!isLooping)}
        >
          <Feather
            name="repeat"
            size={24}
            color={isLooping ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handleSkipBack}>
          <Feather name="rotate-ccw" size={28} color={theme.colors.onSurface} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
          onPress={handlePlayPause}
        >
          <Feather name={isPlaying ? 'pause' : 'play'} size={36} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handleSkipForward}>
          <Feather name="rotate-cw" size={28} color={theme.colors.onSurface} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowLyrics(!showLyrics)}
        >
          <Feather
            name="file-text"
            size={24}
            color={showLyrics ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </View>

      {/* Additional Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleFavorite(cantique.id)}
        >
          <Feather
            name={isFavorite(cantique.id) ? "heart" : "heart"}
            size={24}
            color={isFavorite(cantique.id) ? theme.colors.error : theme.colors.onSurfaceVariant}
            fill={isFavorite(cantique.id) ? theme.colors.error : 'none'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="share-2" size={24} color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="download" size={24} color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Lyrics (if shown) */}
      {showLyrics && cantique.lyrics && (
        <View style={[styles.lyricsContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={[styles.lyricsTitle, { color: theme.colors.onSurface }]}>
            {language === 'fr' ? 'Paroles' : 'Lɛngɔ'}
          </Text>
          {cantique.lyrics[language].map((line, index) => (
            <Text key={index} style={[styles.lyricsLine, { color: theme.colors.onSurfaceVariant }]}>
              {line}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumArtContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  albumArt: {
    width: width - 80,
    height: width - 80,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  albumImage: {
    width: '100%',
    height: '100%',
  },
  albumGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  songInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  songTitle: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 30,
  },
  songComposer: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 4,
  },
  songAlbum: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    fontStyle: 'italic',
  },
  progressContainer: {
    marginBottom: 30,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 20,
  },
  controlButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 20,
  },
  actionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lyricsContainer: {
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
  },
  lyricsTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  lyricsLine: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
});
