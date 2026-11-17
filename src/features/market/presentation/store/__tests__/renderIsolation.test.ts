import { act, renderHook } from '@testing-library/react-native';
import { paise } from '@/core/kernel';
import { useThrottledStore } from '@/shared/hooks';
import { buildQuote } from '../../../testing/quoteFixtures';
import { createQuoteStore, type QuoteStore } from '../quoteStore';
import { useQuote } from '../useMarketStores';

function seededStore(): QuoteStore {
  const store = createQuoteStore();
  store
    .getState()
    .upsertQuotes([
      buildQuote({ symbol: 'TCS', ltp: paise(100_000) }),
      buildQuote({ symbol: 'INFY', ltp: paise(200_000) }),
    ]);
  return store;
}

describe('per-symbol subscriptions', () => {
  it('does not re-render a row when a different symbol ticks', async () => {
    const store = seededStore();
    let renders = 0;
    await renderHook(() => {
      renders += 1;
      return useQuote(store, 'TCS');
    });

    const before = renders;
    await act(async () => {
      for (let seq = 1; seq <= 20; seq += 1) {
        store.getState().applyTick({ symbol: 'INFY', seq, ltp: paise(200_000 + seq) });
      }
    });

    expect(renders).toBe(before);
  });

  it('re-renders the row whose symbol ticked', async () => {
    const store = seededStore();
    let renders = 0;
    const { result } = await renderHook(() => {
      renders += 1;
      return useQuote(store, 'TCS');
    });

    const before = renders;
    await act(async () => {
      store.getState().applyTick({ symbol: 'TCS', seq: 1, ltp: paise(101_000) });
    });

    expect(renders).toBe(before + 1);
    expect(result.current?.ltp).toBe(101_000);
  });

  it('does not re-render for a late tick', async () => {
    const store = seededStore();
    let renders = 0;
    await renderHook(() => {
      renders += 1;
      return useQuote(store, 'TCS');
    });

    await act(async () => {
      store.getState().applyTick({ symbol: 'TCS', seq: 5, ltp: paise(101_000) });
    });
    const before = renders;

    await act(async () => {
      store.getState().applyTick({ symbol: 'TCS', seq: 4, ltp: paise(999_999) });
    });

    expect(renders).toBe(before);
  });

  it('does not re-render when a tick changes nothing', async () => {
    const store = seededStore();
    let renders = 0;
    await renderHook(() => {
      renders += 1;
      return useQuote(store, 'TCS');
    });

    const before = renders;
    await act(async () => {
      store.getState().applyTick({ symbol: 'TCS', seq: 1, ltp: paise(100_000) });
    });

    expect(renders).toBe(before);
  });
});

describe('useThrottledStore', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('coalesces a burst of ticks into a single render', async () => {
    const store = seededStore();
    let renders = 0;
    await renderHook(() => {
      renders += 1;
      return useThrottledStore(store, state => state.bySymbol, 300);
    });

    const before = renders;
    await act(async () => {
      for (let seq = 1; seq <= 60; seq += 1) {
        store.getState().applyTick({ symbol: 'TCS', seq, ltp: paise(100_000 + seq) });
      }
    });
    expect(renders).toBe(before);

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(renders).toBe(before + 1);
  });

  it('delivers the latest value, not the first of the burst', async () => {
    const store = seededStore();
    const { result } = await renderHook(() =>
      useThrottledStore(store, state => state.bySymbol.TCS?.ltp ?? null, 300),
    );

    await act(async () => {
      for (let seq = 1; seq <= 10; seq += 1) {
        store.getState().applyTick({ symbol: 'TCS', seq, ltp: paise(100_000 + seq) });
      }
    });
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe(100_010);
  });
});
