import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type AppTheme, type ColorMode } from './themes';

const ThemeContext = createContext<AppTheme>(lightTheme);
ThemeContext.displayName = 'ThemeContext';

export interface ThemeProviderProps {
  readonly children: ReactNode;
  readonly forcedMode?: ColorMode;
}

export function ThemeProvider({ children, forcedMode }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const mode: ColorMode = forcedMode ?? (systemScheme === 'dark' ? 'dark' : 'light');
  const theme = mode === 'dark' ? darkTheme : lightTheme;
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}
