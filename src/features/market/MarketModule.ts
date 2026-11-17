import type { Paise } from '@/core/kernel';
import type { MarketDataController } from './presentation/MarketDataController';
import type { FeedStatusStore } from './presentation/store/feedStatusStore';
import type { MarketStatusStore } from './presentation/store/marketStatusStore';
import type { PriceFeedController } from './presentation/store/priceFeedController';
import type { QuoteStore } from './presentation/store/quoteStore';

export interface MarketModule {
  readonly symbols: readonly string[];
  readonly quoteStore: QuoteStore;
  readonly feedStatusStore: FeedStatusStore;
  readonly marketStatusStore: MarketStatusStore;
  readonly data: MarketDataController;
  readonly feed: PriceFeedController;
  readonly readLastPrice: (symbol: string) => Paise | null;
}
