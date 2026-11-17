import type { Paise } from '@/core/kernel';

export type OrderSide = 'buy' | 'sell';

export interface OrderRequest {
  readonly symbol: string;
  readonly side: OrderSide;
  readonly rawQuantity: string;
}

export interface OrderFill {
  readonly symbol: string;
  readonly side: OrderSide;
  readonly quantity: number;
  readonly price: Paise;
  readonly value: Paise;
  readonly filledAt: number;
}
