import { useTheme } from './ThemeProvider';
import type { AppTheme } from './themes';

export function createThemedStyles<T>(factory: (theme: AppTheme) => T): () => T {
  const cache = new WeakMap<AppTheme, T>();
  return function useThemedStyles(): T {
    const theme = useTheme();
    const cached = cache.get(theme);
    if (cached !== undefined) {
      return cached;
    }
    const styles = factory(theme);
    cache.set(theme, styles);
    return styles;
  };
}
