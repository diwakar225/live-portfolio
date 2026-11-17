import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { createThemedStyles } from '@/core/theme';
import { AppText } from './AppText';

export interface SegmentOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

export interface SegmentedControlProps<T extends string> {
  readonly options: readonly SegmentOption<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly testID?: string;
}

interface SegmentProps<T extends string> {
  readonly option: SegmentOption<T>;
  readonly selected: boolean;
  readonly onChange: (value: T) => void;
}

function Segment<T extends string>({ option, selected, onChange }: SegmentProps<T>) {
  const styles = useStyles();
  const handlePress = useCallback(() => onChange(option.value), [onChange, option.value]);
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={handlePress}
      style={[styles.segment, selected && styles.segmentSelected]}
      testID={`segment-${option.value}`}>
      <AppText variant="caption" tone={selected ? 'onPrimary' : 'secondary'}>
        {option.label}
      </AppText>
    </Pressable>
  );
}

function SegmentedControlComponent<T extends string>({
  options,
  value,
  onChange,
  testID,
}: SegmentedControlProps<T>) {
  const styles = useStyles();
  return (
    <View style={styles.container} testID={testID}>
      {options.map(option => (
        <Segment
          key={option.value}
          option={option}
          selected={option.value === value}
          onChange={onChange}
        />
      ))}
    </View>
  );
}

export const SegmentedControl = memo(SegmentedControlComponent) as typeof SegmentedControlComponent;

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: theme.radii.pill,
      padding: theme.spacing.xxs,
    },
    segment: {
      flex: 1,
      minHeight: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radii.pill,
      paddingHorizontal: theme.spacing.sm,
    },
    segmentSelected: { backgroundColor: theme.colors.primary },
  }),
);
