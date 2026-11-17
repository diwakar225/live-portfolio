import { rupeesToPaise, type Paise } from '@/core/kernel';
import type { Quote } from '../../domain/entities/Quote';
import type { OhlcItemDto } from '../dtos/ohlcDto';

function toPrice(rupees: number | null | undefined): Paise | null {
  if (rupees === null || rupees === undefined || rupees <= 0) {
    return null;
  }
  return rupeesToPaise(rupees);
}

export function toQuote(dto: OhlcItemDto): Quote {
  return {
    symbol: dto.symbol.trim().toUpperCase(),
    ltp: toPrice(dto.ltp),
    open: toPrice(dto.open),
    high: toPrice(dto.high),
    low: toPrice(dto.low),
    prevClose: toPrice(dto.prevClose),
    volume: dto.volume ?? null,
    exchangeTimestamp: dto.timeStamp ?? null,
  };
}
