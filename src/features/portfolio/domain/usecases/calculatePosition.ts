import { paise, type Paise } from '@/core/kernel';
import { averagePrice, type Holding } from '../entities/Holding';
import type { Position } from '../entities/Position';

export interface PriceSnapshot {
  readonly ltp: Paise | null;
  readonly prevClose: Paise | null;
}

function percentOf(numerator: number, base: number): number | null {
  return base <= 0 ? null : (numerator / base) * 100;
}

export function calculatePosition(holding: Holding, price: PriceSnapshot | undefined): Position {
  const { symbol, quantity, costBasis } = holding;
  const average = averagePrice(holding);
  const lastPrice = price?.ltp ?? null;
  const prevClose = price?.prevClose ?? null;

  if (lastPrice === null) {
    return {
      symbol,
      quantity,
      averagePrice: average,
      costBasis,
      lastPrice: null,
      marketValue: null,
      totalPnl: null,
      totalPnlPercent: null,
      dayPnl: null,
      dayPnlPercent: null,
      isPriced: false,
    };
  }

  const marketValue = paise(quantity * lastPrice);
  const totalPnl = paise(marketValue - costBasis);

  return {
    symbol,
    quantity,
    averagePrice: average,
    costBasis,
    lastPrice,
    marketValue,
    totalPnl,
    totalPnlPercent: percentOf(totalPnl, costBasis),
    dayPnl: prevClose === null ? null : paise(quantity * (lastPrice - prevClose)),
    dayPnlPercent: prevClose === null ? null : percentOf(lastPrice - prevClose, prevClose),
    isPriced: true,
  };
}
