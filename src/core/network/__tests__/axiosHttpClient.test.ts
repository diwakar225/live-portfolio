import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { createInMemoryTokenStore } from '@/core/auth';
import { silentLogger } from '@/core/logging';
import { createAxiosHttpClient } from '../axiosHttpClient';

function response(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown,
): AxiosResponse {
  return { data, status, statusText: String(status), headers: {}, config };
}

function respondWith(status: number, data: unknown = {}): AxiosAdapter {
  return config => {
    const res = response(config, status, data);
    if (status >= 200 && status < 300) {
      return Promise.resolve(res);
    }
    return Promise.reject(
      new AxiosError(
        `Request failed with status code ${status}`,
        AxiosError.ERR_BAD_RESPONSE,
        config,
        {},
        res,
      ),
    );
  };
}

function createClient(adapter: AxiosAdapter, token: string | null = null) {
  const tokenStore = createInMemoryTokenStore(token);
  const onUnauthorized = jest.fn();
  const client = createAxiosHttpClient({
    baseUrl: 'https://example.test/api',
    timeoutMs: 1_000,
    tokenStore,
    logger: silentLogger,
    onUnauthorized,
    adapter,
  });
  return { client, tokenStore, onUnauthorized };
}

describe('createAxiosHttpClient', () => {
  it('returns the body and attaches the bearer token when one is stored', async () => {
    let authorization: unknown;
    const { client } = createClient(config => {
      authorization = config.headers.get('Authorization');
      return Promise.resolve(response(config, 201, { hello: 'world' }));
    }, 'secret-token');

    const result = await client.post('/markets/ohlc', { symbols: ['RELIANCE'] });

    expect(result).toEqual({ ok: true, value: { hello: 'world' } });
    expect(authorization).toBe('Bearer secret-token');
  });

  it('does not send an Authorization header without a token', async () => {
    let hasAuthorization = true;
    const { client } = createClient(config => {
      hasAuthorization = config.headers.has('Authorization');
      return Promise.resolve(response(config, 200, null));
    });

    await client.get('/ping');

    expect(hasAuthorization).toBe(false);
  });

  it('maps non-2xx responses to an http AppError with the status', async () => {
    const { client } = createClient(respondWith(503));

    const result = await client.get('/ping');

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toMatchObject({ kind: 'http', status: 503 });
  });

  it('clears the token and notifies on 401', async () => {
    const { client, tokenStore, onUnauthorized } = createClient(respondWith(401), 'expired');

    const result = await client.get('/me');

    expect(!result.ok && result.error.kind).toBe('unauthorized');
    await expect(tokenStore.getAccessToken()).resolves.toBeNull();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('distinguishes timeouts from network failures', async () => {
    const timedOut = createClient(config =>
      Promise.reject(new AxiosError('timeout of 1000ms exceeded', AxiosError.ECONNABORTED, config)),
    );
    const offline = createClient(config =>
      Promise.reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, {})),
    );

    const timeoutResult = await timedOut.client.get('/ping');
    const networkResult = await offline.client.get('/ping');

    expect(!timeoutResult.ok && timeoutResult.error.kind).toBe('timeout');
    expect(!networkResult.ok && networkResult.error.kind).toBe('network');
  });
});
