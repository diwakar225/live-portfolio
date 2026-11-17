declare const paiseBrand: unique symbol;

export type Paise = number & { readonly [paiseBrand]: 'Paise' };

export function rupeesToPaise(rupees: number): Paise | null {
  if (!Number.isFinite(rupees)) {
    return null;
  }
  return Math.round(rupees * 100) as Paise;
}

export function paise(value: number): Paise {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`Expected an integer number of paise, received ${value}`);
  }
  return value as Paise;
}
