import { createMMKV } from 'react-native-mmkv';
import type { KeyValueStorage } from './KeyValueStorage';

export function createMmkvStorage(id: string): KeyValueStorage {
  const mmkv = createMMKV({ id });
  return {
    getString: key => mmkv.getString(key),
    setString: (key, value) => {
      mmkv.set(key, value);
    },
    remove: key => {
      mmkv.remove(key);
    },
  };
}
