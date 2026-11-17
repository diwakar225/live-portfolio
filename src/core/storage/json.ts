import type { ZodType } from 'zod';
import type { KeyValueStorage } from './KeyValueStorage';

export function readJson<T>(
  storage: KeyValueStorage,
  key: string,
  schema: ZodType<T>,
): T | undefined {
  const raw = storage.getString(key);
  if (raw === undefined) {
    return undefined;
  }
  try {
    const json: unknown = JSON.parse(raw);
    const parsed = schema.safeParse(json);
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

export function writeJson(storage: KeyValueStorage, key: string, value: unknown): void {
  storage.setString(key, JSON.stringify(value));
}
