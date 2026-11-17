import type { ZodType } from 'zod';
import { appError, err, ok, type Result } from '@/core/kernel';

export function parseResponse<T>(schema: ZodType<T>, data: unknown): Result<T> {
  const parsed = schema.safeParse(data);
  if (parsed.success) {
    return ok(parsed.data);
  }
  return err(
    appError('invalid-response', 'Response did not match the expected shape', {
      cause: parsed.error.issues,
    }),
  );
}
