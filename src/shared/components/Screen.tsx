import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { createThemedStyles } from '@/core/theme';

const DEFAULT_EDGES: readonly Edge[] = ['left', 'right', 'bottom'];

export interface ScreenProps {
  readonly children: ReactNode;
  readonly edges?: readonly Edge[];
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export function Screen({ children, edges = DEFAULT_EDGES, style, testID }: ScreenProps) {
  const styles = useStyles();
  return (
    <SafeAreaView edges={edges} style={[styles.root, style]} testID={testID}>
      {children}
    </SafeAreaView>
  );
}

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.background },
  }),
);
