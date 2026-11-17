import { appError, err, type Result } from '@/core/kernel';
import type { Logger } from '@/core/logging';
import { toUserMessage } from '@/shared/errors';
import type { GetQuotes, QuoteSnapshot } from '../domain/usecases/GetQuotesUseCase';
import type { MarketStatusStore } from './store/marketStatusStore';
import type { QuoteStore } from './store/quoteStore';

export interface MarketDataControllerOptions {
  readonly getQuotes: GetQuotes;
  readonly quoteStore: QuoteStore;
  readonly marketStatusStore: MarketStatusStore;
  readonly symbols: readonly string[];
  readonly logger: Logger;
}

export interface MarketDataController {
  load(): Promise<void>;
  refresh(): Promise<void>;
}

export function createMarketDataController({
  getQuotes,
  quoteStore,
  marketStatusStore,
  symbols,
  logger,
}: MarketDataControllerOptions): MarketDataController {
  let latestRequestId = 0;

  const run = async (mode: 'load' | 'refresh'): Promise<void> => {
    const requestId = ++latestRequestId;
    const status = marketStatusStore.getState();
    if (mode === 'refresh') {
      status.setRefreshing(true);
    } else {
      status.setLoading();
    }

    const result: Result<QuoteSnapshot> = await getQuotes
      .execute(symbols)
      .catch((cause: unknown) =>
        err(appError('unknown', 'GetQuotes threw unexpectedly', { cause })),
      );

    if (requestId !== latestRequestId) {
      return;
    }

    if (!result.ok) {
      logger.warn('Market snapshot failed', { kind: result.error.kind });
      marketStatusStore.getState().setError(toUserMessage(result.error));
      return;
    }

    const { quotes, missingSymbols, receivedAt } = result.value;
    quoteStore.getState().upsertQuotes(quotes);

    const unpricedSymbols = [
      ...missingSymbols,
      ...quotes.filter(quote => quote.ltp === null).map(quote => quote.symbol),
    ];
    marketStatusStore.getState().setReady({ lastUpdatedAt: receivedAt, unpricedSymbols });
    logger.info('Market snapshot applied', {
      priced: quotes.length - unpricedSymbols.length,
      unpriced: unpricedSymbols.length,
    });
  };

  return {
    load: () => run('load'),
    refresh: () => run('refresh'),
  };
}
