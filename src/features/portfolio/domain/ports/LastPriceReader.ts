import type { Paise } from '@/core/kernel';

export type LastPriceReader = (symbol: string) => Paise | null;
