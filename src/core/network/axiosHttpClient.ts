import axios, { type AxiosAdapter, type AxiosRequestConfig } from 'axios';
import type { TokenStore } from '@/core/auth';
import { err, ok, systemClock, type Clock, type Result } from '@/core/kernel';
import type { Logger } from '@/core/logging';
import type { HttpClient, RequestOptions } from './HttpClient';
import { installInterceptors } from './interceptors';
import { toAppError } from './toAppError';

export interface AxiosHttpClientOptions {
  readonly baseUrl: string;
  readonly timeoutMs: number;
  readonly tokenStore: TokenStore;
  readonly logger: Logger;
  readonly onUnauthorized?: () => void;
  readonly now?: Clock;
  readonly adapter?: AxiosAdapter;
}

function toAxiosConfig(options: RequestOptions | undefined): AxiosRequestConfig {
  if (options === undefined) {
    return {};
  }
  return { headers: options.headers, params: options.params, timeout: options.timeoutMs };
}

export function createAxiosHttpClient(options: AxiosHttpClientOptions): HttpClient {
  const instance = axios.create({
    baseURL: options.baseUrl,
    timeout: options.timeoutMs,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    ...(options.adapter === undefined ? {} : { adapter: options.adapter }),
  });

  installInterceptors(instance, {
    tokenStore: options.tokenStore,
    logger: options.logger,
    now: options.now ?? systemClock,
    onUnauthorized: options.onUnauthorized,
  });

  const execute = async (config: AxiosRequestConfig): Promise<Result<unknown>> => {
    try {
      const response = await instance.request<unknown>(config);
      return ok(response.data);
    } catch (error: unknown) {
      return err(toAppError(error));
    }
  };

  return {
    get: (path, requestOptions) =>
      execute({ ...toAxiosConfig(requestOptions), method: 'GET', url: path }),
    post: (path, body, requestOptions) =>
      execute({ ...toAxiosConfig(requestOptions), method: 'POST', url: path, data: body }),
  };
}
