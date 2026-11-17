import { paise, type Paise } from '@/core/kernel';
import { holdingFromAverage } from '../../entities/Holding';
import { calculatePosition } from '../calculatePosition';

const p = (value: number): Paise => paise(value);

describe('calculatePosition', () => {
  it('computes value and P&L exactly in integer paise', () => {
    const holding = holdingFromAverage('RELIANCE', 25, p(131959));
    const position = calculatePosition(holding, { ltp: p(133970), prevClose: p(133000) });

    expect(position.costBasis).toBe(25 * 131959);
    expect(position.averagePrice).toBe(131959);
    expect(position.marketValue).toBe(25 * 133970);
    expect(position.totalPnl).toBe(25 * (133970 - 131959));
    expect(position.dayPnl).toBe(25 * (133970 - 133000));
    expect(position.isPriced).toBe(true);
  });

  it('reports percentages against cost and previous close', () => {
    const holding = holdingFromAverage('TEST', 10, p(10_000));
    const position = calculatePosition(holding, { ltp: p(11_000), prevClose: p(10_000) });

    expect(position.totalPnlPercent).toBeCloseTo(10, 10);
    expect(position.dayPnlPercent).toBeCloseTo(10, 10);
  });

  it('leaves everything price-derived null when there is no price', () => {
    const holding = holdingFromAverage('OLDCO', 30, p(41_250));
    const position = calculatePosition(holding, { ltp: null, prevClose: null });

    expect(position.isPriced).toBe(false);
    expect(position.lastPrice).toBeNull();
    expect(position.marketValue).toBeNull();
    expect(position.totalPnl).toBeNull();
    expect(position.totalPnlPercent).toBeNull();
    expect(position.dayPnl).toBeNull();
    expect(position.costBasis).toBe(30 * 41_250);
    expect(position.averagePrice).toBe(41_250);
  });

  it('treats a missing quote the same as a missing price', () => {
    const position = calculatePosition(holdingFromAverage('GONE', 5, p(100)), undefined);
    expect(position.isPriced).toBe(false);
    expect(position.marketValue).toBeNull();
  });

  it('still values the position when only previous close is missing', () => {
    const position = calculatePosition(holdingFromAverage('NEW', 4, p(500)), {
      ltp: p(600),
      prevClose: null,
    });

    expect(position.marketValue).toBe(2_400);
    expect(position.totalPnl).toBe(400);
    expect(position.dayPnl).toBeNull();
    expect(position.dayPnlPercent).toBeNull();
  });
});
