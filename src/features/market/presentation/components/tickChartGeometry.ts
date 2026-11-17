export interface ChartPadding {
  readonly top: number;
  readonly bottom: number;
  readonly right: number;
}

export interface ChartGeometry {
  readonly linePath: string;
  readonly areaPath: string;
  readonly baselineY: number | null;
  readonly lastPoint: { readonly x: number; readonly y: number };
  readonly isUp: boolean;
}

const MIN_POINTS = 2;

const RANGE_PADDING_RATIO = 0.12;

export function buildChartGeometry(
  points: readonly number[],
  baseline: number | null,
  width: number,
  height: number,
  padding: ChartPadding,
): ChartGeometry | null {
  if (width <= 0 || height <= 0 || points.length < MIN_POINTS) {
    return null;
  }

  const values = baseline === null ? points : [...points, baseline];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const pad = range === 0 ? Math.max(1, Math.abs(max) * 0.001) : range * RANGE_PADDING_RATIO;
  const low = min - pad;
  const span = max + pad - low;

  const plotWidth = Math.max(1, width - padding.right);
  const plotHeight = Math.max(1, height - padding.top - padding.bottom);
  const toX = (index: number): number => (index / (points.length - 1)) * plotWidth;
  const toY = (value: number): number =>
    padding.top + plotHeight - ((value - low) / span) * plotHeight;

  const round = (value: number): number => Math.round(value * 100) / 100;

  const linePath = points
    .map((value, index) => `${index === 0 ? 'M' : 'L'}${round(toX(index))},${round(toY(value))}`)
    .join(' ');

  const floor = round(height - padding.bottom);
  const areaPath = `${linePath} L${round(toX(points.length - 1))},${floor} L${round(
    toX(0),
  )},${floor} Z`;

  const lastValue = points[points.length - 1] as number;
  const reference = baseline ?? (points[0] as number);

  return {
    linePath,
    areaPath,
    baselineY: baseline === null ? null : round(toY(baseline)),
    lastPoint: { x: round(toX(points.length - 1)), y: round(toY(lastValue)) },
    isUp: lastValue >= reference,
  };
}
