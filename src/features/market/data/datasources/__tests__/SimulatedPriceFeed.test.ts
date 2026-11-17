import { paise } from '@/core/kernel';
import type { Quote } from '../../../domain/entities/Quote';
import type { PriceTick } from '../../../domain/entities/Tick';
import { buildQuote } from '../../../testing/quoteFixtures';
import { SimulatedPriceFeed } from '../SimulatedPriceFeed';

function controllableRandom() {
  const queued: number[] = [];
  return {
    fn: (): number => queued.shift() ?? 0.5,
    push: (...values: readonly number[]): void => {
      queued.push(...values);
    },
  };
}

function lcg(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;
    return state / 2_147_483_648;
  };
}

interface Harness {
  readonly feed: SimulatedPriceFeed;
  readonly ticks: PriceTick[];
  setTime(ms: number): void;
}

function createHarness(options: {
  quotes: Record<string, Quote>;
  random?: () => number;
  lateTickRatio?: number;
  volumeTickRatio?: number;
  quietEveryMs?: number;
  quietDurationMs?: number;
}): Harness {
  let now = 0;
  const ticks: PriceTick[] = [];
  const feed = new SimulatedPriceFeed({
    symbols: Object.keys(options.quotes),
    readQuote: symbol => options.quotes[symbol],
    random: options.random ?? (() => 0.5),
    clock: () => now,
    lateTickRatio: options.lateTickRatio ?? 0,
    volumeTickRatio: options.volumeTickRatio ?? 0,
    quietEveryMs: options.quietEveryMs ?? 1_000_000,
    quietDurationMs: options.quietDurationMs ?? 5_000,
  });
  feed.onTick(tick => ticks.push(tick));
  return {
    feed,
    ticks,
    setTime: ms => {
      now = ms;
    },
  };
}

