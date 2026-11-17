import { paise, type Paise } from '@/core/kernel';
import { holdingFromAverage } from '../../entities/Holding';
import { calculatePosition } from '../calculatePosition';
import { calculateSummary } from '../calculateSummary';

const p = (value: number): Paise => paise(value);

describe('calculateSummary', () => {
  const priced = [
    calculatePosition(holdingFromAverage('A', 10, p(10_000)), {
      ltp: p(11_000),
      prevClose: p(10_500),
    }),
    calculatePosition(holdingFromAverage('B', 3, p(250_000)), {
      ltp: p(240_000),
      prevClose: p(245_000),
    }),
  ];
  const unpriced = calculatePosition(holdingFromAverage('OLDCO', 30, p(41_250)), {
    ltp: null,
    prevClose: null,
  });

  it('totals equal the sum of the rows as displayed', () => {
    const summary = calculateSummary(priced);
    const rowValue = priced.reduce((total, row) => total + (row.marketValue ?? 0), 0);
    const rowPnl = priced.reduce((total, row) => total + (row.totalPnl ?? 0), 0);
    const rowDayPnl = priced.reduce((total, row) => total + (row.dayPnl ?? 0), 0);

    expect(summary.currentValue).toBe(rowValue);
    expect(summary.totalPnl).toBe(rowPnl);
    expect(summary.dayPnl).toBe(rowDayPnl);
    expect(summary.currentValue! - summary.invested!).toBe(summary.totalPnl);
  });

  it('excludes an unpriced holding from value, cost and P&L', () => {
    const withUnpriced = calculateSummary([...priced, unpriced]);
    const withoutIt = calculateSummary(priced);

    expect(withUnpriced.currentValue).toBe(withoutIt.currentValue);
    expect(withUnpriced.invested).toBe(withoutIt.invested);
    expect(withUnpriced.totalPnl).toBe(withoutIt.totalPnl);
  });

  it('reports what it left out so the UI can say so', () => {
    const summary = calculateSummary([...priced, unpriced]);

    expect(summary.holdingsCount).toBe(3);
    expect(summary.pricedCount).toBe(2);
    expect(summary.unpricedSymbols).toEqual(['OLDCO']);
  });

  it('never turns a missing price into a zero or a loss', () => {
    const summary = calculateSummary([unpriced]);

    expect(summary.currentValue).toBeNull();
    expect(summary.invested).toBeNull();
    expect(summary.totalPnl).toBeNull();
    expect(summary.totalPnlPercent).toBeNull();
    expect(summary.pricedCount).toBe(0);
  });

  it('computes the day percentage from yesterday’s close, not from cost', () => {
    const summary = calculateSummary([priced[0]!]);
    expect(summary.dayPnl).toBe(10 * (11_000 - 10_500));
    expect(summary.dayPnlPercent).toBeCloseTo(((11_000 - 10_500) / 10_500) * 100, 10);
  });

  it('is empty, not zero, with no holdings at all', () => {
    const summary = calculateSummary([]);
    expect(summary.currentValue).toBeNull();
    expect(summary.holdingsCount).toBe(0);
    expect(summary.unpricedSymbols).toEqual([]);
  });
});
