import type { Paise } from '@/core/kernel';

export interface PriceTick {
  readonly symbol: string;
  readonly seq: number;
  readonly ltp?: Paise;
  readonly high?: Paise;
  readonly low?: Paise;
  readonly volume?: number;
}
