import { addToWatchlist, availableToAdd, removeFromWatchlist } from '../watchlistRules';

const context = { isKnown: (symbol: string) => ['TCS', 'INFY', 'WIPRO'].includes(symbol) };

describe('addToWatchlist', () => {
  it('appends a known symbol', () => {
    const result = addToWatchlist(['TCS'], 'INFY', context);
    expect(result.ok && result.value).toEqual(['TCS', 'INFY']);
  });

  it('normalises case and whitespace', () => {
    const result = addToWatchlist([], '  infy  ', context);
    expect(result.ok && result.value).toEqual(['INFY']);
  });

  it('refuses an unknown symbol', () => {
    const result = addToWatchlist([], 'NOPE', context);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toMatch(/not in the available symbols/);
    }
  });

  it('refuses a duplicate, including a differently cased one', () => {
    expect(addToWatchlist(['TCS'], 'TCS', context).ok).toBe(false);
    expect(addToWatchlist(['TCS'], 'tcs', context).ok).toBe(false);
  });

  it('refuses an empty choice', () => {
    const result = addToWatchlist([], '   ', context);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toMatch(/Choose a symbol/);
    }
  });

  it('does not mutate the list it was given', () => {
    const current = ['TCS'];
    addToWatchlist(current, 'INFY', context);
    expect(current).toEqual(['TCS']);
  });
});

describe('removeFromWatchlist', () => {
  it('removes the symbol and keeps the rest in order', () => {
    expect(removeFromWatchlist(['TCS', 'INFY', 'WIPRO'], 'INFY')).toEqual(['TCS', 'WIPRO']);
  });

  it('is a no-op for something not on the list', () => {
    expect(removeFromWatchlist(['TCS'], 'INFY')).toEqual(['TCS']);
  });
});

describe('availableToAdd', () => {
  it('excludes what is already on the watchlist, keeping universe order', () => {
    expect(availableToAdd(['TCS', 'INFY', 'WIPRO'], ['INFY'])).toEqual(['TCS', 'WIPRO']);
  });

  it('returns nothing when everything is added', () => {
    expect(availableToAdd(['TCS'], ['TCS'])).toEqual([]);
  });
});
