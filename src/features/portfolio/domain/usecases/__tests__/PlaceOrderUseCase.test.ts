import { paise, type Paise } from '@/core/kernel';
import { averagePrice, holdingFromAverage, type Holding } from '../../entities/Holding';
import type { HoldingsRepository } from '../../repositories/HoldingsRepository';
import { PlaceOrderUseCase } from '../PlaceOrderUseCase';

const p = (value: number): Paise => paise(value);
const AT = 1_700_000_000_000;

function fakeRepository(initial: readonly Holding[]): HoldingsRepository & {
  readonly saved: Holding[][];
} {
  let current = [...initial];
  const saved: Holding[][] = [];
  return {
    saved,
    load: () => current,
    save: holdings => {
      current = [...holdings];
      saved.push([...holdings]);
    },
  };
}

const bySymbol = (holdings: readonly Holding[], symbol: string): Holding | undefined =>
  holdings.find(holding => holding.symbol === symbol);

describe('PlaceOrderUseCase', () => {
  const reliance = holdingFromAverage('RELIANCE', 10, p(100_000));

  it('fills a buy at the current price and persists the result', () => {
    const repository = fakeRepository([reliance]);
    const useCase = new PlaceOrderUseCase(
      repository,
      () => p(120_000),
      () => AT,
    );

    const result = useCase.execute({ symbol: 'RELIANCE', side: 'buy', rawQuantity: '10' });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.fill).toEqual({
      symbol: 'RELIANCE',
      side: 'buy',
      quantity: 10,
      price: 120_000,
      value: 1_200_000,
      filledAt: AT,
    });
    const next = bySymbol(result.value.holdings, 'RELIANCE');
    expect(next?.quantity).toBe(20);
    expect(averagePrice(next!)).toBe(110_000);
    expect(repository.saved).toHaveLength(1);
  });

  it('uses the price at confirm time, not an earlier one', () => {
    const repository = fakeRepository([reliance]);
    let price = p(100_000);
    const useCase = new PlaceOrderUseCase(
      repository,
      () => price,
      () => AT,
    );

    price = p(150_000);
    const result = useCase.execute({ symbol: 'RELIANCE', side: 'buy', rawQuantity: '1' });

    expect(result.ok && result.value.fill.price).toBe(150_000);
  });

  it('removes the holding entirely when all of it is sold', () => {
    const repository = fakeRepository([reliance]);
    const useCase = new PlaceOrderUseCase(
      repository,
      () => p(130_000),
      () => AT,
    );

    const result = useCase.execute({ symbol: 'RELIANCE', side: 'sell', rawQuantity: '10' });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(bySymbol(result.value.holdings, 'RELIANCE')).toBeUndefined();
    expect(repository.load()).toHaveLength(0);
  });

  it('opens a position in a symbol not held before', () => {
    const repository = fakeRepository([reliance]);
    const useCase = new PlaceOrderUseCase(
      repository,
      () => p(17_000),
      () => AT,
    );

    const result = useCase.execute({ symbol: 'WIPRO', side: 'buy', rawQuantity: '7' });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.holdings).toHaveLength(2);
    expect(bySymbol(result.value.holdings, 'WIPRO')?.costBasis).toBe(7 * 17_000);
  });

  it('leaves other holdings untouched', () => {
    const tcs = holdingFromAverage('TCS', 5, p(250_000));
    const repository = fakeRepository([reliance, tcs]);
    const useCase = new PlaceOrderUseCase(
      repository,
      () => p(120_000),
      () => AT,
    );

    const result = useCase.execute({ symbol: 'RELIANCE', side: 'buy', rawQuantity: '1' });

    expect(result.ok && bySymbol(result.value.holdings, 'TCS')).toEqual(tcs);
  });

  it('rejects an invalid quantity and writes nothing', () => {
    const repository = fakeRepository([reliance]);
    const useCase = new PlaceOrderUseCase(
      repository,
      () => p(120_000),
      () => AT,
    );

    for (const rawQuantity of ['', '0', '-1', '2.5', 'abc']) {
      expect(useCase.execute({ symbol: 'RELIANCE', side: 'buy', rawQuantity }).ok).toBe(false);
    }
    expect(repository.saved).toHaveLength(0);
  });

  it('refuses to oversell and writes nothing', () => {
    const repository = fakeRepository([reliance]);
    const useCase = new PlaceOrderUseCase(
      repository,
      () => p(120_000),
      () => AT,
    );

    const result = useCase.execute({ symbol: 'RELIANCE', side: 'sell', rawQuantity: '11' });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error.message).toMatch(/only 10 shares/);
    expect(repository.saved).toHaveLength(0);
  });

  it('refuses any order for a symbol with no price', () => {
    const repository = fakeRepository([holdingFromAverage('OLDCO', 30, p(41_250))]);
    const useCase = new PlaceOrderUseCase(
      repository,
      () => null,
      () => AT,
    );

    const buy = useCase.execute({ symbol: 'OLDCO', side: 'buy', rawQuantity: '1' });
    const sell = useCase.execute({ symbol: 'OLDCO', side: 'sell', rawQuantity: '1' });

    expect(buy.ok).toBe(false);
    expect(sell.ok).toBe(false);
    if (!buy.ok) {
      expect(buy.error.message).toMatch(/No live price/);
    }
    expect(repository.saved).toHaveLength(0);
  });
});
