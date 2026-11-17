import type { Paise } from '@/core/kernel';

export interface Quote {
  readonly symbol: string;
  readonly ltp: Paise | null;
  readonly open: Paise | null;
  readonly high: Paise | null;
  readonly low: Paise | null;
  readonly prevClose: Paise | null;
  readonly volume: number | null;
  readonly exchangeTimestamp: string | null;
}

export function isSameQuote(a: Quote, b: Quote): boolean {
  return (
    a.symbol === b.symbol &&
    a.ltp === b.ltp &&
    a.open === b.open &&
    a.high === b.high &&
    a.low === b.low &&
    a.prevClose === b.prevClose &&
    a.volume === b.volume &&
    a.exchangeTimestamp === b.exchangeTimestamp
  );
}
