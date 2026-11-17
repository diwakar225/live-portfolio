import type { Paise } from '@/core/kernel';

export const MISSING_VALUE = '--';

export function groupIndianDigits(digits: string): string {
  if (digits.length <= 3) {
    return digits;
  }
  const lastThree = digits.slice(-3);
  let rest = digits.slice(0, -3);
  const groups: string[] = [];
  while (rest.length > 2) {
    groups.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest.length > 0) {
    groups.unshift(rest);
  }
  return `${groups.join(',')},${lastThree}`;
}

export function formatINR(value: Paise | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return MISSING_VALUE;
  }
  const absolute = Math.abs(Math.round(value));
  const rupees = Math.trunc(absolute / 100);
  const fraction = absolute % 100;
  const sign = value < 0 && absolute !== 0 ? '-' : '';
  return `${sign}₹${groupIndianDigits(String(rupees))}.${String(fraction).padStart(2, '0')}`;
}
