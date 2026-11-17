import { useEffect, useState } from 'react';
import type { Paise } from '@/core/kernel';

const DEFAULT_LIMIT = 120;

export function useTickHistory(ltp: Paise | null, limit = DEFAULT_LIMIT): readonly number[] {
  const [points, setPoints] = useState<readonly number[]>([]);

  useEffect(() => {
    if (ltp === null) {
      return;
    }
    setPoints(previous => {
      const next =
        previous.length >= limit ? previous.slice(previous.length - limit + 1) : [...previous];
      next.push(ltp);
      return next;
    });
  }, [ltp, limit]);

  return points;
}
