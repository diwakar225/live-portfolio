import { palette, radii, sizes, spacing, typography } from './tokens';

export type ColorMode = 'light' | 'dark';

export interface ThemeColors {
  readonly background: string;
  readonly surface: string;
  readonly surfaceMuted: string;
  readonly border: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textMuted: string;
  readonly primary: string;
  readonly onPrimary: string;
  readonly gain: string;
  readonly gainSurface: string;
  readonly loss: string;
  readonly lossSurface: string;
  readonly warning: string;
  readonly warningSurface: string;
  readonly danger: string;
}

export interface AppTheme {
  readonly mode: ColorMode;
  readonly colors: ThemeColors;
  readonly spacing: typeof spacing;
  readonly radii: typeof radii;
  readonly sizes: typeof sizes;
  readonly typography: typeof typography;
}

const shared = { spacing, radii, sizes, typography } as const;

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    background: palette.slate50,
    surface: palette.white,
    surfaceMuted: palette.slate100,
    border: palette.slate200,
    textPrimary: palette.slate900,
    textSecondary: palette.slate600,
    textMuted: palette.slate400,
    primary: palette.indigo600,
    onPrimary: palette.white,
    gain: palette.green600,
    gainSurface: palette.green50,
    loss: palette.red600,
    lossSurface: palette.red50,
    warning: palette.amber700,
    warningSurface: palette.amber50,
    danger: palette.red600,
  },
  ...shared,
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    background: palette.slate950,
    surface: palette.slate900,
    surfaceMuted: palette.slate800,
    border: palette.slate700,
    textPrimary: palette.slate100,
    textSecondary: palette.slate300,
    textMuted: palette.slate500,
    primary: palette.indigo300,
    onPrimary: palette.slate950,
    gain: palette.green400,
    gainSurface: palette.green950,
    loss: palette.red400,
    lossSurface: palette.red950,
    warning: palette.amber400,
    warningSurface: palette.amber950,
    danger: palette.red400,
  },
  ...shared,
};
