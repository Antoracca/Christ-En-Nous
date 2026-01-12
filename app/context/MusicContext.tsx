// app/context/MusicContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cantique } from '@/data/cantiquesData';

interface Playlist {
  id: string;
  name: string;
  description?: string;
  cantiqueIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface ListenHistory {
  cantiqueId: string;
  listenedAt: string;
  duration: number; // seconds listened
}

interface MusicContextType {
  favorites: string[];
  playlists: Playlist[];
  recentlyPlayed: ListenHistory[];

  // Favorites
  toggleFavorite: (cantiqueId: string) => Promise<void>;
  isFavorite: (cantiqueId: string) => boolean;

  // Playlists
  createPlaylist: (name: string, description?: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addToPlaylist: (playlistId: string, cantiqueId: string) => Promise<void>;
  removeFromPlaylist: (playlistId: string, cantiqueId: string) => Promise<void>;

  // Recently Played
  addToRecentlyPlayed: (cantiqueId: string, duration: number) => Promise<void>;
  getRecentlyPlayedCantiques: (limit?: number) => string[];

  // Loading state
  isLoading: boolean;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FAVORITES: '@music_favorites',
  PLAYLISTS: '@music_playlists',
  RECENTLY_PLAYED: '@music_recently_played',
};

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<ListenHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [favoritesData, playlistsData, recentlyPlayedData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
        AsyncStorage.getItem(STORAGE_KEYS.PLAYLISTS),
        AsyncStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED),
      ]);

      if (favoritesData) setFavorites(JSON.parse(favoritesData));
      if (playlistsData) setPlaylists(JSON.parse(playlistsData));
      if (recentlyPlayedData) setRecentlyPlayed(JSON.parse(recentlyPlayedData));
    } catch (error) {
      console.error('Error loading music data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // FAVORITES
  const toggleFavorite = async (cantiqueId: string) => {
    try {
      const newFavorites = favorites.includes(cantiqueId)
        ? favorites.filter((id) => id !== cantiqueId)
        : [...favorites, cantiqueId];

      setFavorites(newFavorites);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isFavorite = (cantiqueId: string) => {
    return favorites.includes(cantiqueId);
  };

  // PLAYLISTS
  const createPlaylist = async (name: string, description?: string) => {
    try {
      const newPlaylist: Playlist = {
        id: Date.now().toString(),
        name,
        description,
        cantiqueIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newPlaylists = [...playlists, newPlaylist];
      setPlaylists(newPlaylists);
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(newPlaylists));
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    try {
      const newPlaylists = playlists.filter((p) => p.id !== playlistId);
      setPlaylists(newPlaylists);
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(newPlaylists));
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const addToPlaylist = async (playlistId: string, cantiqueId: string) => {
    try {
      const newPlaylists = playlists.map((playlist) => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            cantiqueIds: playlist.cantiqueIds.includes(cantiqueId)
              ? playlist.cantiqueIds
              : [...playlist.cantiqueIds, cantiqueId],
            updatedAt: new Date().toISOString(),
          };
        }
        return playlist;
      });

      setPlaylists(newPlaylists);
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(newPlaylists));
    } catch (error) {
      console.error('Error adding to playlist:', error);
    }
  };

  const removeFromPlaylist = async (playlistId: string, cantiqueId: string) => {
    try {
      const newPlaylists = playlists.map((playlist) => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            cantiqueIds: playlist.cantiqueIds.filter((id) => id !== cantiqueId),
            updatedAt: new Date().toISOString(),
          };
        }
        return playlist;
      });

      setPlaylists(newPlaylists);
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(newPlaylists));
    } catch (error) {
      console.error('Error removing from playlist:', error);
    }
  };

  // RECENTLY PLAYED
  const addToRecentlyPlayed = async (cantiqueId: string, duration: number) => {
    try {
      const newHistory: ListenHistory = {
        cantiqueId,
        listenedAt: new Date().toISOString(),
        duration,
      };

      // Remove old entry if exists, add new one at the beginning
      const filteredHistory = recentlyPlayed.filter((h) => h.cantiqueId !== cantiqueId);
      const newRecentlyPlayed = [newHistory, ...filteredHistory].slice(0, 50); // Keep last 50

      setRecentlyPlayed(newRecentlyPlayed);
      await AsyncStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(newRecentlyPlayed));
    } catch (error) {
      console.error('Error adding to recently played:', error);
    }
  };

  const getRecentlyPlayedCantiques = (limit: number = 10): string[] => {
    return recentlyPlayed.slice(0, limit).map((h) => h.cantiqueId);
  };

  const value: MusicContextType = {
    favorites,
    playlists,
    recentlyPlayed,
    toggleFavorite,
    isFavorite,
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    addToRecentlyPlayed,
    getRecentlyPlayedCantiques,
    isLoading,
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
