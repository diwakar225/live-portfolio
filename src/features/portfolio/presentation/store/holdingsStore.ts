import { useStore } from 'zustand';
import { createStore, type StoreApi } from 'zustand/vanilla';
import type { Holding } from '../../domain/entities/Holding';

export interface HoldingsStoreState {
  readonly list: readonly Holding[];
  readonly bySymbol: Readonly<Record<string, Holding>>;
  readonly setHoldings: (holdings: readonly Holding[]) => void;
}

export type HoldingsStore = StoreApi<HoldingsStoreState>;

function index(holdings: readonly Holding[]): Readonly<Record<string, Holding>> {
  const bySymbol: Record<string, Holding> = {};
  for (const holding of holdings) {
    bySymbol[holding.symbol] = holding;
  }
  return bySymbol;
}

export function createHoldingsStore(initial: readonly Holding[] = []): HoldingsStore {
  return createStore<HoldingsStoreState>()(set => ({
    list: initial,
    bySymbol: index(initial),
    setHoldings: holdings => set({ list: holdings, bySymbol: index(holdings) }),
  }));
}

export function useHolding(store: HoldingsStore, symbol: string): Holding | undefined {
  return useStore(store, state => state.bySymbol[symbol]);
}

export function useHoldings(store: HoldingsStore): readonly Holding[] {
  return useStore(store, state => state.list);
}
