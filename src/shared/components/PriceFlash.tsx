import { memo, useEffect, useRef, type ReactNode } from 'react';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { createThemedStyles, useTheme } from '@/core/theme';

const FLASH_DURATION_MS = 420;

const FLASH_PEAK_OPACITY = 0.18;

export type FlashDirection = 'up' | 'down' | null;

export function flashDirection(previous: number | null, next: number | null): FlashDirection {
  if (previous === null || next === null || next === previous) {
    return null;
  }
  return next > previous ? 'up' : 'down';
}

export interface PriceFlashProps {
  readonly value: number | null;
  readonly children: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

function PriceFlashComponent({ value, children, style }: PriceFlashProps) {
  const theme = useTheme();
  const styles = useStyles();
  const up = useRef(new Animated.Value(0)).current;
  const down = useRef(new Animated.Value(0)).current;
  const previous = useRef<number | null>(null);

  useEffect(() => {
    const direction = flashDirection(previous.current, value);
    previous.current = value;
    if (direction === null) {
      return;
    }
    const overlay = direction === 'up' ? up : down;
    overlay.setValue(FLASH_PEAK_OPACITY);
    Animated.timing(overlay, {
      toValue: 0,
      duration: FLASH_DURATION_MS,
      useNativeDriver: true,
    }).start();
  }, [value, up, down]);

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.overlay, { backgroundColor: theme.colors.gain, opacity: up }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.overlay, { backgroundColor: theme.colors.loss, opacity: down }]}
      />
      {children}
    </View>
  );
}

export const PriceFlash = memo(PriceFlashComponent);

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.radii.sm,
      overflow: 'hidden',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: theme.radii.sm,
    },
  }),
);
