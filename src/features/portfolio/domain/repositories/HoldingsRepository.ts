import type { Holding } from '../entities/Holding';

export interface HoldingsRepository {
  load(): readonly Holding[];
  save(holdings: readonly Holding[]): void;
}
