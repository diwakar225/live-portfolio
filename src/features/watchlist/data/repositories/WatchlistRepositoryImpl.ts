import { z } from 'zod';
import { readJson, writeJson, type KeyValueStorage } from '@/core/storage';
import type { WatchlistRepository } from '../../domain/repositories/WatchlistRepository';

const STORAGE_KEY = 'watchlist.symbols.v1';
const StoredWatchlistSchema = z.array(z.string().min(1));

export class WatchlistRepositoryImpl implements WatchlistRepository {
  constructor(private readonly storage: KeyValueStorage) {}

  load(): readonly string[] {
    return readJson(this.storage, STORAGE_KEY, StoredWatchlistSchema) ?? [];
  }

  save(symbols: readonly string[]): void {
    writeJson(this.storage, STORAGE_KEY, symbols);
  }
}
