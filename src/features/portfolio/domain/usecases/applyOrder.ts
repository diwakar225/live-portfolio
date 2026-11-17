import { appError, err, ok, paise, type Paise, type Result } from '@/core/kernel';
import type { Holding } from '../entities/Holding';
import type { OrderFill, OrderSide } from '../entities/Order';

export interface AppliedOrder {
  readonly holding: Holding | null;
  readonly fill: OrderFill;
}

export interface OrderToApply {
  readonly symbol: string;
  readonly side: OrderSide;
  readonly quantity: number;
  readonly fillPrice: Paise;
  readonly filledAt: number;
}

export function applyOrder(
  current: Holding | undefined,
  order: OrderToApply,
): Result<AppliedOrder> {
  const { symbol, side, quantity, fillPrice, filledAt } = order;
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    return err(appError('validation', 'Quantity must be a whole number greater than zero.'));
  }

  const fill: OrderFill = {
    symbol,
    side,
    quantity,
    price: fillPrice,
    value: paise(quantity * fillPrice),
    filledAt,
  };

  const heldQuantity = current?.quantity ?? 0;

  if (side === 'buy') {
    return ok({
      holding: {
        symbol,
        quantity: heldQuantity + quantity,
        costBasis: paise((current?.costBasis ?? 0) + quantity * fillPrice),
      },
      fill,
    });
  }

  if (quantity > heldQuantity) {
    return err(
      appError('validation', `Cannot sell ${quantity} shares; only ${heldQuantity} held.`),
    );
  }

  const remaining = heldQuantity - quantity;
  if (remaining === 0 || current === undefined) {
    return ok({ holding: null, fill });
  }
  return ok({
    holding: {
      symbol,
      quantity: remaining,
      costBasis: paise(Math.round((current.costBasis * remaining) / heldQuantity)),
    },
    fill,
  });
}