describe('SimulatedPriceFeed', () => {
  it('numbers ticks from 1 upwards, per symbol independently', () => {
    const quotes = {
      AAA: buildQuote({ symbol: 'AAA' }),
      BBB: buildQuote({ symbol: 'BBB' }),
    };
    const harness = createHarness({ quotes, random: lcg(42) });

    for (let i = 0; i < 60; i += 1) {
      harness.feed.emitNext();
    }

    for (const symbol of ['AAA', 'BBB']) {
      const seqs = harness.ticks.filter(tick => tick.symbol === symbol).map(tick => tick.seq);
      expect(seqs.length).toBeGreaterThan(0);
      expect(seqs).toEqual(Array.from({ length: seqs.length }, (_, index) => index + 1));
    }
  });

  it('moves the price by no more than the configured ratio', () => {
    const quotes = { AAA: buildQuote({ symbol: 'AAA', ltp: paise(100_000) }) };
    const random = controllableRandom();
    const harness = createHarness({ quotes, random: random.fn });

    random.push(0.5, 0, 0, 0.5);
    harness.feed.emitNext();
    random.push(0.5, 0, 1, 0.5);
    harness.feed.emitNext();

    expect(harness.ticks[0]?.ltp).toBe(99_800);
    expect(harness.ticks[1]?.ltp).toBe(100_200);
  });

  it('keeps every move inside the band over many ticks', () => {
    const quotes = { AAA: buildQuote({ symbol: 'AAA', ltp: paise(100_000) }) };
    const harness = createHarness({ quotes, random: lcg(7) });

    for (let i = 0; i < 100; i += 1) {
      harness.feed.emitNext();
    }

    for (const tick of harness.ticks) {
      expect(tick.ltp).toBeGreaterThanOrEqual(99_800);
      expect(tick.ltp).toBeLessThanOrEqual(100_200);
    }
  });

  it('never ticks a symbol that has no price', () => {
    const quotes = { OLDCO: buildQuote({ symbol: 'OLDCO', ltp: null }) };
    const harness = createHarness({ quotes, random: lcg(3) });

    for (let i = 0; i < 40; i += 1) {
      harness.feed.emitNext();
    }

    expect(harness.ticks).toHaveLength(0);
  });

  it('raises high and lowers low only when the price passes them', () => {
    const quotes = {
      AAA: buildQuote({
        symbol: 'AAA',
        ltp: paise(100_000),
        high: paise(100_100),
        low: paise(99_900),
      }),
    };
    const random = controllableRandom();
    const harness = createHarness({ quotes, random: random.fn });

    random.push(0.5, 0, 1, 0.5);
    harness.feed.emitNext();
    expect(harness.ticks[0]?.high).toBe(100_200);
    expect(harness.ticks[0]?.low).toBeUndefined();

    random.push(0.5, 0, 0, 0.5);
    harness.feed.emitNext();
    expect(harness.ticks[1]?.low).toBe(99_800);
    expect(harness.ticks[1]?.high).toBeUndefined();
  });

  it('includes volume only on some ticks', () => {
    const quotes = { AAA: buildQuote({ symbol: 'AAA', volume: 1_000 }) };
    const random = controllableRandom();
    const harness = createHarness({ quotes, random: random.fn, volumeTickRatio: 0.5 });

    random.push(0.9, 0, 0.5, 0.9);
    harness.feed.emitNext();
    random.push(0.9, 0, 0.5, 0.1, 0);
    harness.feed.emitNext();

    expect(harness.ticks[0]?.volume).toBeUndefined();
    expect(harness.ticks[1]?.volume).toBe(1_000);
  });

  it('re-sends an earlier tick out of order, which consumers must ignore', () => {
    const quotes = { AAA: buildQuote({ symbol: 'AAA' }) };
    const random = controllableRandom();
    const harness = createHarness({ quotes, random: random.fn, lateTickRatio: 0.02 });

    harness.feed.emitNext();
    harness.feed.emitNext();
    expect(harness.ticks.map(tick => tick.seq)).toEqual([1, 2]);

    random.push(0.01, 0, 0);
    harness.feed.emitNext();

    expect(harness.ticks).toHaveLength(3);
    expect(harness.ticks[2]?.seq).toBe(1);
  });

  it('goes quiet for the configured window, then resumes', () => {
    const quotes = { AAA: buildQuote({ symbol: 'AAA' }) };
    const harness = createHarness({ quotes, quietEveryMs: 1_000, quietDurationMs: 5_000 });

    harness.setTime(0);
    harness.feed.connect();
    harness.feed.emitNext();
    expect(harness.ticks).toHaveLength(1);

    harness.setTime(1_000);
    harness.feed.emitNext();
    expect(harness.ticks).toHaveLength(1);

    harness.setTime(4_000);
    harness.feed.emitNext();
    expect(harness.ticks).toHaveLength(1);

    harness.setTime(6_001);
    harness.feed.emitNext();
    expect(harness.ticks).toHaveLength(2);

    harness.feed.disconnect();
  });

  it('stops emitting after disconnect and is safe to connect twice', () => {
    jest.useFakeTimers();
    try {
      const quotes = { AAA: buildQuote({ symbol: 'AAA' }) };
      const harness = createHarness({ quotes });

      harness.feed.connect();
      harness.feed.connect();
      jest.advanceTimersByTime(200);
      const afterConnect = harness.ticks.length;
      expect(afterConnect).toBeGreaterThan(0);

      harness.feed.disconnect();
      jest.advanceTimersByTime(500);
      expect(harness.ticks).toHaveLength(afterConnect);
    } finally {
      jest.useRealTimers();
    }
  });

  it('emits about twenty ticks a second by default', () => {
    jest.useFakeTimers();
    try {
      const quotes = { AAA: buildQuote({ symbol: 'AAA' }) };
      const harness = createHarness({ quotes });

      harness.feed.connect();
      jest.advanceTimersByTime(1_000);
      harness.feed.disconnect();

      expect(harness.ticks.length).toBeGreaterThanOrEqual(18);
      expect(harness.ticks.length).toBeLessThanOrEqual(22);
    } finally {
      jest.useRealTimers();
    }
  });

  it('delivers to every handler and stops after unsubscribe', () => {
    const quotes = { AAA: buildQuote({ symbol: 'AAA' }) };
    const harness = createHarness({ quotes });
    const second = jest.fn();
    const unsubscribe = harness.feed.onTick(second);

    harness.feed.emitNext();
    expect(second).toHaveBeenCalledTimes(1);

    unsubscribe();
    harness.feed.emitNext();
    expect(second).toHaveBeenCalledTimes(1);
    expect(harness.ticks).toHaveLength(2);
  });
});
