import { memo, useCallback, useEffect, useId, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';
import { createThemedStyles, useTheme } from '@/core/theme';
import { AppText } from '@/shared/components';
import { buildChartGeometry, type ChartPadding } from './tickChartGeometry';

export interface TickChartProps {
  readonly points: readonly number[];
  readonly baseline?: number | null;
  readonly height?: number;
}

const PADDING: ChartPadding = { top: 14, bottom: 14, right: 10 };

const MARKER_SIZE = 6;
const MARKER_BOX = 24;
const PULSE_DURATION_MS = 1_600;

function TickChartComponent({ points, baseline = null, height = 128 }: TickChartProps) {
  const theme = useTheme();
  const styles = useStyles();
  const [width, setWidth] = useState(0);
  const gradientId = `tickFill${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  }, []);

  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: PULSE_DURATION_MS,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const geometry = buildChartGeometry(points, baseline, width, height, PADDING);
  const color = geometry?.isUp === false ? theme.colors.loss : theme.colors.gain;

  return (
    <View onLayout={handleLayout} style={[styles.container, { height }]}>
      {geometry === null ? (
        <View style={styles.placeholder}>
          <AppText variant="caption" tone="muted">
            Waiting for ticks…
          </AppText>
        </View>
      ) : (
        <>
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity={0.26} />
                <Stop offset="1" stopColor={color} stopOpacity={0.01} />
              </LinearGradient>
            </Defs>

            <Path d={geometry.areaPath} fill={`url(#${gradientId})`} />

            {geometry.baselineY === null ? null : (
              <Line
                x1={0}
                y1={geometry.baselineY}
                x2={width}
                y2={geometry.baselineY}
                stroke={theme.colors.textMuted}
                strokeWidth={1}
                strokeDasharray="3 4"
                opacity={0.55}
              />
            )}

            <Path
              d={geometry.linePath}
              fill="none"
              stroke={color}
              strokeWidth={1.8}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </Svg>

          <View
            pointerEvents="none"
            style={[
              styles.marker,
              {
                left: geometry.lastPoint.x - MARKER_BOX / 2,
                top: geometry.lastPoint.y - MARKER_BOX / 2,
              },
            ]}>
            <Animated.View
              style={[
                styles.halo,
                {
                  backgroundColor: color,
                  opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
                  transform: [
                    { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 2.6] }) },
                  ],
                },
              ]}
            />
            <View style={[styles.dot, { backgroundColor: color }]} />
          </View>
        </>
      )}
    </View>
  );
}

export const TickChart = memo(TickChartComponent);

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      width: '100%',
      borderRadius: theme.radii.md,
      overflow: 'hidden',
      backgroundColor: theme.colors.surfaceMuted,
    },
    placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    marker: {
      position: 'absolute',
      width: MARKER_BOX,
      height: MARKER_BOX,
      alignItems: 'center',
      justifyContent: 'center',
    },
    halo: {
      position: 'absolute',
      width: MARKER_SIZE,
      height: MARKER_SIZE,
      borderRadius: MARKER_SIZE / 2,
    },
    dot: {
      width: MARKER_SIZE,
      height: MARKER_SIZE,
      borderRadius: MARKER_SIZE / 2,
      borderWidth: 1.5,
      borderColor: theme.colors.surface,
    },
  }),
);
