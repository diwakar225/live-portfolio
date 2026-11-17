import { memo } from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';
import { useTheme, type ThemeColors, type TypographyVariant } from '@/core/theme';

export type TextTone =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'accent'
  | 'onPrimary'
  | 'gain'
  | 'loss'
  | 'warning'
  | 'danger';

const TONE_TO_COLOR: Readonly<Record<TextTone, keyof ThemeColors>> = {
  primary: 'textPrimary',
  secondary: 'textSecondary',
  muted: 'textMuted',
  accent: 'primary',
  onPrimary: 'onPrimary',
  gain: 'gain',
  loss: 'loss',
  warning: 'warning',
  danger: 'danger',
};

export interface AppTextProps extends TextProps {
  readonly variant?: TypographyVariant;
  readonly tone?: TextTone;
  readonly numeric?: boolean;
}

function AppTextComponent({
  variant = 'body',
  tone = 'primary',
  numeric = false,
  style,
  ...rest
}: AppTextProps) {
  const theme = useTheme();
  const color = theme.colors[TONE_TO_COLOR[tone]];
  return (
    <Text
      {...rest}
      style={[theme.typography[variant], { color }, numeric && styles.numeric, style]}
    />
  );
}

export const AppText = memo(AppTextComponent);

const styles = StyleSheet.create({
  numeric: { fontVariant: ['tabular-nums'] },
});
