import { buildChartGeometry, type ChartPadding } from '../tickChartGeometry';

const PADDING: ChartPadding = { top: 14, bottom: 14, right: 8 };
const WIDTH = 308;
const HEIGHT = 128;

const build = (points: readonly number[], baseline: number | null = null) =>
  buildChartGeometry(points, baseline, WIDTH, HEIGHT, PADDING);

describe('buildChartGeometry', () => {
  it('needs at least two points', () => {
    expect(build([])).toBeNull();
    expect(build([100])).toBeNull();
    expect(build([100, 101])).not.toBeNull();
  });

  it('needs a measured width', () => {
    expect(buildChartGeometry([1, 2], null, 0, HEIGHT, PADDING)).toBeNull();
  });

  it('colours against the previous close, not the first tick on screen', () => {
    const geometry = build([90, 92, 95, 98], 100);
    expect(geometry?.isUp).toBe(false);
  });

  it('is up when the latest price is above the previous close', () => {
    expect(build([101, 99, 103], 100)?.isUp).toBe(true);
  });

  it('treats sitting exactly on the previous close as up', () => {
    expect(build([98, 100], 100)?.isUp).toBe(true);
  });

  it('falls back to the first tick when there is no previous close', () => {
    expect(build([100, 90])?.isUp).toBe(false);
    expect(build([90, 100])?.isUp).toBe(true);
  });

  it('keeps the previous close inside the drawn range', () => {
    const geometry = build([10, 11, 12], 50);
    expect(geometry?.baselineY).not.toBeNull();
    expect(geometry!.baselineY!).toBeGreaterThanOrEqual(0);
    expect(geometry!.baselineY!).toBeLessThanOrEqual(HEIGHT);
  });

  it('puts the last point at the right edge of the plot', () => {
    const geometry = build([1, 2, 3], 2);
    expect(geometry?.lastPoint.x).toBeCloseTo(WIDTH - PADDING.right, 5);
  });

  it('starts the line at the left edge', () => {
    expect(build([1, 2, 3], 2)?.linePath.startsWith('M0,')).toBe(true);
  });

  it('produces one command per point', () => {
    const geometry = build([1, 2, 3, 4, 5], 3);
    expect(geometry?.linePath.match(/[ML]/g)).toHaveLength(5);
  });

  it('closes the area path back to the baseline of the plot', () => {
    const geometry = build([1, 2, 3], 2);
    expect(geometry?.areaPath.endsWith('Z')).toBe(true);
    expect(geometry?.areaPath.startsWith(geometry.linePath)).toBe(true);
  });

  it('never emits NaN for a perfectly flat series', () => {
    const geometry = build([500, 500, 500], 500);
    expect(geometry?.linePath).not.toMatch(/NaN/);
    expect(geometry?.areaPath).not.toMatch(/NaN/);
    expect(geometry?.baselineY).not.toBeNaN();
  });

  it('keeps every drawn y inside the chart', () => {
    const geometry = build([100, 250, 50, 175], 120);
    const ys = [...geometry!.linePath.matchAll(/[ML][\d.]+,([\d.]+)/g)].map(m => Number(m[1]));
    for (const y of ys) {
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(HEIGHT);
    }
  });
});
