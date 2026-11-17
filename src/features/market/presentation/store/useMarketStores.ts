import { useStore } from 'zustand';
import type { Quote } from '../../domain/entities/Quote';
import type { FeedStatus, FeedStatusStore } from './feedStatusStore';
import type { MarketDataPhase, MarketStatusStore } from './marketStatusStore';
import type { QuoteStore } from './quoteStore';

export function useQuote(store: QuoteStore, symbol: string): Quote | undefined {
  return useStore(store, state => state.bySymbol[symbol]);
}

export function useFeedStatus(store: FeedStatusStore): FeedStatus {
  return useStore(store, state => state.status);
}

export function useMarketPhase(store: MarketStatusStore): MarketDataPhase {
  return useStore(store, state => state.phase);
}

export function useMarketMessage(store: MarketStatusStore): string | null {
  return useStore(store, state => state.message);
}

export function useIsRefreshing(store: MarketStatusStore): boolean {
  return useStore(store, state => state.isRefreshing);
}
