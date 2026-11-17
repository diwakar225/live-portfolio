import type { ReactNode } from 'react';
import { MarketModuleProvider } from '@/features/market';
import { PortfolioModuleProvider } from '@/features/portfolio';
import { WatchlistModuleProvider } from '@/features/watchlist';
import type { AppContainer } from './di/createAppContainer';

export interface AppProvidersProps {
  readonly container: AppContainer;
  readonly children: ReactNode;
}

export function AppProviders({ container, children }: AppProvidersProps) {
  return (
    <MarketModuleProvider value={container.market}>
      <PortfolioModuleProvider value={container.portfolio}>
        <WatchlistModuleProvider value={container.watchlist}>{children}</WatchlistModuleProvider>
      </PortfolioModuleProvider>
    </MarketModuleProvider>
  );
}
