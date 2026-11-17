import { toQuote } from '../quoteMapper';

describe('toQuote', () => {
  it('maps the API payload to a domain quote with integer paise', () => {
    const quote = toQuote({
      symbol: 'reliance',
      ltp: 1164.9,
      open: 1170.4,
      prevClose: 1167.4,
      high: 1174.6,
      low: 1152.5,
      volume: 14753650,
      timeStamp: '2026-10-30T15:59:52',
    });

    expect(quote).toEqual({
      symbol: 'RELIANCE',
      ltp: 116490,
      open: 117040,
      high: 117460,
      low: 115250,
      prevClose: 116740,
      volume: 14753650,
      exchangeTimestamp: '2026-10-30T15:59:52',
    });
  });

  it('treats absent, null, zero and negative prices as unavailable (never 0)', () => {
    const quote = toQuote({ symbol: 'TCS', ltp: 0, open: -1, high: null });

    expect(quote).toMatchObject({
      ltp: null,
      open: null,
      high: null,
      low: null,
      prevClose: null,
      volume: null,
      exchangeTimestamp: null,
    });
  });
});
