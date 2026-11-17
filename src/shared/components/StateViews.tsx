import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createThemedStyles, useTheme } from '@/core/theme';
import { AppText } from './AppText';
import { Button } from './Button';

export interface LoadingStateProps {
  readonly label?: string;
}

export function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  const theme = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <AppText tone="secondary" style={styles.message}>
        {label}
      </AppText>
    </View>
  );
}

export interface ErrorStateProps {
  readonly title?: string;
  readonly message: string;
  readonly onRetry?: () => void;
  readonly retryLabel?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
}: ErrorStateProps) {
  const styles = useStyles();
  return (
    <View style={styles.container} accessibilityRole="alert">
      <AppText variant="heading" style={styles.title}>
        {title}
      </AppText>
      <AppText tone="secondary" style={styles.message}>
        {message}
      </AppText>
      {onRetry ? (
        <View style={styles.action}>
          <Button label={retryLabel} onPress={onRetry} testID="error-state-retry" />
        </View>
      ) : null}
    </View>
  );
}

export interface EmptyStateProps {
  readonly title: string;
  readonly message?: string;
  readonly action?: ReactNode;
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <AppText variant="heading" style={styles.title}>
        {title}
      </AppText>
      {message ? (
        <AppText tone="secondary" style={styles.message}>
          {message}
        </AppText>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    title: { textAlign: 'center' },
    message: { marginTop: theme.spacing.sm, textAlign: 'center' },
    action: { marginTop: theme.spacing.lg },
  }),
);
