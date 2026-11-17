import type { Paise } from '@/core/kernel';

export interface Position {
  readonly symbol: string;
  readonly quantity: number;
  readonly averagePrice: Paise | null;
  readonly costBasis: Paise;
  readonly lastPrice: Paise | null;
  readonly marketValue: Paise | null;
  readonly totalPnl: Paise | null;
  readonly totalPnlPercent: number | null;
  readonly dayPnl: Paise | null;
  readonly dayPnlPercent: number | null;
  readonly isPriced: boolean;
}

export interface PortfolioSummary {
  readonly currentValue: Paise | null;
  readonly invested: Paise | null;
  readonly totalPnl: Paise | null;
  readonly totalPnlPercent: number | null;
  readonly dayPnl: Paise | null;
  readonly dayPnlPercent: number | null;
  readonly holdingsCount: number;
  readonly pricedCount: number;
  readonly unpricedSymbols: readonly string[];
}
