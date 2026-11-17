export interface WatchlistRepository {
  load(): readonly string[];
  save(symbols: readonly string[]): void;
}
