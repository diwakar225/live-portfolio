import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'compact' | 'medium' | 'expanded';

export function getBreakpoint(width: number): Breakpoint {
  if (width < 600) {
    return 'compact';
  }
  return width < 840 ? 'medium' : 'expanded';
}

export interface ResponsiveInfo {
  readonly width: number;
  readonly height: number;
  readonly fontScale: number;
  readonly breakpoint: Breakpoint;
  readonly isLandscape: boolean;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height, fontScale } = useWindowDimensions();
  return useMemo(
    () => ({
      width,
      height,
      fontScale,
      breakpoint: getBreakpoint(width),
      isLandscape: width > height,
    }),
    [width, height, fontScale],
  );
}
