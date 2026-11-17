import { useCallback, useMemo, useState } from 'react';
import type { Quote } from '@/features/market';
import {
  useIsRefreshing,
  useMarketMessage,
  useMarketPhase,
  type MarketDataController,
  type MarketDataPhase,
  type QuoteStore,
} from '@/features/market';
import { useThrottledStore } from '@/shared/hooks';
import type { PortfolioSummary, Position } from '../../domain/entities/Position';
import { calculatePosition } from '../../domain/usecases/calculatePosition';
import { calculateSummary } from '../../domain/usecases/calculateSummary';
import { useHoldings, type HoldingsStore } from '../store/holdingsStore';
import type { MarketStatusStore } from '@/features/market';

export type SortKey = 'name' | 'value' | 'pnl';

export const SORT_OPTIONS: readonly { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'value', label: 'Value' },
  { value: 'pnl', label: 'P&L' },
];

const SUMMARY_INTERVAL_MS = 300;

export interface PortfolioViewModel {
  readonly phase: MarketDataPhase;
  readonly message: string | null;
  readonly isRefreshing: boolean;
  readonly summary: PortfolioSummary;
  readonly visibleSymbols: readonly string[];
  readonly totalCount: number;
  readonly sortKey: SortKey;
  readonly query: string;
  readonly setSortKey: (key: SortKey) => void;
  readonly setQuery: (query: string) => void;
  readonly refresh: () => void;
  readonly retry: () => void;
}

export interface PortfolioDependencies {
  readonly holdingsStore: HoldingsStore;
  readonly quoteStore: QuoteStore;
  readonly marketStatusStore: MarketStatusStore;
  readonly marketData: MarketDataController;
}

function byNumberDescending(a: number | null, b: number | null): number {
  if (a === b) {
    return 0;
  }
  if (a === null) {
    return 1;
  }
  if (b === null) {
    return -1;
  }
  return b - a;
}

export function comparePositions(sortKey: SortKey, a: Position, b: Position): number {
  switch (sortKey) {
    case 'name':
      return a.symbol.localeCompare(b.symbol);
    case 'value':
      return byNumberDescending(a.marketValue, b.marketValue);
    case 'pnl':
      return byNumberDescending(a.totalPnl, b.totalPnl);
  }
}

export function usePortfolioViewModel({
  holdingsStore,
  quoteStore,
  marketStatusStore,
  marketData,
}: PortfolioDependencies): PortfolioViewModel {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [query, setQuery] = useState('');
  const [orderSnapshot, setOrderSnapshot] = useState<Readonly<Record<string, Quote>>>(
    () => quoteStore.getState().bySymbol,
  );

  const holdings = useHoldings(holdingsStore);
  const phase = useMarketPhase(marketStatusStore);
  const message = useMarketMessage(marketStatusStore);
  const isRefreshing = useIsRefreshing(marketStatusStore);

  const quotesSnapshot = useThrottledStore(
    quoteStore,
    state => state.bySymbol,
    SUMMARY_INTERVAL_MS,
  );

  const summary = useMemo(() => {
    const positions = holdings.map(holding =>
      calculatePosition(holding, quotesSnapshot[holding.symbol]),
    );
    return calculateSummary(positions);
  }, [holdings, quotesSnapshot]);

  const visibleSymbols = useMemo(() => {
    const needle = query.trim().toUpperCase();
    return holdings
      .filter(holding => needle === '' || holding.symbol.includes(needle))
      .map(holding => calculatePosition(holding, orderSnapshot[holding.symbol]))
      .sort((a, b) => comparePositions(sortKey, a, b))
      .map(position => position.symbol);
  }, [holdings, query, sortKey, orderSnapshot]);

  const resnapshot = useCallback(() => {
    setOrderSnapshot(quoteStore.getState().bySymbol);
  }, [quoteStore]);

  const refresh = useCallback(() => {
    marketData.refresh().then(resnapshot, resnapshot);
  }, [marketData, resnapshot]);

  const retry = useCallback(() => {
    marketData.load().then(resnapshot, resnapshot);
  }, [marketData, resnapshot]);

  const handleSortKey = useCallback(
    (key: SortKey) => {
      resnapshot();
      setSortKey(key);
    },
    [resnapshot],
  );

  return useMemo(
    () => ({
      phase,
      message,
      isRefreshing,
      summary,
      visibleSymbols,
      totalCount: holdings.length,
      sortKey,
      query,
      setSortKey: handleSortKey,
      setQuery,
      refresh,
      retry,
    }),
    [
      phase,
      message,
      isRefreshing,
      summary,
      visibleSymbols,
      holdings.length,
      sortKey,
      query,
      handleSortKey,
      refresh,
      retry,
    ],
  );
}
