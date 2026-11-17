import type { KeyValueStorage } from './KeyValueStorage';

export function createMemoryStorage(
  initial: Readonly<Record<string, string>> = {},
): KeyValueStorage {
  const values = new Map<string, string>(Object.entries(initial));
  return {
    getString: key => values.get(key),
    setString: (key, value) => {
      values.set(key, value);
    },
    remove: key => {
      values.delete(key);
    },
  };
}
