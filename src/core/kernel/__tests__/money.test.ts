import { paise, rupeesToPaise } from '../money';

describe('rupeesToPaise', () => {
  it('converts API rupee values to exact integer paise', () => {
    expect(rupeesToPaise(1164.9)).toBe(116490);
    expect(rupeesToPaise(13017.25)).toBe(1301725);
    expect(rupeesToPaise(0.1 + 0.2)).toBe(30);
  });

  it('returns null for values that are not real numbers', () => {
    expect(rupeesToPaise(Number.NaN)).toBeNull();
    expect(rupeesToPaise(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe('paise', () => {
  it('rejects fractional paise', () => {
    expect(() => paise(10.5)).toThrow(RangeError);
    expect(paise(1050)).toBe(1050);
  });
});
