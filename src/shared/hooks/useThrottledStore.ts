import { useEffect, useRef, useState } from 'react';
import type { StoreApi } from 'zustand/vanilla';

export function useThrottledStore<State, Selected>(
  store: StoreApi<State>,
  selector: (state: State) => Selected,
  intervalMs = 250,
  isEqual: (a: Selected, b: Selected) => boolean = Object.is,
): Selected {
  const selectorRef = useRef(selector);
  selectorRef.current = selector;
  const isEqualRef = useRef(isEqual);
  isEqualRef.current = isEqual;

  const [value, setValue] = useState(() => selector(store.getState()));
  const lastEmitRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const flush = (): void => {
      timerRef.current = null;
      lastEmitRef.current = Date.now();
      const next = selectorRef.current(store.getState());
      setValue(previous => (isEqualRef.current(previous, next) ? previous : next));
    };

    const unsubscribe = store.subscribe(() => {
      if (timerRef.current !== null) {
        return;
      }
      const elapsed = Date.now() - lastEmitRef.current;
      if (elapsed >= intervalMs) {
        flush();
      } else {
        timerRef.current = setTimeout(flush, intervalMs - elapsed);
      }
    });

    flush();
    return () => {
      unsubscribe();
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [store, intervalMs]);

  return value;
}
