import type { Result } from '@/core/kernel';
import type { WatchlistStore } from './presentation/store/watchlistStore';

export interface WatchlistModule {
  readonly watchlistStore: WatchlistStore;
  readonly universe: readonly string[];
  readonly add: (symbol: string) => Result<readonly string[]>;
  readonly remove: (symbol: string) => void;
}
