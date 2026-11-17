import { paise } from '@/core/kernel';
import { formatINR, groupIndianDigits, MISSING_VALUE } from '../formatMoney';

describe('groupIndianDigits', () => {
  it.each([
    ['0', '0'],
    ['999', '999'],
    ['1000', '1,000'],
    ['100000', '1,00,000'],
    ['1234567', '12,34,567'],
    ['123456789', '12,34,56,789'],
  ])('groups %s as %s', (input, expected) => {
    expect(groupIndianDigits(input)).toBe(expected);
  });
});

describe('formatINR', () => {
  it('formats paise with Indian grouping and two decimals', () => {
    expect(formatINR(paise(123456789))).toBe('₹12,34,567.89');
    expect(formatINR(paise(116490))).toBe('₹1,164.90');
    expect(formatINR(paise(5))).toBe('₹0.05');
    expect(formatINR(paise(0))).toBe('₹0.00');
  });

  it('puts the sign before the currency symbol', () => {
    expect(formatINR(paise(-150050))).toBe('-₹1,500.50');
  });

  it('shows the missing marker instead of inventing a value', () => {
    expect(formatINR(null)).toBe(MISSING_VALUE);
    expect(formatINR(undefined)).toBe(MISSING_VALUE);
  });
});
