// app/services/meditation/audioService.ts
// Service de gestion audio pour la méditation

import { Audio, AVPlaybackStatus } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';

class MeditationAudioService {
  private sound: Sound | null = null;
  private isLoaded: boolean = false;

  /**
   * Charger et jouer une musique
   */
  async loadAndPlay(musicId: string): Promise<void> {
    try {
      // Arrêter et décharger l'audio précédent
      await this.stop();

      if (musicId === 'silence') {
        console.log('🔇 Mode silence activé');
        return;
      }

      // Configurer le mode audio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Charger le fichier audio
      const audioFile = this.getMusicFile(musicId);
      if (!audioFile) {
        console.warn(`⚠️ Fichier audio non trouvé pour: ${musicId}`);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        audioFile,
        { shouldPlay: true, isLooping: true, volume: 0.5 },
        this.onPlaybackStatusUpdate
      );

      this.sound = sound;
      this.isLoaded = true;

      console.log('🎵 Audio démarré:', musicId);
    } catch (error) {
      console.error('Failed to load audio:', error);
    }
  }

  /**
   * Pause
   */
  async pause(): Promise<void> {
    if (this.sound && this.isLoaded) {
      try {
        await this.sound.pauseAsync();
        console.log('⏸️ Audio en pause');
      } catch (error) {
        console.error('Failed to pause audio:', error);
      }
    }
  }

  /**
   * Reprendre
   */
  async resume(): Promise<void> {
    if (this.sound && this.isLoaded) {
      try {
        await this.sound.playAsync();
        console.log('▶️ Audio repris');
      } catch (error) {
        console.error('Failed to resume audio:', error);
      }
    }
  }

  /**
   * Arrêter et décharger
   */
  async stop(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        this.isLoaded = false;
        console.log('🛑 Audio arrêté');
      } catch (error) {
        console.error('Failed to stop audio:', error);
      }
    }
  }

  /**
   * Ajuster le volume
   */
  async setVolume(volume: number): Promise<void> {
    if (this.sound && this.isLoaded) {
      try {
        await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      } catch (error) {
        console.error('Failed to set volume:', error);
      }
    }
  }

  /**
   * Callback de mise à jour du statut de lecture
   */
  private onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      if (status.didJustFinish && !status.isLooping) {
        console.log('🎵 Audio terminé');
      }
    } else if (status.error) {
      console.error(`Audio error: ${status.error}`);
    }
  };

  /**
   * Obtenir le fichier audio selon l'ID
   */
  private getMusicFile(musicId: string): any {
    const musicFiles: Record<string, any> = {
      'all-honor': require('../../../assets/music/all-honor.m4a'),
      // Ajouter d'autres fichiers ici
    };

    return musicFiles[musicId] || null;
  }

  /**
   * Vérifier si l'audio est en cours de lecture
   */
  async isPlaying(): Promise<boolean> {
    if (this.sound && this.isLoaded) {
      try {
        const status = await this.sound.getStatusAsync();
        return status.isLoaded && status.isPlaying;
      } catch (error) {
        return false;
      }
    }
    return false;
  }
}

export const meditationAudioService = new MeditationAudioService();
