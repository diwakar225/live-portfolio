import { systemClock, type Clock } from '@/core/kernel';
import type { Logger } from '@/core/logging';
import type { HttpClient } from '@/core/network';
import { LiquideMarketDataSource } from './data/datasources/LiquideMarketDataSource';
import { SimulatedPriceFeed } from './data/datasources/SimulatedPriceFeed';
import { MarketDataRepositoryImpl } from './data/repositories/MarketDataRepositoryImpl';
import { MARKET_SYMBOLS } from './domain/symbols';
import { GetQuotesUseCase } from './domain/usecases/GetQuotesUseCase';
import type { MarketModule } from './MarketModule';
import { createMarketDataController } from './presentation/MarketDataController';
import { createFeedStatusStore } from './presentation/store/feedStatusStore';
import { createMarketStatusStore } from './presentation/store/marketStatusStore';
import { createPriceFeedController } from './presentation/store/priceFeedController';
import { createQuoteStore } from './presentation/store/quoteStore';

export interface MarketModuleDependencies {
  readonly http: HttpClient;
  readonly logger: Logger;
  readonly clock?: Clock;
  readonly symbols?: readonly string[];
}

export function createMarketModule({
  http,
  logger,
  clock = systemClock,
  symbols = MARKET_SYMBOLS,
}: MarketModuleDependencies): MarketModule {
  const scoped = logger.child('market');
  const dataSource = new LiquideMarketDataSource(http, scoped);
  const repository = new MarketDataRepositoryImpl(dataSource);
  const getQuotes = new GetQuotesUseCase(repository, clock);

  const quoteStore = createQuoteStore();
  const feedStatusStore = createFeedStatusStore();
  const marketStatusStore = createMarketStatusStore();

  const feed = new SimulatedPriceFeed({
    symbols,
    readQuote: symbol => quoteStore.getState().bySymbol[symbol],
    clock,
  });

  return {
    symbols,
    quoteStore,
    feedStatusStore,
    marketStatusStore,
    data: createMarketDataController({
      getQuotes,
      quoteStore,
      marketStatusStore,
      symbols,
      logger: scoped,
    }),
    feed: createPriceFeedController({
      feed,
      quoteStore,
      feedStatusStore,
      logger: scoped,
      clock,
    }),
    readLastPrice: symbol => quoteStore.getState().bySymbol[symbol]?.ltp ?? null,
  };
}
