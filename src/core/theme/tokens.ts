import type { TextStyle } from 'react-native';

export const palette = {
  white: '#FFFFFF',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  slate950: '#0B1120',
  indigo300: '#A5B4FC',
  indigo600: '#4F46E5',
  green400: '#4ADE80',
  green600: '#16A34A',
  green950: '#052E16',
  green50: '#F0FDF4',
  red400: '#F87171',
  red600: '#DC2626',
  red950: '#450A0A',
  red50: '#FEF2F2',
  amber400: '#FBBF24',
  amber700: '#B45309',
  amber950: '#451A03',
  amber50: '#FFFBEB',
} as const;

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
} as const;

export const sizes = {
  hairline: 1,
  hitSlop: 8,
  minTouchTarget: 44,
  rowMinHeight: 56,
  iconSm: 16,
  iconMd: 24,
  contentMaxWidth: 720,
} as const;

export const typography = {
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  heading: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 0.4 },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
