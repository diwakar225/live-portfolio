import type { Paise } from '@/core/kernel';
import type { Quote } from '../entities/Quote';
import type { PriceTick } from '../entities/Tick';

export function isStaleTick(lastAppliedSeq: number | undefined, tick: PriceTick): boolean {
  return lastAppliedSeq !== undefined && tick.seq <= lastAppliedSeq;
}

function pick(next: Paise | undefined, current: Paise | null): Paise | null {
  return next === undefined ? current : next;
}

export function applyTick(quote: Quote, tick: PriceTick): Quote {
  const ltp = pick(tick.ltp, quote.ltp);
  const high = pick(tick.high, quote.high);
  const low = pick(tick.low, quote.low);
  const volume = tick.volume === undefined ? quote.volume : tick.volume;

  if (ltp === quote.ltp && high === quote.high && low === quote.low && volume === quote.volume) {
    return quote;
  }
  return { ...quote, ltp, high, low, volume };
}
