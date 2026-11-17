import { mapResult, systemClock, type Clock } from '@/core/kernel';
import type { Logger } from '@/core/logging';
import type { KeyValueStorage } from '@/core/storage';
import { HoldingsRepositoryImpl } from './data/repositories/HoldingsRepositoryImpl';
import type { LastPriceReader } from './domain/ports/LastPriceReader';
import { PlaceOrderUseCase } from './domain/usecases/PlaceOrderUseCase';
import type { PortfolioModule } from './PortfolioModule';
import { createHoldingsStore } from './presentation/store/holdingsStore';

export interface PortfolioModuleDependencies {
  readonly storage: KeyValueStorage;
  readonly readLastPrice: LastPriceReader;
  readonly logger: Logger;
  readonly clock?: Clock;
}

export function createPortfolioModule({
  storage,
  readLastPrice,
  logger,
  clock = systemClock,
}: PortfolioModuleDependencies): PortfolioModule {
  const scoped = logger.child('portfolio');
  const repository = new HoldingsRepositoryImpl(storage);
  const holdingsStore = createHoldingsStore(repository.load());
  const placeOrder = new PlaceOrderUseCase(repository, readLastPrice, clock);

  return {
    holdingsStore,
    submitOrder: request => {
      const result = placeOrder.execute(request);
      if (result.ok) {
        holdingsStore.getState().setHoldings(result.value.holdings);
        scoped.info('Order filled', {
          symbol: request.symbol,
          side: request.side,
          quantity: result.value.fill.quantity,
        });
      } else {
        scoped.debug('Order rejected', { symbol: request.symbol, reason: result.error.message });
      }
      return mapResult(result, placed => placed.fill);
    },
  };
}
