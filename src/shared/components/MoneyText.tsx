import { memo } from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import type { Paise } from '@/core/kernel';
import { formatINR, formatPercent, MISSING_VALUE } from '@/shared/format';
import { AppText, type TextTone } from './AppText';
import type { TypographyVariant } from '@/core/theme';

function toneForSign(value: number | null, colorBySign: boolean, fallback: TextTone): TextTone {
  if (value === null) {
    return 'muted';
  }
  if (!colorBySign || value === 0) {
    return fallback;
  }
  return value > 0 ? 'gain' : 'loss';
}

export interface MoneyTextProps {
  readonly value: Paise | null;
  readonly variant?: TypographyVariant;
  readonly tone?: TextTone;
  readonly colorBySign?: boolean;
  readonly signed?: boolean;
  readonly style?: StyleProp<TextStyle>;
  readonly testID?: string;
}

function MoneyTextComponent({
  value,
  variant = 'body',
  tone = 'primary',
  colorBySign = false,
  signed = false,
  style,
  testID,
}: MoneyTextProps) {
  const text =
    value === null ? MISSING_VALUE : `${signed && value > 0 ? '+' : ''}${formatINR(value)}`;
  return (
    <AppText
      numeric
      variant={variant}
      tone={toneForSign(value, colorBySign, tone)}
      style={style}
      testID={testID}>
      {text}
    </AppText>
  );
}

export const MoneyText = memo(MoneyTextComponent);

export interface PercentTextProps {
  readonly value: number | null;
  readonly variant?: TypographyVariant;
  readonly tone?: TextTone;
  readonly colorBySign?: boolean;
  readonly style?: StyleProp<TextStyle>;
}

function PercentTextComponent({
  value,
  variant = 'body',
  tone = 'primary',
  colorBySign = true,
  style,
}: PercentTextProps) {
  return (
    <AppText numeric variant={variant} tone={toneForSign(value, colorBySign, tone)} style={style}>
      {formatPercent(value)}
    </AppText>
  );
}

export const PercentText = memo(PercentTextComponent);
