import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { createThemedStyles, useTheme } from '@/core/theme';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: ButtonVariant;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly testID?: string;
}

function ButtonComponent({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const styles = useStyles();
  const isDisabled = disabled || loading;
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={theme.sizes.hitSlop}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.colors.onPrimary : theme.colors.primary} />
      ) : (
        <AppText variant="bodyStrong" tone={isPrimary ? 'onPrimary' : 'accent'}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

export const Button = memo(ButtonComponent);

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    base: {
      minHeight: theme.sizes.minTouchTarget,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.radii.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primary: { backgroundColor: theme.colors.primary },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: theme.sizes.hairline,
      borderColor: theme.colors.border,
    },
    pressed: { opacity: 0.85 },
    disabled: { opacity: 0.5 },
  }),
);
