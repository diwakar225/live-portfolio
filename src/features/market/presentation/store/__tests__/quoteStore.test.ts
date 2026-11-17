import { paise } from '@/core/kernel';
import { buildQuote } from '../../../testing/quoteFixtures';
import { createQuoteStore } from '../quoteStore';

describe('createQuoteStore', () => {
  it('stores quotes by symbol', () => {
    const store = createQuoteStore();

    store.getState().upsertQuotes([buildQuote({ symbol: 'TCS' }), buildQuote({ symbol: 'INFY' })]);

    expect(Object.keys(store.getState().bySymbol)).toEqual(['TCS', 'INFY']);
  });

  it('keeps object identity for unchanged quotes so their rows do not re-render', () => {
    const store = createQuoteStore();
    store.getState().upsertQuotes([buildQuote({ symbol: 'TCS' }), buildQuote({ symbol: 'INFY' })]);
    const tcsBefore = store.getState().bySymbol.TCS;

    store
      .getState()
      .upsertQuotes([
        buildQuote({ symbol: 'TCS' }),
        buildQuote({ symbol: 'INFY', ltp: paise(150000) }),
      ]);

    expect(store.getState().bySymbol.TCS).toBe(tcsBefore);
    expect(store.getState().bySymbol.INFY?.ltp).toBe(150000);
  });

  it('does not notify subscribers when nothing changed', () => {
    const store = createQuoteStore();
    store.getState().upsertQuotes([buildQuote({ symbol: 'TCS' })]);
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);

    store.getState().upsertQuotes([buildQuote({ symbol: 'TCS' })]);
    unsubscribe();

    expect(listener).not.toHaveBeenCalled();
  });

  describe('applyTick', () => {
    const seeded = () => {
      const store = createQuoteStore();
      store
        .getState()
        .upsertQuotes([
          buildQuote({ symbol: 'TCS', ltp: paise(100_000) }),
          buildQuote({ symbol: 'INFY', ltp: paise(200_000) }),
        ]);
      return store;
    };

    it('applies a newer tick to one symbol only', () => {
      const store = seeded();
      const infyBefore = store.getState().bySymbol.INFY;

      store.getState().applyTick({ symbol: 'TCS', seq: 1, ltp: paise(101_000) });

      expect(store.getState().bySymbol.TCS?.ltp).toBe(101_000);
      expect(store.getState().bySymbol.INFY).toBe(infyBefore);
    });

    it('ignores a tick that arrived late', () => {
      const store = seeded();
      store.getState().applyTick({ symbol: 'TCS', seq: 5, ltp: paise(101_000) });
      const afterFresh = store.getState().bySymbol.TCS;

      store.getState().applyTick({ symbol: 'TCS', seq: 4, ltp: paise(999_999) });
      store.getState().applyTick({ symbol: 'TCS', seq: 5, ltp: paise(888_888) });

      expect(store.getState().bySymbol.TCS).toBe(afterFresh);
      expect(store.getState().bySymbol.TCS?.ltp).toBe(101_000);
    });

    it('does not notify subscribers for a late tick', () => {
      const store = seeded();
      store.getState().applyTick({ symbol: 'TCS', seq: 2, ltp: paise(101_000) });
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);

      store.getState().applyTick({ symbol: 'TCS', seq: 1, ltp: paise(1) });
      unsubscribe();

      expect(listener).not.toHaveBeenCalled();
    });

    it('ignores ticks for a symbol it holds no snapshot for', () => {
      const store = seeded();
      store.getState().applyTick({ symbol: 'UNKNOWN', seq: 1, ltp: paise(500) });

      expect(store.getState().bySymbol.UNKNOWN).toBeUndefined();
    });

    it('still accepts a newer tick after a late one was dropped', () => {
      const store = seeded();
      store.getState().applyTick({ symbol: 'TCS', seq: 5, ltp: paise(101_000) });
      store.getState().applyTick({ symbol: 'TCS', seq: 3, ltp: paise(1) });
      store.getState().applyTick({ symbol: 'TCS', seq: 6, ltp: paise(102_000) });

      expect(store.getState().bySymbol.TCS?.ltp).toBe(102_000);
    });
  });
});
