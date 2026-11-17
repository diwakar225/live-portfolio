import type { Result } from '@/core/kernel';
import type { OrderFill, OrderRequest } from './domain/entities/Order';
import type { HoldingsStore } from './presentation/store/holdingsStore';

export interface PortfolioModule {
  readonly holdingsStore: HoldingsStore;
  readonly submitOrder: (request: OrderRequest) => Result<OrderFill>;
}
