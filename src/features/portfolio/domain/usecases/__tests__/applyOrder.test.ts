import { paise, type Paise } from '@/core/kernel';
import { averagePrice, holdingFromAverage } from '../../entities/Holding';
import { applyOrder } from '../applyOrder';

const p = (value: number): Paise => paise(value);
const AT = 1_700_000_000_000;

describe('applyOrder', () => {
  const holding = holdingFromAverage('RELIANCE', 10, p(100_000));

  it('blends the average on a buy, using the cash actually spent', () => {
    const result = applyOrder(holding, {
      symbol: 'RELIANCE',
      side: 'buy',
      quantity: 10,
      fillPrice: p(120_000),
      filledAt: AT,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    const next = result.value.holding!;
    expect(next.quantity).toBe(20);
    expect(next.costBasis).toBe(10 * 100_000 + 10 * 120_000);
    expect(averagePrice(next)).toBe(110_000);
  });

  it('leaves the average unchanged on a sell', () => {
    const result = applyOrder(holding, {
      symbol: 'RELIANCE',
      side: 'sell',
      quantity: 4,
      fillPrice: p(150_000),
      filledAt: AT,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    const next = result.value.holding!;
    expect(next.quantity).toBe(6);
    expect(averagePrice(next)).toBe(100_000);
  });

  it('closes the position when everything is sold', () => {
    const result = applyOrder(holding, {
      symbol: 'RELIANCE',
      side: 'sell',
      quantity: 10,
      fillPrice: p(150_000),
      filledAt: AT,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.holding).toBeNull();
    expect(result.value.fill.value).toBe(10 * 150_000);
  });

  it('refuses to sell more than is held', () => {
    const result = applyOrder(holding, {
      symbol: 'RELIANCE',
      side: 'sell',
      quantity: 11,
      fillPrice: p(150_000),
      filledAt: AT,
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error.kind).toBe('validation');
    expect(result.error.message).toMatch(/only 10 held/);
  });

  it('opens a new position when buying something not held', () => {
    const result = applyOrder(undefined, {
      symbol: 'WIPRO',
      side: 'buy',
      quantity: 7,
      fillPrice: p(17_000),
      filledAt: AT,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.holding).toEqual({
      symbol: 'WIPRO',
      quantity: 7,
      costBasis: 7 * 17_000,
    });
  });

  it('rejects a non-whole or non-positive quantity', () => {
    for (const quantity of [0, -3, 1.5]) {
      const result = applyOrder(holding, {
        symbol: 'RELIANCE',
        side: 'buy',
        quantity,
        fillPrice: p(100),
        filledAt: AT,
      });
      expect(result.ok).toBe(false);
    }
  });

  it('records the fill at the price given', () => {
    const result = applyOrder(holding, {
      symbol: 'RELIANCE',
      side: 'buy',
      quantity: 2,
      fillPrice: p(123_456),
      filledAt: AT,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.fill).toEqual({
      symbol: 'RELIANCE',
      side: 'buy',
      quantity: 2,
      price: 123_456,
      value: 246_912,
      filledAt: AT,
    });
  });
});
