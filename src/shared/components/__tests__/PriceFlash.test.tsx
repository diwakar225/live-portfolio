import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { flashDirection, PriceFlash } from '../PriceFlash';

describe('flashDirection', () => {
  it('flashes up when the price rises and down when it falls', () => {
    expect(flashDirection(100, 101)).toBe('up');
    expect(flashDirection(101, 100)).toBe('down');
  });

  it('does not flash on the first value seen', () => {
    expect(flashDirection(null, 100)).toBeNull();
  });

  it('does not flash when the price is unchanged', () => {
    expect(flashDirection(100, 100)).toBeNull();
  });

  it('does not flash when a price becomes unavailable', () => {
    expect(flashDirection(100, null)).toBeNull();
    expect(flashDirection(null, null)).toBeNull();
  });

  it('flashes on the smallest possible move', () => {
    expect(flashDirection(10_000, 10_001)).toBe('up');
    expect(flashDirection(10_000, 9_999)).toBe('down');
  });
});

describe('PriceFlash', () => {
  it('renders its children', async () => {
    await render(
      <PriceFlash value={100}>
        <Text>₹1.00</Text>
      </PriceFlash>,
    );

    expect(screen.getByText('₹1.00')).toBeTruthy();
  });

  it('does not re-render itself when the value changes', async () => {
    let renders = 0;
    function Probe({ value }: { readonly value: number }) {
      renders += 1;
      return (
        <PriceFlash value={value}>
          <Text>{String(value)}</Text>
        </PriceFlash>
      );
    }

    const { rerender } = await render(<Probe value={100} />);
    const afterMount = renders;

    await rerender(<Probe value={101} />);

    expect(renders).toBe(afterMount + 1);
    expect(screen.getByText('101')).toBeTruthy();
  });
});
