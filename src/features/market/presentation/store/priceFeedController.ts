import { systemClock, type Clock } from '@/core/kernel';
import type { Logger } from '@/core/logging';
import type { PriceFeed } from '../../domain/ports/PriceFeed';
import type { FeedStatus, FeedStatusStore } from './feedStatusStore';
import type { QuoteStore } from './quoteStore';

export interface PriceFeedControllerOptions {
  readonly feed: PriceFeed;
  readonly quoteStore: QuoteStore;
  readonly feedStatusStore: FeedStatusStore;
  readonly logger: Logger;
  readonly clock?: Clock;
  readonly pausedAfterMs?: number;
  readonly watchdogIntervalMs?: number;
}

export interface PriceFeedController {
  start(): void;
  stop(): void;
}

export function createPriceFeedController({
  feed,
  quoteStore,
  feedStatusStore,
  logger,
  clock = systemClock,
  pausedAfterMs = 1_200,
  watchdogIntervalMs = 400,
}: PriceFeedControllerOptions): PriceFeedController {
  let unsubscribe: (() => void) | null = null;
  let watchdog: ReturnType<typeof setInterval> | null = null;
  let lastTickAt = 0;

  const setStatus = (status: FeedStatus): void => {
    feedStatusStore.getState().setStatus(status);
  };

  return {
    start(): void {
      if (unsubscribe !== null) {
        return;
      }
      lastTickAt = clock();
      const { applyTick } = quoteStore.getState();

      unsubscribe = feed.onTick(tick => {
        lastTickAt = clock();
        setStatus('live');
        applyTick(tick);
      });

      watchdog = setInterval(() => {
        setStatus(clock() - lastTickAt > pausedAfterMs ? 'paused' : 'live');
      }, watchdogIntervalMs);

      feed.connect();
      setStatus('live');
      logger.info('Price feed started');
    },

    stop(): void {
      unsubscribe?.();
      unsubscribe = null;
      if (watchdog !== null) {
        clearInterval(watchdog);
        watchdog = null;
      }
      feed.disconnect();
      setStatus('disconnected');
      logger.info('Price feed stopped');
    },
  };
}
