import { paise, systemClock, type Clock } from '@/core/kernel';
import type { Quote } from '../../domain/entities/Quote';
import type { PriceTick } from '../../domain/entities/Tick';
import type { PriceFeed, TickHandler, Unsubscribe } from '../../domain/ports/PriceFeed';

export interface SimulatedPriceFeedOptions {
  readonly symbols: readonly string[];
  readonly readQuote: (symbol: string) => Quote | undefined;
  readonly random?: () => number;
  readonly clock?: Clock;
  readonly ticksPerSecond?: number;
  readonly maxMoveRatio?: number;
  readonly lateTickRatio?: number;
  readonly volumeTickRatio?: number;
  readonly quietEveryMs?: number;
  readonly quietDurationMs?: number;
}

type MutableTick = { -readonly [K in keyof PriceTick]: PriceTick[K] };

const HISTORY_PER_SYMBOL = 4;
const VOLUME_STEP = 5_000;

export class SimulatedPriceFeed implements PriceFeed {
  private readonly handlers = new Set<TickHandler>();
  private readonly lastSeq = new Map<string, number>();
  private readonly history = new Map<string, PriceTick[]>();
  private readonly random: () => number;
  private readonly clock: Clock;
  private readonly intervalMs: number;
  private readonly maxMoveRatio: number;
  private readonly lateTickRatio: number;
  private readonly volumeTickRatio: number;
  private readonly quietEveryMs: number;
  private readonly quietDurationMs: number;

  private timer: ReturnType<typeof setInterval> | null = null;
  private quietUntil = 0;
  private nextQuietAt = 0;

  constructor(private readonly options: SimulatedPriceFeedOptions) {
    this.random = options.random ?? Math.random;
    this.clock = options.clock ?? systemClock;
    this.intervalMs = Math.max(1, Math.round(1000 / (options.ticksPerSecond ?? 20)));
    this.maxMoveRatio = options.maxMoveRatio ?? 0.002;
    this.lateTickRatio = options.lateTickRatio ?? 0.02;
    this.volumeTickRatio = options.volumeTickRatio ?? 0.3;
    this.quietEveryMs = options.quietEveryMs ?? 60_000;
    this.quietDurationMs = options.quietDurationMs ?? 5_000;
  }

  connect(): void {
    if (this.timer !== null) {
      return;
    }
    this.nextQuietAt = this.clock() + this.quietEveryMs;
    this.quietUntil = 0;
    this.timer = setInterval(() => this.emitNext(), this.intervalMs);
  }

  disconnect(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  onTick(handler: TickHandler): Unsubscribe {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  emitNext(): void {
    const now = this.clock();
    if (this.nextQuietAt === 0) {
      this.nextQuietAt = now + this.quietEveryMs;
    }
    if (now < this.quietUntil) {
      return;
    }
    if (now >= this.nextQuietAt) {
      this.quietUntil = now + this.quietDurationMs;
      this.nextQuietAt = this.quietUntil + this.quietEveryMs;
      return;
    }

    const late = this.takeLateTick();
    if (late !== undefined) {
      this.publish(late);
      return;
    }

    const tick = this.buildTick();
    if (tick === undefined) {
      return;
    }
    this.lastSeq.set(tick.symbol, tick.seq);
    this.remember(tick);
    this.publish(tick);
  }

  private takeLateTick(): PriceTick | undefined {
    if (this.random() >= this.lateTickRatio) {
      return undefined;
    }
    const symbols = [...this.history.keys()];
    if (symbols.length === 0) {
      return undefined;
    }
    const symbol = symbols[Math.floor(this.random() * symbols.length)];
    const past = symbol === undefined ? undefined : this.history.get(symbol);
    if (past === undefined || past.length === 0) {
      return undefined;
    }
    return past[Math.floor(this.random() * past.length)];
  }

  private buildTick(): PriceTick | undefined {
    const { symbols, readQuote } = this.options;
    const symbol = symbols[Math.floor(this.random() * symbols.length)];
    if (symbol === undefined) {
      return undefined;
    }

    const quote = readQuote(symbol);
    if (quote === undefined || quote.ltp === null) {
      return undefined;
    }

    const ratio = (this.random() * 2 - 1) * this.maxMoveRatio;
    const ltp = paise(Math.max(1, Math.round(quote.ltp * (1 + ratio))));
    const tick: MutableTick = { symbol, seq: (this.lastSeq.get(symbol) ?? 0) + 1, ltp };

    if (quote.high !== null && ltp > quote.high) {
      tick.high = ltp;
    }
    if (quote.low !== null && ltp < quote.low) {
      tick.low = ltp;
    }
    if (quote.volume !== null && this.random() < this.volumeTickRatio) {
      tick.volume = quote.volume + Math.round(this.random() * VOLUME_STEP);
    }
    return tick;
  }

  private remember(tick: PriceTick): void {
    const past = this.history.get(tick.symbol) ?? [];
    past.push(tick);
    if (past.length > HISTORY_PER_SYMBOL) {
      past.shift();
    }
    this.history.set(tick.symbol, past);
  }

  private publish(tick: PriceTick): void {
    for (const handler of this.handlers) {
      handler(tick);
    }
  }
}
