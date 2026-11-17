import { useCallback, useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { appConfig } from '@/core/config';
import { ThemeProvider } from '@/core/theme';
import { AppErrorBoundary } from '@/shared/components';
import { AppProviders } from './AppProviders';
import { createAppContainer } from './di/createAppContainer';
import { AppNavigation } from './navigation/AppNavigation';

export default function App() {
  const [container] = useState(() => createAppContainer(appConfig));

  useEffect(() => {
    let cancelled = false;
    const startFeed = (): void => {
      if (!cancelled) {
        container.market.feed.start();
      }
    };
    container.market.data.load().then(startFeed, startFeed);
    return () => {
      cancelled = true;
      container.market.feed.stop();
    };
  }, [container]);

  const handleRenderError = useCallback(
    (error: unknown, componentStack: string | null | undefined) => {
      container.logger.error('Unhandled render error', { error, componentStack });
    },
    [container],
  );

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppErrorBoundary onError={handleRenderError}>
          <AppProviders container={container}>
            <AppNavigation />
          </AppProviders>
        </AppErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
