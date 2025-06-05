import * as React from 'react';
import { Text, TextProps } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'defaultSemiBold' | 'title';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const theme = useColorScheme();
  const color = theme === 'light' ? lightColor ?? Colors.light.text : darkColor ?? Colors.dark.text;

  const fontWeight =
    type === 'defaultSemiBold' ? '600' : type === 'title' ? '700' : undefined;
  const fontSize = type === 'title' ? 20 : undefined;

  return <Text style={[{ color, fontWeight, fontSize }, style]} {...rest} />;
}
