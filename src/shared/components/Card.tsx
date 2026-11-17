import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { createThemedStyles } from '@/core/theme';

export interface CardProps {
  readonly children: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export function Card({ children, style, testID }: CardProps) {
  const styles = useStyles();
  return (
    <View style={[styles.card, style]} testID={testID}>
      {children}
    </View>
  );
}

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      borderWidth: theme.sizes.hairline,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
    },
  }),
);
