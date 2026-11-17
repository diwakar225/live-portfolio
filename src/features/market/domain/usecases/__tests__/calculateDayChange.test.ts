import { paise } from '@/core/kernel';
import { buildQuote } from '../../../testing/quoteFixtures';
import { calculateDayChange } from '../calculateDayChange';

describe('calculateDayChange', () => {
  it('computes the move and percentage against the previous close', () => {
    const change = calculateDayChange(
      buildQuote({ symbol: 'TCS', ltp: paise(110_000), prevClose: paise(100_000) }),
    );

    expect(change.amount).toBe(10_000);
    expect(change.percent).toBeCloseTo(10, 10);
  });

  it('reports a fall as a negative move', () => {
    const change = calculateDayChange(
      buildQuote({ symbol: 'TCS', ltp: paise(95_000), prevClose: paise(100_000) }),
    );

    expect(change.amount).toBe(-5_000);
    expect(change.percent).toBeCloseTo(-5, 10);
  });

  it('is unknown rather than zero when the last price is missing', () => {
    const change = calculateDayChange(buildQuote({ symbol: 'OLDCO', ltp: null }));
    expect(change).toEqual({ amount: null, percent: null });
  });

  it('is unknown rather than zero when the previous close is missing', () => {
    const change = calculateDayChange(buildQuote({ symbol: 'NEW', prevClose: null }));
    expect(change).toEqual({ amount: null, percent: null });
  });

  it('is unknown for a symbol with no quote at all', () => {
    expect(calculateDayChange(undefined)).toEqual({ amount: null, percent: null });
  });

  it('gives an amount but no percentage when the previous close is zero', () => {
    const change = calculateDayChange(
      buildQuote({ symbol: 'ODD', ltp: paise(500), prevClose: paise(0) }),
    );

    expect(change.amount).toBe(500);
    expect(change.percent).toBeNull();
  });
});
