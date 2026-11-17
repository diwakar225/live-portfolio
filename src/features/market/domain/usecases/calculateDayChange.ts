import { paise, type Paise } from '@/core/kernel';
import type { Quote } from '../entities/Quote';

export interface DayChange {
  readonly amount: Paise | null;
  readonly percent: number | null;
}

const UNKNOWN: DayChange = { amount: null, percent: null };

export function calculateDayChange(quote: Quote | undefined): DayChange {
  if (quote === undefined || quote.ltp === null || quote.prevClose === null) {
    return UNKNOWN;
  }
  const amount = paise(quote.ltp - quote.prevClose);
  if (quote.prevClose <= 0) {
    return { amount, percent: null };
  }
  return { amount, percent: (amount / quote.prevClose) * 100 };
}
