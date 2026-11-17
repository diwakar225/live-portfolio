import { appError, err, ok, type Clock, type Result } from '@/core/kernel';
import type { Quote } from '../../entities/Quote';
import type { MarketDataRepository } from '../../repositories/MarketDataRepository';
import { buildQuote } from '../../../testing/quoteFixtures';
import { GetQuotesUseCase } from '../GetQuotesUseCase';

class StubMarketDataRepository implements MarketDataRepository {
  readonly requests: Array<readonly string[]> = [];

  constructor(private readonly response: Result<readonly Quote[]>) {}

  getQuotes(symbols: readonly string[]): Promise<Result<readonly Quote[]>> {
    this.requests.push(symbols);
    return Promise.resolve(this.response);
  }
}

function sequenceClock(...ticks: number[]): Clock {
  let index = 0;
  return () => ticks[Math.min(index++, ticks.length - 1)] ?? 0;
}

describe('GetQuotesUseCase', () => {
  it('normalises and de-duplicates symbols before calling the repository', async () => {
    const repository = new StubMarketDataRepository(ok([]));
    const useCase = new GetQuotesUseCase(repository);

    await useCase.execute([' reliance', 'TCS', 'tcs', '']);

    expect(repository.requests).toEqual([['RELIANCE', 'TCS']]);
  });

  it('rejects an empty request without calling the repository', async () => {
    const repository = new StubMarketDataRepository(ok([]));
    const useCase = new GetQuotesUseCase(repository);

    const result = await useCase.execute(['   ']);

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error.kind).toBe('validation');
    expect(repository.requests).toHaveLength(0);
  });

  it('reports symbols the source left out as missing instead of fabricating them', async () => {
    const repository = new StubMarketDataRepository(ok([buildQuote({ symbol: 'RELIANCE' })]));
    const useCase = new GetQuotesUseCase(repository);

    const result = await useCase.execute(['RELIANCE', 'OLDCO']);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.quotes.map(quote => quote.symbol)).toEqual(['RELIANCE']);
      expect(result.value.missingSymbols).toEqual(['OLDCO']);
    }
  });

  it('keeps request order and ignores unrequested or duplicate quotes', async () => {
    const firstTcs = buildQuote({ symbol: 'TCS' });
    const repository = new StubMarketDataRepository(
      ok([
        firstTcs,
        buildQuote({ symbol: 'INFY' }),
        buildQuote({ symbol: 'RELIANCE' }),
        buildQuote({ symbol: 'TCS', ltp: null }),
      ]),
    );
    const useCase = new GetQuotesUseCase(repository);

    const result = await useCase.execute(['RELIANCE', 'TCS']);

    expect(result.ok && result.value.quotes.map(quote => quote.symbol)).toEqual([
      'RELIANCE',
      'TCS',
    ]);
    expect(result.ok && result.value.quotes[1]).toBe(firstTcs);
  });

  it('stamps request and response times from the injected clock', async () => {
    const repository = new StubMarketDataRepository(ok([buildQuote({ symbol: 'TCS' })]));
    const useCase = new GetQuotesUseCase(repository, sequenceClock(100, 350));

    const result = await useCase.execute(['TCS']);

    expect(result.ok && result.value).toMatchObject({ requestedAt: 100, receivedAt: 350 });
  });

  it('propagates repository failures unchanged', async () => {
    const failure = appError('network', 'offline');
    const useCase = new GetQuotesUseCase(new StubMarketDataRepository(err(failure)));

    const result = await useCase.execute(['TCS']);

    expect(result).toEqual({ ok: false, error: failure });
  });
});
