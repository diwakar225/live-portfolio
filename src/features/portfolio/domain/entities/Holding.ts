import { paise, type Paise } from '@/core/kernel';

export interface Holding {
  readonly symbol: string;
  readonly quantity: number;
  readonly costBasis: Paise;
}

export function averagePrice(holding: Holding): Paise | null {
  if (holding.quantity <= 0) {
    return null;
  }
  return paise(Math.round(holding.costBasis / holding.quantity));
}

export function holdingFromAverage(symbol: string, quantity: number, averagePaise: Paise): Holding {
  return { symbol, quantity, costBasis: paise(quantity * averagePaise) };
}
