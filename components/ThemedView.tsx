import * as React from 'react';
import { View, ViewProps } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...rest
}: ThemedViewProps) {
  const theme = useColorScheme();
  const backgroundColor =
    theme === 'light'
      ? lightColor ?? Colors.light.background
      : darkColor ?? Colors.dark.background;

  return <View style={[{ backgroundColor }, style]} {...rest} />;
}
