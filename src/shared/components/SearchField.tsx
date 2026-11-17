import { memo } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { createThemedStyles, useTheme } from '@/core/theme';

export interface SearchFieldProps {
  readonly value: string;
  readonly onChangeText: (value: string) => void;
  readonly placeholder?: string;
  readonly testID?: string;
}

function SearchFieldComponent({
  value,
  onChangeText,
  placeholder = 'Search',
  testID,
}: SearchFieldProps) {
  const theme = useTheme();
  const styles = useStyles();
  return (
    <TextInput
      accessibilityLabel={placeholder}
      autoCapitalize="characters"
      autoCorrect={false}
      clearButtonMode="while-editing"
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textMuted}
      returnKeyType="search"
      style={styles.input}
      testID={testID}
      value={value}
    />
  );
}

export const SearchField = memo(SearchFieldComponent);

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    input: {
      minHeight: theme.sizes.minTouchTarget,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radii.md,
      borderWidth: theme.sizes.hairline,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      color: theme.colors.textPrimary,
      ...theme.typography.body,
    },
  }),
);
