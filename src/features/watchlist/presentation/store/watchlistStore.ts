import { useStore } from 'zustand';
import { createStore, type StoreApi } from 'zustand/vanilla';

export interface WatchlistStoreState {
  readonly symbols: readonly string[];
  readonly setSymbols: (symbols: readonly string[]) => void;
}

export type WatchlistStore = StoreApi<WatchlistStoreState>;

export function createWatchlistStore(initial: readonly string[] = []): WatchlistStore {
  return createStore<WatchlistStoreState>()(set => ({
    symbols: initial,
    setSymbols: symbols => set({ symbols }),
  }));
}

export function useWatchlistSymbols(store: WatchlistStore): readonly string[] {
  return useStore(store, state => state.symbols);
}
