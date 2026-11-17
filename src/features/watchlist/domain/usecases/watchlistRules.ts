import { appError, err, ok, type Result } from '@/core/kernel';

export interface WatchlistContext {
  readonly isKnown: (symbol: string) => boolean;
}

function normalize(symbol: string): string {
  return symbol.trim().toUpperCase();
}

export function addToWatchlist(
  current: readonly string[],
  symbol: string,
  { isKnown }: WatchlistContext,
): Result<readonly string[]> {
  const normalized = normalize(symbol);
  if (normalized === '') {
    return err(appError('validation', 'Choose a symbol to add.'));
  }
  if (!isKnown(normalized)) {
    return err(appError('validation', `${normalized} is not in the available symbols.`));
  }
  if (current.includes(normalized)) {
    return err(appError('validation', `${normalized} is already on your watchlist.`));
  }
  return ok([...current, normalized]);
}

export function removeFromWatchlist(current: readonly string[], symbol: string): readonly string[] {
  const normalized = normalize(symbol);
  return current.filter(entry => entry !== normalized);
}

export function availableToAdd(
  universe: readonly string[],
  current: readonly string[],
): readonly string[] {
  const existing = new Set(current);
  return universe.filter(symbol => !existing.has(symbol));
}
