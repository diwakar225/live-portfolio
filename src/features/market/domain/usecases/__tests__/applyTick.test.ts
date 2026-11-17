import { paise, type Paise } from '@/core/kernel';
import { buildQuote } from '../../../testing/quoteFixtures';
import { applyTick, isStaleTick } from '../applyTick';

const p = (value: number): Paise => paise(value);

describe('isStaleTick', () => {
  it('accepts the first tick for a symbol', () => {
    expect(isStaleTick(undefined, { symbol: 'TCS', seq: 7 })).toBe(false);
  });

  it('accepts a newer sequence number', () => {
    expect(isStaleTick(4, { symbol: 'TCS', seq: 5 })).toBe(false);
  });

  it('rejects an older or repeated sequence number', () => {
    expect(isStaleTick(5, { symbol: 'TCS', seq: 4 })).toBe(true);
    expect(isStaleTick(5, { symbol: 'TCS', seq: 5 })).toBe(true);
  });
});

describe('applyTick', () => {
  const quote = buildQuote({ symbol: 'TCS' });

  it('applies only the fields the tick carries', () => {
    const next = applyTick(quote, { symbol: 'TCS', seq: 1, ltp: p(200_000) });

    expect(next.ltp).toBe(200_000);
    expect(next.high).toBe(quote.high);
    expect(next.low).toBe(quote.low);
    expect(next.volume).toBe(quote.volume);
    expect(next.prevClose).toBe(quote.prevClose);
  });

  it('applies high, low and volume together', () => {
    const next = applyTick(quote, {
      symbol: 'TCS',
      seq: 2,
      ltp: p(130_000),
      high: p(130_500),
      low: p(110_000),
      volume: 20_000_000,
    });

    expect(next).toMatchObject({
      ltp: 130_000,
      high: 130_500,
      low: 110_000,
      volume: 20_000_000,
    });
  });

  it('returns the same object when the tick changes nothing', () => {
    const next = applyTick(quote, { symbol: 'TCS', seq: 3, ltp: quote.ltp ?? undefined });
    expect(next).toBe(quote);
  });

  it('returns the same object for a tick with no fields at all', () => {
    expect(applyTick(quote, { symbol: 'TCS', seq: 4 })).toBe(quote);
  });

  it('never invents a price for an unpriced quote', () => {
    const unpriced = buildQuote({ symbol: 'OLDCO', ltp: null, high: null, low: null });
    const next = applyTick(unpriced, { symbol: 'OLDCO', seq: 1, volume: 10 });

    expect(next.ltp).toBeNull();
    expect(next.high).toBeNull();
    expect(next.low).toBeNull();
  });
});
