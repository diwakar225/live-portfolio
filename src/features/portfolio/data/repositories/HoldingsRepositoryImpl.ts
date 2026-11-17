import { z } from 'zod';
import { paise } from '@/core/kernel';
import { readJson, writeJson, type KeyValueStorage } from '@/core/storage';
import type { Holding } from '../../domain/entities/Holding';
import type { HoldingsRepository } from '../../domain/repositories/HoldingsRepository';
import { createStartingHoldings } from '../startingHoldings';

const STORAGE_KEY = 'portfolio.holdings.v1';

const StoredHoldingsSchema = z.array(
  z.object({
    symbol: z.string().min(1),
    quantity: z.number().int().positive(),
    costBasis: z.number().int().nonnegative(),
  }),
);

export class HoldingsRepositoryImpl implements HoldingsRepository {
  constructor(private readonly storage: KeyValueStorage) {}

  load(): readonly Holding[] {
    const stored = readJson(this.storage, STORAGE_KEY, StoredHoldingsSchema);
    if (stored === undefined) {
      const seeded = createStartingHoldings();
      this.save(seeded);
      return seeded;
    }
    return stored.map(row => ({
      symbol: row.symbol,
      quantity: row.quantity,
      costBasis: paise(row.costBasis),
    }));
  }

  save(holdings: readonly Holding[]): void {
    writeJson(this.storage, STORAGE_KEY, holdings);
  }
}
