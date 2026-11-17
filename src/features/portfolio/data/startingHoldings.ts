import { rupeesToPaise, type Paise } from '@/core/kernel';
import { holdingFromAverage, type Holding } from '../domain/entities/Holding';

interface SeedRow {
  readonly symbol: string;
  readonly quantity: number;
  readonly averagePrice: number;
}

const SEED: readonly SeedRow[] = [
  { symbol: 'RELIANCE', quantity: 25, averagePrice: 1319.59 },
  { symbol: 'TCS', quantity: 40, averagePrice: 2589.71 },
  { symbol: 'HDFCBANK', quantity: 10, averagePrice: 755.86 },
  { symbol: 'INFY', quantity: 10, averagePrice: 1114.7 },
  { symbol: 'ICICIBANK', quantity: 5, averagePrice: 1566.04 },
  { symbol: 'SBIN', quantity: 15, averagePrice: 800.62 },
  { symbol: 'BHARTIARTL', quantity: 40, averagePrice: 1890.8 },
  { symbol: 'ITC', quantity: 15, averagePrice: 225.74 },
  { symbol: 'LT', quantity: 40, averagePrice: 3250.32 },
  { symbol: 'HINDUNILVR', quantity: 100, averagePrice: 1605.15 },
  { symbol: 'KOTAKBANK', quantity: 15, averagePrice: 474.57 },
  { symbol: 'AXISBANK', quantity: 100, averagePrice: 1378.55 },
  { symbol: 'BAJFINANCE', quantity: 100, averagePrice: 951.52 },
  { symbol: 'MARUTI', quantity: 5, averagePrice: 13017.25 },
  { symbol: 'SUNPHARMA', quantity: 5, averagePrice: 1784.28 },
  { symbol: 'TITAN', quantity: 12, averagePrice: 4061.93 },
  { symbol: 'ASIANPAINT', quantity: 12, averagePrice: 2316.35 },
  { symbol: 'ULTRACEMCO', quantity: 100, averagePrice: 10181.27 },
  { symbol: 'WIPRO', quantity: 12, averagePrice: 169.36 },
  { symbol: 'NTPC', quantity: 100, averagePrice: 326 },
  { symbol: 'OLDCO', quantity: 30, averagePrice: 412.5 },
];

export function createStartingHoldings(): readonly Holding[] {
  return SEED.map(row =>
    holdingFromAverage(row.symbol, row.quantity, rupeesToPaise(row.averagePrice) as Paise),
  );
}

export const STARTING_HOLDING_SYMBOLS: readonly string[] = SEED.map(row => row.symbol);
