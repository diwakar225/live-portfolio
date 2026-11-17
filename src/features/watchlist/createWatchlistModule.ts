import { mapResult } from '@/core/kernel';
import type { Logger } from '@/core/logging';
import type { KeyValueStorage } from '@/core/storage';
import { WatchlistRepositoryImpl } from './data/repositories/WatchlistRepositoryImpl';
import { addToWatchlist, removeFromWatchlist } from './domain/usecases/watchlistRules';
import type { WatchlistModule } from './WatchlistModule';
import { createWatchlistStore } from './presentation/store/watchlistStore';

export interface WatchlistModuleDependencies {
  readonly storage: KeyValueStorage;
  readonly universe: readonly string[];
  readonly logger: Logger;
}

export function createWatchlistModule({
  storage,
  universe,
  logger,
}: WatchlistModuleDependencies): WatchlistModule {
  const scoped = logger.child('watchlist');
  const repository = new WatchlistRepositoryImpl(storage);
  const watchlistStore = createWatchlistStore(repository.load());
  const known = new Set(universe);

  const commit = (symbols: readonly string[]): void => {
    repository.save(symbols);
    watchlistStore.getState().setSymbols(symbols);
  };

  return {
    watchlistStore,
    universe,
    add: symbol => {
      const result = addToWatchlist(watchlistStore.getState().symbols, symbol, {
        isKnown: candidate => known.has(candidate),
      });
      if (result.ok) {
        commit(result.value);
        scoped.info('Added to watchlist', { symbol });
      }
      return mapResult(result, symbols => symbols);
    },
    remove: symbol => {
      commit(removeFromWatchlist(watchlistStore.getState().symbols, symbol));
      scoped.info('Removed from watchlist', { symbol });
    },
  };
}
