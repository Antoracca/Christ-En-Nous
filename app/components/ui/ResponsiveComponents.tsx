import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ViewStyle, TextStyle, ScrollViewProps, TouchableOpacityProps } from 'react-native';
import { useResponsiveSafe } from '@/context/ResponsiveContext';

// Wrapper pour View avec espacement responsif
interface ResponsiveViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof ReturnType<typeof useResponsiveSafe>['spacing'];
  margin?: keyof ReturnType<typeof useResponsiveSafe>['spacing'];
  borderRadius?: keyof ReturnType<typeof useResponsiveSafe>['components']['borderRadius'];
}

export const ResponsiveView: React.FC<ResponsiveViewProps> = ({ 
  children, 
  style, 
  padding,
  margin,
  borderRadius,
  ...props 
}) => {
  const responsive = useResponsiveSafe();
  
  const responsiveStyle: ViewStyle = {
    ...(padding && { padding: responsive.spacing[padding] }),
    ...(margin && { marginBottom: responsive.spacing[margin] }),
    ...(borderRadius && { borderRadius: responsive.components.borderRadius[borderRadius] }),
    ...style,
  };

  return (
    <View style={responsiveStyle} {...props}>
      {children}
    </View>
  );
};

// Wrapper pour Text avec taille responsif
interface ResponsiveTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  size?: keyof ReturnType<typeof useResponsiveSafe>['fontSize'];
  weight?: 'regular' | 'semibold' | 'bold' | 'extrabold' | 'black';
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({ 
  children, 
  style, 
  size = 'base',
  weight = 'regular',
  ...props 
}) => {
  const responsive = useResponsiveSafe();
  
  const getFontFamily = () => {
    switch (weight) {
      case 'semibold': return 'Nunito_600SemiBold';
      case 'bold': return 'Nunito_700Bold';
      case 'extrabold': return 'Nunito_800ExtraBold';
      case 'black': return 'Nunito_900Black';
      default: return 'Nunito_400Regular';
    }
  };

  const responsiveStyle: TextStyle = {
    fontSize: responsive.fontSize[size],
    fontFamily: getFontFamily(),
    ...style,
  };

  return (
    <Text style={responsiveStyle} {...props}>
      {children}
    </Text>
  );
};

// Wrapper pour TouchableOpacity avec dimensions responsives
interface ResponsiveTouchableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  padding?: keyof ReturnType<typeof useResponsiveSafe>['spacing'];
  borderRadius?: keyof ReturnType<typeof useResponsiveSafe>['components']['borderRadius'];
}

export const ResponsiveTouchable: React.FC<ResponsiveTouchableProps> = ({ 
  children, 
  style, 
  padding = 'md',
  borderRadius = 'md',
  ...props 
}) => {
  const responsive = useResponsiveSafe();

  const responsiveStyle: ViewStyle = {
    padding: responsive.spacing[padding],
    borderRadius: responsive.components.borderRadius[borderRadius],
    ...style,
  };

  return (
    <TouchableOpacity style={responsiveStyle} {...props}>
      {children}
    </TouchableOpacity>
  );
};

// ScrollView responsif avec marges adaptées
interface ResponsiveScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  maxWidth?: boolean;
  sidePadding?: boolean;
}

export const ResponsiveScrollView: React.FC<ResponsiveScrollViewProps> = ({ 
  children, 
  contentContainerStyle,
  maxWidth = true,
  sidePadding = true,
  ...props 
}) => {
  const responsive = useResponsiveSafe();

  const responsiveContentStyle = {
    ...(maxWidth && {
      maxWidth: responsive.layout.maxContentWidth,
      alignSelf: 'center' as const,
      width: '100%' as const,
    }),
    ...(sidePadding && {
      paddingHorizontal: responsive.layout.sideMargins,
    }),
    ...contentContainerStyle,
  };

  return (
    <ScrollView 
      contentContainerStyle={responsiveContentStyle} 
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

// SafeAreaView responsif 
interface ResponsiveSafeAreaProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
}

export const ResponsiveSafeArea: React.FC<ResponsiveSafeAreaProps> = ({ 
  children, 
  style,
  backgroundColor,
  ...props 
}) => {
  return (
    <SafeAreaView 
      style={[
        { flex: 1 },
        backgroundColor && { backgroundColor },
        style
      ]} 
      {...props}
    >
      {children}
    </SafeAreaView>
  );
};

// Section avec titre responsif
interface ResponsiveSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  marginBottom?: keyof ReturnType<typeof useResponsiveSafe>['spacing'];
}

export const ResponsiveSection: React.FC<ResponsiveSectionProps> = ({ 
  title, 
  subtitle, 
  children,
  marginBottom = 'xl'
}) => {
  const responsive = useResponsiveSafe();

  return (
    <ResponsiveView margin={marginBottom}>
      <ResponsiveText size="xl2" weight="bold" style={{ marginBottom: responsive.spacing.xs }}>
        {title}
      </ResponsiveText>
      {subtitle && (
        <ResponsiveText size="base" style={{ 
          opacity: 0.7, 
          marginBottom: responsive.spacing.sm 
        }}>
          {subtitle}
        </ResponsiveText>
      )}
      {children}
    </ResponsiveView>
  );
};