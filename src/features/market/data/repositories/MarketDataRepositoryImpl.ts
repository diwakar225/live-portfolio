import { mapResult, type Result } from '@/core/kernel';
import type { Quote } from '../../domain/entities/Quote';
import type { MarketDataRepository } from '../../domain/repositories/MarketDataRepository';
import type { LiquideMarketDataSource } from '../datasources/LiquideMarketDataSource';
import { toQuote } from '../mappers/quoteMapper';

export class MarketDataRepositoryImpl implements MarketDataRepository {
  constructor(private readonly remote: LiquideMarketDataSource) {}

  async getQuotes(symbols: readonly string[]): Promise<Result<readonly Quote[]>> {
    const result = await this.remote.fetchOhlc(symbols);
    return mapResult(result, items => items.map(toQuote));
  }
}
