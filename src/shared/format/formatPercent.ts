import { MISSING_VALUE } from './formatMoney';

export function formatPercent(value: number | null | undefined, fractionDigits = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return MISSING_VALUE;
  }
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(fractionDigits)}%`;
}

export function formatVolume(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return MISSING_VALUE;
  }
  const absolute = Math.abs(value);
  if (absolute >= 10_000_000) {
    return `${(value / 10_000_000).toFixed(2)} Cr`;
  }
  if (absolute >= 100_000) {
    return `${(value / 100_000).toFixed(2)} L`;
  }
  if (absolute >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return String(Math.round(value));
}
