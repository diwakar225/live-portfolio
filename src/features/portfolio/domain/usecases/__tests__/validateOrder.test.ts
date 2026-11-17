import { validateOrder } from '../validateOrder';

const buy = { side: 'buy', heldQuantity: 0, hasLivePrice: true } as const;
const sell = { side: 'sell', heldQuantity: 10, hasLivePrice: true } as const;

const messageOf = (raw: string, context: Parameters<typeof validateOrder>[1]): string => {
  const result = validateOrder(raw, context);
  return result.ok ? '' : result.error.message;
};

describe('validateOrder', () => {
  it('accepts a whole number above zero', () => {
    const result = validateOrder('25', buy);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(25);
    }
  });

  it('trims surrounding whitespace', () => {
    const result = validateOrder('  7  ', buy);
    expect(result.ok && result.value).toBe(7);
  });

  it('asks for a quantity when the field is empty', () => {
    expect(messageOf('', buy)).toMatch(/Enter a quantity/);
    expect(messageOf('   ', buy)).toMatch(/Enter a quantity/);
  });

  it('rejects anything that is not a whole number', () => {
    for (const raw of ['1.5', '-2', '1e3', '2 5', 'ten', '٣', '+4']) {
      expect(messageOf(raw, buy)).toMatch(/whole number/);
    }
  });

  it('rejects zero', () => {
    expect(messageOf('0', buy)).toMatch(/greater than zero/);
  });

  it('will not sell more than is held', () => {
    expect(messageOf('11', sell)).toMatch(/only 10 shares/);
    expect(validateOrder('10', sell).ok).toBe(true);
  });

  it('uses the singular when exactly one share is held', () => {
    expect(messageOf('2', { side: 'sell', heldQuantity: 1, hasLivePrice: true })).toMatch(
      /only 1 share\./,
    );
  });

  it('says so when the stock is not held at all', () => {
    expect(messageOf('1', { side: 'sell', heldQuantity: 0, hasLivePrice: true })).toMatch(
      /do not hold/,
    );
  });

  it('blocks any order when there is no live price to fill at', () => {
    expect(messageOf('5', { side: 'buy', heldQuantity: 0, hasLivePrice: false })).toMatch(
      /No live price/,
    );
  });

  it('rejects a quantity too large to be exact', () => {
    expect(messageOf('99999999999999999999', buy)).toMatch(/too large/);
  });
});
