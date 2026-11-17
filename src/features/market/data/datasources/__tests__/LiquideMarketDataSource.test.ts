import { appError, err, ok, type Result } from '@/core/kernel';
import { silentLogger } from '@/core/logging';
import type { HttpClient } from '@/core/network';
import { LiquideMarketDataSource } from '../LiquideMarketDataSource';

class StubHttpClient implements HttpClient {
  readonly posts: Array<{ path: string; body: unknown }> = [];

  constructor(private readonly response: Result<unknown>) {}

  get(): Promise<Result<unknown>> {
    return Promise.resolve(this.response);
  }

  post(path: string, body: unknown): Promise<Result<unknown>> {
    this.posts.push({ path, body });
    return Promise.resolve(this.response);
  }
}

const RELIANCE = {
  symbol: 'RELIANCE',
  isin: 'INE002A01018',
  ltp: 1164.9,
  open: 1170.4,
  prevClose: 1167.4,
  high: 1174.6,
  low: 1152.5,
  volume: 14753650,
  timeStamp: '2026-10-30T15:59:52',
  scripId: '62584d19d8ddbbdfbe1ccfcf',
  navDate: null,
  tsn: 13012,
};

const envelope = (data: unknown[]) => ({
  status: 'success',
  code: 200,
  count: data.length,
  message: { data },
});

describe('LiquideMarketDataSource', () => {
  it('posts the symbols and returns the parsed items', async () => {
    const http = new StubHttpClient(ok(envelope([RELIANCE])));
    const source = new LiquideMarketDataSource(http, silentLogger);

    const result = await source.fetchOhlc(['RELIANCE', 'OLDCO']);

    expect(http.posts).toEqual([
      { path: '/markets/ohlc', body: { symbols: ['RELIANCE', 'OLDCO'] } },
    ]);
    expect(result.ok && result.value).toEqual([
      expect.objectContaining({ symbol: 'RELIANCE', ltp: 1164.9, volume: 14753650 }),
    ]);
  });

  it('drops a malformed item instead of failing the whole response', async () => {
    const http = new StubHttpClient(ok(envelope([RELIANCE, { symbol: 'TCS', ltp: 'n/a' }])));
    const source = new LiquideMarketDataSource(http, silentLogger);

    const result = await source.fetchOhlc(['RELIANCE', 'TCS']);

    expect(result.ok && result.value.map(item => item.symbol)).toEqual(['RELIANCE']);
  });

  it('rejects a body that is not the documented envelope', async () => {
    const source = new LiquideMarketDataSource(new StubHttpClient(ok('<html>')), silentLogger);

    const result = await source.fetchOhlc(['RELIANCE']);

    expect(!result.ok && result.error.kind).toBe('invalid-response');
  });

  it('surfaces a non-success status from the envelope', async () => {
    const http = new StubHttpClient(ok({ status: 'error', code: 500, message: 'down' }));
    const source = new LiquideMarketDataSource(http, silentLogger);

    const result = await source.fetchOhlc(['RELIANCE']);

    expect(!result.ok && result.error).toMatchObject({ kind: 'http', status: 500 });
  });

  it('passes transport errors through unchanged', async () => {
    const failure = appError('timeout', 'timeout of 10000ms exceeded');
    const source = new LiquideMarketDataSource(new StubHttpClient(err(failure)), silentLogger);

    await expect(source.fetchOhlc(['RELIANCE'])).resolves.toEqual({ ok: false, error: failure });
  });
});
