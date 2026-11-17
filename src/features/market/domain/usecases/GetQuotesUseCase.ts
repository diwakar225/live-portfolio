import { appError, err, ok, systemClock, type Clock, type Result } from '@/core/kernel';
import type { Quote } from '../entities/Quote';
import type { MarketDataRepository } from '../repositories/MarketDataRepository';

export interface QuoteSnapshot {
  readonly symbols: readonly string[];
  readonly quotes: readonly Quote[];
  readonly missingSymbols: readonly string[];
  readonly requestedAt: number;
  readonly receivedAt: number;
}

export interface GetQuotes {
  execute(symbols: readonly string[]): Promise<Result<QuoteSnapshot>>;
}

function normalizeSymbols(symbols: readonly string[]): string[] {
  const unique = new Set<string>();
  for (const symbol of symbols) {
    const normalized = symbol.trim().toUpperCase();
    if (normalized.length > 0) {
      unique.add(normalized);
    }
  }
  return [...unique];
}

export class GetQuotesUseCase implements GetQuotes {
  constructor(
    private readonly repository: MarketDataRepository,
    private readonly clock: Clock = systemClock,
  ) {}

  async execute(symbols: readonly string[]): Promise<Result<QuoteSnapshot>> {
    const requested = normalizeSymbols(symbols);
    if (requested.length === 0) {
      return err(appError('validation', 'Select at least one symbol.'));
    }

    const requestedAt = this.clock();
    const result = await this.repository.getQuotes(requested);
    if (!result.ok) {
      return result;
    }
    const receivedAt = this.clock();

    const requestedSet = new Set(requested);
    const bySymbol = new Map<string, Quote>();
    for (const quote of result.value) {
      if (requestedSet.has(quote.symbol) && !bySymbol.has(quote.symbol)) {
        bySymbol.set(quote.symbol, quote);
      }
    }

    const quotes: Quote[] = [];
    const missingSymbols: string[] = [];
    for (const symbol of requested) {
      const quote = bySymbol.get(symbol);
      if (quote === undefined) {
        missingSymbols.push(symbol);
      } else {
        quotes.push(quote);
      }
    }

    return ok({ symbols: requested, quotes, missingSymbols, requestedAt, receivedAt });
  }
}
