import type { Result } from '@/core/kernel';
import type { Quote } from '../entities/Quote';

export interface MarketDataRepository {
  getQuotes(symbols: readonly string[]): Promise<Result<readonly Quote[]>>;
}
