import type { Result } from '@/core/kernel';

export interface RequestOptions {
  readonly headers?: Readonly<Record<string, string>>;
  readonly params?: Readonly<Record<string, string | number | boolean>>;
  readonly timeoutMs?: number;
}

export interface HttpClient {
  get(path: string, options?: RequestOptions): Promise<Result<unknown>>;
  post(path: string, body: unknown, options?: RequestOptions): Promise<Result<unknown>>;
}
