import { createStore, type StoreApi } from 'zustand/vanilla';

export type MarketDataPhase = 'loading' | 'ready' | 'error';

export interface MarketStatusState {
  readonly phase: MarketDataPhase;
  readonly message: string | null;
  readonly isRefreshing: boolean;
  readonly lastUpdatedAt: number | null;
  readonly unpricedSymbols: readonly string[];

  readonly setLoading: () => void;
  readonly setRefreshing: (isRefreshing: boolean) => void;
  readonly setReady: (payload: {
    readonly lastUpdatedAt: number;
    readonly unpricedSymbols: readonly string[];
  }) => void;
  readonly setError: (message: string) => void;
}

export type MarketStatusStore = StoreApi<MarketStatusState>;

export function createMarketStatusStore(): MarketStatusStore {
  return createStore<MarketStatusState>()(set => ({
    phase: 'loading',
    message: null,
    isRefreshing: false,
    lastUpdatedAt: null,
    unpricedSymbols: [],

    setLoading: () => set({ phase: 'loading', message: null, isRefreshing: false }),
    setRefreshing: isRefreshing =>
      set(state => (state.isRefreshing === isRefreshing ? state : { isRefreshing })),
    setReady: ({ lastUpdatedAt, unpricedSymbols }) =>
      set({ phase: 'ready', message: null, isRefreshing: false, lastUpdatedAt, unpricedSymbols }),
    setError: message =>
      set(state => ({
        phase: state.phase === 'ready' ? 'ready' : 'error',
        message,
        isRefreshing: false,
      })),
  }));
}
