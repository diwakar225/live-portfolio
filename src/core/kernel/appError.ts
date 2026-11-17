export type AppErrorKind =
  | 'network'
  | 'timeout'
  | 'http'
  | 'unauthorized'
  | 'cancelled'
  | 'invalid-response'
  | 'validation'
  | 'unknown';

const APP_ERROR_KINDS: ReadonlySet<string> = new Set<AppErrorKind>([
  'network',
  'timeout',
  'http',
  'unauthorized',
  'cancelled',
  'invalid-response',
  'validation',
  'unknown',
]);

export interface AppError {
  readonly kind: AppErrorKind;
  readonly message: string;
  readonly status?: number;
  readonly cause?: unknown;
}

export interface AppErrorDetails {
  readonly status?: number;
  readonly cause?: unknown;
}

export function appError(
  kind: AppErrorKind,
  message: string,
  details: AppErrorDetails = {},
): AppError {
  return { kind, message, ...details };
}

export function isAppError(value: unknown): value is AppError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as { kind?: unknown; message?: unknown };
  return (
    typeof candidate.kind === 'string' &&
    APP_ERROR_KINDS.has(candidate.kind) &&
    typeof candidate.message === 'string'
  );
}
