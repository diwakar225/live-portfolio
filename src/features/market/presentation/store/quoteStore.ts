import { createStore, type StoreApi } from 'zustand/vanilla';
import { isSameQuote, type Quote } from '../../domain/entities/Quote';
import type { PriceTick } from '../../domain/entities/Tick';
import { applyTick, isStaleTick } from '../../domain/usecases/applyTick';

export interface QuoteStoreState {
  readonly bySymbol: Readonly<Record<string, Quote>>;
  readonly upsertQuotes: (quotes: readonly Quote[]) => void;
  readonly applyTick: (tick: PriceTick) => void;
}

export type QuoteStore = StoreApi<QuoteStoreState>;

export function createQuoteStore(): QuoteStore {
  const lastAppliedSeq = new Map<string, number>();

  return createStore<QuoteStoreState>()(set => ({
    bySymbol: {},

    upsertQuotes: quotes =>
      set(state => {
        let next: Record<string, Quote> | undefined;
        for (const quote of quotes) {
          const current = state.bySymbol[quote.symbol];
          if (current !== undefined && isSameQuote(current, quote)) {
            continue;
          }
          next ??= { ...state.bySymbol };
          next[quote.symbol] = quote;
        }
        return next === undefined ? state : { bySymbol: next };
      }),

    applyTick: tick =>
      set(state => {
        if (isStaleTick(lastAppliedSeq.get(tick.symbol), tick)) {
          return state;
        }
        const current = state.bySymbol[tick.symbol];
        if (current === undefined) {
          return state;
        }
        lastAppliedSeq.set(tick.symbol, tick.seq);
        const updated = applyTick(current, tick);
        if (updated === current) {
          return state;
        }
        return { bySymbol: { ...state.bySymbol, [tick.symbol]: updated } };
      }),
  }));
}
