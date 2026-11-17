import { createInMemoryTokenStore, type TokenStore } from '@/core/auth';
import type { AppConfig } from '@/core/config';
import { createLogger, type Logger } from '@/core/logging';
import { createAxiosHttpClient, type HttpClient } from '@/core/network';
import { createMmkvStorage, type KeyValueStorage } from '@/core/storage';
import { createMarketModule, type MarketModule } from '@/features/market';
import { createPortfolioModule, type PortfolioModule } from '@/features/portfolio';
import { createWatchlistModule, type WatchlistModule } from '@/features/watchlist';

export interface AppContainer {
  readonly config: AppConfig;
  readonly logger: Logger;
  readonly tokenStore: TokenStore;
  readonly http: HttpClient;
  readonly storage: KeyValueStorage;
  readonly market: MarketModule;
  readonly portfolio: PortfolioModule;
  readonly watchlist: WatchlistModule;
}

export function createAppContainer(config: AppConfig): AppContainer {
  const logger = createLogger({ enabled: __DEV__, scope: 'app' });
  const tokenStore = createInMemoryTokenStore();
  const http = createAxiosHttpClient({
    baseUrl: config.api.baseUrl,
    timeoutMs: config.api.timeoutMs,
    tokenStore,
    logger: logger.child('http'),
  });
  const storage = createMmkvStorage('live-portfolio');

  const market = createMarketModule({ http, logger });
  const portfolio = createPortfolioModule({
    storage,
    readLastPrice: market.readLastPrice,
    logger,
  });
  const watchlist = createWatchlistModule({
    storage,
    universe: market.symbols,
    logger,
  });

  logger.info('Container ready', {
    env: config.env,
    apiBaseUrl: config.api.baseUrl,
    symbols: market.symbols.length,
  });
  return { config, logger, tokenStore, http, storage, market, portfolio, watchlist };
}
