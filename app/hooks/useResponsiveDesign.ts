import { useState, useEffect } from 'react';
import { Dimensions, PixelRatio } from 'react-native';

export interface ResponsiveConfig {
  isPhone: boolean;
  isTablet: boolean;
  isLargeTablet: boolean;
  isLandscape: boolean;
  screenWidth: number;
  screenHeight: number;
  fontScale: number;
  pixelDensity: number;
}

export interface ResponsiveSizes {
  // Tailles de police adaptatives
  fontSize: {
    md: number | undefined;
    xs: number;      // 10-12px
    sm: number;      // 12-14px  
    base: number;    // 14-16px
    lg: number;      // 16-18px
    xl: number;      // 18-20px
    xl2: number;     // 20-24px
    xl3: number;     // 24-28px
    xl4: number;     // 28-32px
    xl5: number;     // 32-36px
  };
  
  // Espacements adaptatifs
  spacing: {
    xs: number;      // 4-6px
    sm: number;      // 8-12px
    md: number;      // 16-20px
    lg: number;      // 24-32px
    xl: number;      // 32-40px
    xl2: number;     // 40-48px
  };
  
  // Dimensions des éléments
  components: {
    iconSize: {
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    borderRadius: {
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    cardPadding: number;
    headerHeight: number;
    buttonHeight: number;
  };
  
  // Layout
  layout: {
    maxContentWidth: number;
    sideMargins: number;
    columnGap: number;
    gridColumns: number;
  };
}

const BREAKPOINTS = {
  PHONE_MAX: 600,
  TABLET_MAX: 900,
  LARGE_TABLET_MIN: 900,
} as const;

export const useResponsiveDesign = (): ResponsiveConfig & ResponsiveSizes => {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const screenWidth = dimensions.width;
  const screenHeight = dimensions.height;
  const isLandscape = screenWidth > screenHeight;
  
  // Détection du type d'appareil basée sur la largeur effective
  const effectiveWidth = Math.min(screenWidth, screenHeight); // Utilise la plus petite dimension pour classification
  const isPhone = effectiveWidth < BREAKPOINTS.PHONE_MAX;
  const isTablet = effectiveWidth >= BREAKPOINTS.PHONE_MAX && effectiveWidth < BREAKPOINTS.TABLET_MAX;
  const isLargeTablet = effectiveWidth >= BREAKPOINTS.LARGE_TABLET_MIN;

  // Facteurs de scaling
  const fontScale = PixelRatio.getFontScale();
  const pixelDensity = PixelRatio.get();
  
  // Scaling basé sur la taille d'écran
  const scalePhone = 1;
  const scaleTablet = 1.15;
  const scaleLargeTablet = 1.3;
  
  const currentScale = isPhone ? scalePhone : isTablet ? scaleTablet : scaleLargeTablet;

  // Tailles de police responsives
  const fontSize = {
    xs: Math.round((isPhone ? 10 : isTablet ? 11 : 12) * currentScale),
    sm: Math.round((isPhone ? 12 : isTablet ? 13 : 14) * currentScale),
    base: Math.round((isPhone ? 14 : isTablet ? 15 : 16) * currentScale),
    lg: Math.round((isPhone ? 16 : isTablet ? 17 : 18) * currentScale),
    xl: Math.round((isPhone ? 18 : isTablet ? 19 : 20) * currentScale),
    xl2: Math.round((isPhone ? 20 : isTablet ? 22 : 24) * currentScale),
    xl3: Math.round((isPhone ? 24 : isTablet ? 26 : 28) * currentScale),
    xl4: Math.round((isPhone ? 28 : isTablet ? 30 : 32) * currentScale),
    xl5: Math.round((isPhone ? 32 : isTablet ? 34 : 36) * currentScale),
  };

  // Espacements responssifs  
  const spacing = {
    xs: Math.round((isPhone ? 4 : isTablet ? 5 : 6) * currentScale),
    sm: Math.round((isPhone ? 8 : isTablet ? 10 : 12) * currentScale),
    md: Math.round((isPhone ? 16 : isTablet ? 18 : 20) * currentScale),
    lg: Math.round((isPhone ? 24 : isTablet ? 28 : 32) * currentScale),
    xl: Math.round((isPhone ? 32 : isTablet ? 36 : 40) * currentScale),
    xl2: Math.round((isPhone ? 40 : isTablet ? 44 : 48) * currentScale),
  };

  // Composants responsifs
  const components = {
    iconSize: {
      sm: Math.round((isPhone ? 16 : isTablet ? 18 : 20) * currentScale),
      md: Math.round((isPhone ? 20 : isTablet ? 22 : 24) * currentScale),
      lg: Math.round((isPhone ? 24 : isTablet ? 26 : 28) * currentScale),
      xl: Math.round((isPhone ? 28 : isTablet ? 30 : 32) * currentScale),
    },
    borderRadius: {
      sm: Math.round((isPhone ? 8 : isTablet ? 10 : 12) * currentScale),
      md: Math.round((isPhone ? 12 : isTablet ? 14 : 16) * currentScale),
      lg: Math.round((isPhone ? 16 : isTablet ? 18 : 20) * currentScale),
      xl: Math.round((isPhone ? 20 : isTablet ? 22 : 24) * currentScale),
    },
    cardPadding: Math.round((isPhone ? 16 : isTablet ? 20 : 24) * currentScale),
    headerHeight: Math.round((isPhone ? 200 : isTablet ? 220 : 240) * currentScale),
    buttonHeight: Math.round((isPhone ? 48 : isTablet ? 52 : 56) * currentScale),
  };

  // Layout responsif
  const layout = {
    maxContentWidth: isPhone ? screenWidth - 20 : isTablet ? Math.min(screenWidth - 40, 800) : Math.min(screenWidth - 60, 1200),
    sideMargins: isPhone ? 10 : isTablet ? 20 : 30,
    columnGap: isPhone ? 12 : isTablet ? 16 : 20,
    gridColumns: isPhone ? 1 : isTablet ? (isLandscape ? 2 : 1) : (isLandscape ? 3 : 2),
  };

  return {
    // Config
    isPhone,
    isTablet,
    isLargeTablet,
    isLandscape,
    screenWidth,
    screenHeight,
    fontScale,
    pixelDensity,
    
    // Sizes
    fontSize,
    spacing,
    components,
    layout,
  };
};

// Helper pour créer des styles responsifs facilement
export const createResponsiveStyle = (phoneStyle: any, tabletStyle: any, largeTabletStyle?: any) => {
  const { isPhone, isTablet } = useResponsiveDesign();
  
  if (isPhone) return phoneStyle;
  if (isTablet) return tabletStyle;
  return largeTabletStyle || tabletStyle;
};