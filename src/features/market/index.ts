export { createMarketModule } from './createMarketModule';
export type { MarketModuleDependencies } from './createMarketModule';
export type { Quote } from './domain/entities/Quote';
export type { PriceTick } from './domain/entities/Tick';
export type { PriceFeed, TickHandler, Unsubscribe } from './domain/ports/PriceFeed';
export { MARKET_SYMBOLS } from './domain/symbols';
export { calculateDayChange } from './domain/usecases/calculateDayChange';
export type { DayChange } from './domain/usecases/calculateDayChange';
export type { MarketModule } from './MarketModule';
export { PausedBanner } from './presentation/components/PausedBanner';
export { TickChart } from './presentation/components/TickChart';
export type { TickChartProps } from './presentation/components/TickChart';
export { MarketModuleProvider, useMarketModule } from './presentation/MarketModuleContext';
export type { MarketDataController } from './presentation/MarketDataController';
export type { FeedStatus, FeedStatusStore } from './presentation/store/feedStatusStore';
export type { MarketDataPhase, MarketStatusStore } from './presentation/store/marketStatusStore';
export type { QuoteStore } from './presentation/store/quoteStore';
export {
  useFeedStatus,
  useIsRefreshing,
  useMarketMessage,
  useMarketPhase,
  useQuote,
} from './presentation/store/useMarketStores';
export { useTickHistory } from './presentation/viewmodels/useTickHistory';
