import React, { createContext, useContext, ReactNode } from 'react';
import { useResponsiveDesign, ResponsiveConfig, ResponsiveSizes } from '@/hooks/useResponsiveDesign';

type ResponsiveContextType = ResponsiveConfig & ResponsiveSizes;

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined);

interface ResponsiveProviderProps {
  children: ReactNode;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  const responsiveValues = useResponsiveDesign();

  return (
    <ResponsiveContext.Provider value={responsiveValues}>
      {children}
    </ResponsiveContext.Provider>
  );
};

// Hook global pour accéder au contexte responsif
export const useResponsive = (): ResponsiveContextType => {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  return context;
};

// Hook avec fallback pour compatibilité
export const useResponsiveSafe = (): ResponsiveContextType => {
  const context = useContext(ResponsiveContext);
  // Appel non conditionnel du hook pour respecter les règles des Hooks
  const fallback = useResponsiveDesign();
  if (!context) {
    // Fallback vers le hook direct si pas de provider
    return fallback;
  }
  return context;
};