import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import type { AppTheme } from '@/core/theme';

export function toNavigationTheme(theme: AppTheme): Theme {
  const base = theme.mode === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark: theme.mode === 'dark',
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
  };
}
