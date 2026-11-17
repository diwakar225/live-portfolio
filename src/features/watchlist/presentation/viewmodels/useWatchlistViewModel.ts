import { useCallback, useMemo, useState } from 'react';
import {
  useIsRefreshing,
  useMarketMessage,
  useMarketPhase,
  type MarketDataController,
  type MarketDataPhase,
  type MarketStatusStore,
} from '@/features/market';
import { availableToAdd } from '../../domain/usecases/watchlistRules';
import { useWatchlistModule } from '../WatchlistModuleContext';
import { useWatchlistSymbols } from '../store/watchlistStore';

export interface WatchlistViewModel {
  readonly phase: MarketDataPhase;
  readonly message: string | null;
  readonly isRefreshing: boolean;
  readonly symbols: readonly string[];
  readonly available: readonly string[];
  readonly isPickerOpen: boolean;
  readonly error: string | null;
  readonly openPicker: () => void;
  readonly closePicker: () => void;
  readonly add: (symbol: string) => void;
  readonly remove: (symbol: string) => void;
  readonly refresh: () => void;
  readonly retry: () => void;
}

export interface WatchlistDependencies {
  readonly marketStatusStore: MarketStatusStore;
  readonly marketData: MarketDataController;
}

export function useWatchlistViewModel({
  marketStatusStore,
  marketData,
}: WatchlistDependencies): WatchlistViewModel {
  const watchlist = useWatchlistModule();
  const symbols = useWatchlistSymbols(watchlist.watchlistStore);
  const phase = useMarketPhase(marketStatusStore);
  const message = useMarketMessage(marketStatusStore);
  const isRefreshing = useIsRefreshing(marketStatusStore);

  const [isPickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = useMemo(
    () => availableToAdd(watchlist.universe, symbols),
    [watchlist.universe, symbols],
  );

  const openPicker = useCallback(() => {
    setError(null);
    setPickerOpen(true);
  }, []);

  const closePicker = useCallback(() => setPickerOpen(false), []);

  const add = useCallback(
    (symbol: string) => {
      const result = watchlist.add(symbol);
      if (result.ok) {
        setPickerOpen(false);
        setError(null);
        return;
      }
      setError(result.error.message);
    },
    [watchlist],
  );

  const remove = useCallback(
    (symbol: string) => {
      setError(null);
      watchlist.remove(symbol);
    },
    [watchlist],
  );

  const refresh = useCallback(() => {
    marketData.refresh().catch(() => undefined);
  }, [marketData]);

  const retry = useCallback(() => {
    marketData.load().catch(() => undefined);
  }, [marketData]);

  return useMemo(
    () => ({
      phase,
      message,
      isRefreshing,
      symbols,
      available,
      isPickerOpen,
      error,
      openPicker,
      closePicker,
      add,
      remove,
      refresh,
      retry,
    }),
    [
      phase,
      message,
      isRefreshing,
      symbols,
      available,
      isPickerOpen,
      error,
      openPicker,
      closePicker,
      add,
      remove,
      refresh,
      retry,
    ],
  );
}
