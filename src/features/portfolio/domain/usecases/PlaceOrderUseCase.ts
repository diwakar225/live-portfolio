import { appError, err, ok, systemClock, type Clock, type Result } from '@/core/kernel';
import type { Holding } from '../entities/Holding';
import type { OrderFill, OrderRequest } from '../entities/Order';
import type { LastPriceReader } from '../ports/LastPriceReader';
import type { HoldingsRepository } from '../repositories/HoldingsRepository';
import { applyOrder } from './applyOrder';
import { validateOrder } from './validateOrder';

export interface PlacedOrder {
  readonly fill: OrderFill;
  readonly holdings: readonly Holding[];
}

export interface PlaceOrder {
  execute(request: OrderRequest): Result<PlacedOrder>;
}

export class PlaceOrderUseCase implements PlaceOrder {
  constructor(
    private readonly holdings: HoldingsRepository,
    private readonly readLastPrice: LastPriceReader,
    private readonly clock: Clock = systemClock,
  ) {}

  execute(request: OrderRequest): Result<PlacedOrder> {
    const current = this.holdings.load();
    const existing = current.find(holding => holding.symbol === request.symbol);
    const fillPrice = this.readLastPrice(request.symbol);

    const quantity = validateOrder(request.rawQuantity, {
      side: request.side,
      heldQuantity: existing?.quantity ?? 0,
      hasLivePrice: fillPrice !== null,
    });
    if (!quantity.ok) {
      return quantity;
    }
    if (fillPrice === null) {
      return err(
        appError('validation', 'No live price available, so this order cannot be filled.'),
      );
    }

    const applied = applyOrder(existing, {
      symbol: request.symbol,
      side: request.side,
      quantity: quantity.value,
      fillPrice,
      filledAt: this.clock(),
    });
    if (!applied.ok) {
      return applied;
    }

    const next = current.filter(holding => holding.symbol !== request.symbol);
    if (applied.value.holding !== null) {
      next.push(applied.value.holding);
    }
    this.holdings.save(next);
    return ok({ fill: applied.value.fill, holdings: next });
  }
}
