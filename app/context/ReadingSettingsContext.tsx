// app/context/ReadingSettingsContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@/utils/storage';
import { Dimensions } from 'react-native';

export interface ReadingSettings {
  fontSize: number;
  fontFamily: 'default' | 'serif' | 'mono';
  lineHeight: number;
  brightness: number;
  immersiveMode: boolean;
  nightMode: boolean;
  verseNumbers: boolean;
  autoScroll: boolean;
  scrollSpeed: number;
  backgroundColor: string;
  textColor: string;
}

interface ReadingSettingsContextType {
  settings: ReadingSettings;
  updateSetting: <K extends keyof ReadingSettings>(key: K, value: ReadingSettings[K]) => Promise<void>;
  resetSettings: () => Promise<void>;
  toggleImmersiveMode: () => Promise<void>;
}

const DEFAULT_SETTINGS: ReadingSettings = {
  fontSize: 16,
  fontFamily: 'default',
  lineHeight: 1.6,
  brightness: 1.0,
  immersiveMode: false,
  nightMode: false,
  verseNumbers: true,
  autoScroll: false,
  scrollSpeed: 1.0,
  backgroundColor: '#FFFFFF',
  textColor: '#000000',
};

const SETTINGS_KEY = '@bible_reading_settings';

const ReadingSettingsContext = createContext<ReadingSettingsContextType | null>(null);

export const useReadingSettings = (): ReadingSettingsContextType => {
  const context = useContext(ReadingSettingsContext);
  if (!context) {
    throw new Error('useReadingSettings must be used within ReadingSettingsProvider');
  }
  return context;
};

interface ReadingSettingsProviderProps {
  children: ReactNode;
}

export const ReadingSettingsProvider: React.FC<ReadingSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<ReadingSettings>(DEFAULT_SETTINGS);

  // Charger les paramètres au démarrage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsStr = await AsyncStorage.getItem(SETTINGS_KEY);
      if (settingsStr) {
        const savedSettings = JSON.parse(settingsStr);
        setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres de lecture:', error);
    }
  };

  const saveSettings = async (newSettings: ReadingSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres de lecture:', error);
    }
  };

  const updateSetting = async <K extends keyof ReadingSettings>(
    key: K, 
    value: ReadingSettings[K]
  ): Promise<void> => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
    
    console.log(`Paramètre ${key} mis à jour:`, value);
  };

  const resetSettings = async (): Promise<void> => {
    setSettings(DEFAULT_SETTINGS);
    await saveSettings(DEFAULT_SETTINGS);
    console.log('Paramètres de lecture réinitialisés');
  };

  const toggleImmersiveMode = async (): Promise<void> => {
    const newImmersiveMode = !settings.immersiveMode;
    await updateSetting('immersiveMode', newImmersiveMode);
    
    if (newImmersiveMode) {
      // Réduire la luminosité de 30% quand le mode immersif est activé
      await updateSetting('brightness', 0.7);
    } else {
      // Remettre la luminosité normale
      await updateSetting('brightness', 1.0);
    }
  };

  const contextValue: ReadingSettingsContextType = {
    settings,
    updateSetting,
    resetSettings,
    toggleImmersiveMode,
  };

  return (
    <ReadingSettingsContext.Provider value={contextValue}>
      {children}
    </ReadingSettingsContext.Provider>
  );
};