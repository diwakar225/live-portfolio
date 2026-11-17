import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { TokenStore } from '@/core/auth';
import type { Clock } from '@/core/kernel';
import type { Logger } from '@/core/logging';
import { toAppError } from './toAppError';

export interface InterceptorDependencies {
  readonly tokenStore: TokenStore;
  readonly logger: Logger;
  readonly now: Clock;
  readonly onUnauthorized?: () => void;
}

export function installInterceptors(instance: AxiosInstance, deps: InterceptorDependencies): void {
  const startedAt = new WeakMap<InternalAxiosRequestConfig, number>();
  const elapsedMs = (config: InternalAxiosRequestConfig | undefined): number | undefined => {
    const start = config === undefined ? undefined : startedAt.get(config);
    return start === undefined ? undefined : deps.now() - start;
  };

  instance.interceptors.request.use(async config => {
    const token = await deps.tokenStore.getAccessToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    startedAt.set(config, deps.now());
    return config;
  });

  instance.interceptors.response.use(
    response => {
      deps.logger.debug('HTTP response', {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        durationMs: elapsedMs(response.config),
      });
      return response;
    },
    async (error: unknown) => {
      const failure = toAppError(error);
      const config = axios.isAxiosError(error) ? error.config : undefined;
      deps.logger.warn('HTTP request failed', {
        kind: failure.kind,
        status: failure.status,
        method: config?.method?.toUpperCase(),
        url: config?.url,
        durationMs: elapsedMs(config),
      });
      if (failure.kind === 'unauthorized') {
        await deps.tokenStore.setAccessToken(null);
        deps.onUnauthorized?.();
      }
      throw failure;
    },
  );
}
