import { appError, err, ok, type Result } from '@/core/kernel';
import type { OrderSide } from '../entities/Order';

export interface OrderContext {
  readonly side: OrderSide;
  readonly heldQuantity: number;
  readonly hasLivePrice: boolean;
}

const WHOLE_NUMBER = /^\d+$/;

export function validateOrder(rawQuantity: string, context: OrderContext): Result<number> {
  const trimmed = rawQuantity.trim();
  if (trimmed === '') {
    return err(appError('validation', 'Enter a quantity.'));
  }
  if (!WHOLE_NUMBER.test(trimmed)) {
    return err(appError('validation', 'Quantity must be a whole number of shares.'));
  }

  const quantity = Number(trimmed);
  if (!Number.isSafeInteger(quantity)) {
    return err(appError('validation', 'That quantity is too large.'));
  }
  if (quantity <= 0) {
    return err(appError('validation', 'Quantity must be greater than zero.'));
  }
  if (context.side === 'sell' && quantity > context.heldQuantity) {
    const { heldQuantity } = context;
    return err(
      appError(
        'validation',
        heldQuantity === 0
          ? 'You do not hold this stock.'
          : `You hold only ${heldQuantity} ${heldQuantity === 1 ? 'share' : 'shares'}.`,
      ),
    );
  }
  if (!context.hasLivePrice) {
    return err(appError('validation', 'No live price available, so this order cannot be filled.'));
  }
  return ok(quantity);
}
