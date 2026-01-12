// app/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@/utils/storage';
import { useColorScheme } from 'react-native';
import { LightAppTheme, DarkAppTheme, type AppThemeType } from '@/constants/theme';

interface ThemeContextType {
  theme: AppThemeType;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  themeMode: 'light' | 'dark' | 'system';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@christennous_theme_mode';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'system'>('system');
  
  // Détermine le thème effectif basé sur le mode sélectionné
  const getEffectiveTheme = (mode: 'light' | 'dark' | 'system') => {
    if (mode === 'system') {
      return systemColorScheme === 'dark';
    }
    return mode === 'dark';
  };
  
  const [isDarkMode, setIsDarkMode] = useState(() => getEffectiveTheme(themeMode));

  // Charge les préférences sauvegardées au démarrage
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Met à jour le thème quand le mode système change
  useEffect(() => {
    if (themeMode === 'system') {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, themeMode]);

  const loadThemePreference = async () => {
    try {
      const savedThemeMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedThemeMode && ['light', 'dark', 'system'].includes(savedThemeMode)) {
        const mode = savedThemeMode as 'light' | 'dark' | 'system';
        setThemeModeState(mode);
        setIsDarkMode(getEffectiveTheme(mode));
      }
    } catch (error) {
      console.log('Erreur lors du chargement des préférences de thème:', error);
    }
  };

  const saveThemePreference = async (mode: 'light' | 'dark' | 'system') => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.log('Erreur lors de la sauvegarde des préférences de thème:', error);
    }
  };

  const setThemeMode = async (mode: 'light' | 'dark' | 'system') => {
    setThemeModeState(mode);
    setIsDarkMode(getEffectiveTheme(mode));
    await saveThemePreference(mode);
  };

  const toggleTheme = async () => {
    // Cycle entre les trois modes: system -> light -> dark -> system
    let nextMode: 'light' | 'dark' | 'system';
    
    if (themeMode === 'system') {
      nextMode = 'light';
    } else if (themeMode === 'light') {
      nextMode = 'dark';
    } else {
      nextMode = 'system';
    }
    
    await setThemeMode(nextMode);
  };

  const theme = isDarkMode ? DarkAppTheme : LightAppTheme;

  const contextValue: ThemeContextType = {
    theme,
    isDarkMode,
    toggleTheme,
    setThemeMode,
    themeMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};