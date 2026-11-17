import { paise } from '@/core/kernel';
import type { PortfolioSummary, Position } from '../entities/Position';

export function calculateSummary(positions: readonly Position[]): PortfolioSummary {
  let currentValue = 0;
  let invested = 0;
  let pricedCount = 0;

  let dayPnl = 0;
  let dayBase = 0;
  let dayCount = 0;

  const unpricedSymbols: string[] = [];

  for (const position of positions) {
    if (position.marketValue === null) {
      unpricedSymbols.push(position.symbol);
      continue;
    }
    pricedCount += 1;
    currentValue += position.marketValue;
    invested += position.costBasis;

    if (position.dayPnl !== null && position.lastPrice !== null) {
      dayPnl += position.dayPnl;
      dayBase += position.quantity * position.lastPrice - position.dayPnl;
      dayCount += 1;
    }
  }

  if (pricedCount === 0) {
    return {
      currentValue: null,
      invested: null,
      totalPnl: null,
      totalPnlPercent: null,
      dayPnl: null,
      dayPnlPercent: null,
      holdingsCount: positions.length,
      pricedCount: 0,
      unpricedSymbols,
    };
  }

  const totalPnl = currentValue - invested;
  return {
    currentValue: paise(currentValue),
    invested: paise(invested),
    totalPnl: paise(totalPnl),
    totalPnlPercent: invested > 0 ? (totalPnl / invested) * 100 : null,
    dayPnl: dayCount > 0 ? paise(dayPnl) : null,
    dayPnlPercent: dayCount > 0 && dayBase > 0 ? (dayPnl / dayBase) * 100 : null,
    holdingsCount: positions.length,
    pricedCount,
    unpricedSymbols,
  };
}
