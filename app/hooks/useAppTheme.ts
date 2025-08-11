// app/hooks/useAppTheme.ts
import { useTheme } from 'react-native-paper';
import type { AppThemeType } from '../constants/theme';

export const useAppTheme = () => useTheme<AppThemeType>();