// app/hooks/useAppTheme.ts
import { useThemeContext } from '@/context/ThemeContext';

export const useAppTheme = () => {
  const { theme } = useThemeContext();
  return theme;
};