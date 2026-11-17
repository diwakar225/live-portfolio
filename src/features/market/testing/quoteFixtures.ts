import { paise } from '@/core/kernel';
import type { Quote } from '../domain/entities/Quote';
import type { QuoteSnapshot } from '../domain/usecases/GetQuotesUseCase';

export function buildQuote(overrides: Partial<Quote> & Pick<Quote, 'symbol'>): Quote {
  return {
    ltp: paise(116490),
    open: paise(117040),
    high: paise(117460),
    low: paise(115250),
    prevClose: paise(116740),
    volume: 14_753_650,
    exchangeTimestamp: '2026-10-30T15:59:52',
    ...overrides,
  };
}

export function buildSnapshot(overrides: Partial<QuoteSnapshot> = {}): QuoteSnapshot {
  return {
    symbols: ['RELIANCE', 'TCS'],
    quotes: [buildQuote({ symbol: 'RELIANCE' }), buildQuote({ symbol: 'TCS', ltp: paise(302550) })],
    missingSymbols: [],
    requestedAt: 1_000,
    receivedAt: 1_245,
    ...overrides,
  };
}
