import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { createThemedStyles } from '@/core/theme';
import { AppText, SearchField, SegmentedControl } from '@/shared/components';
import { SORT_OPTIONS, type SortKey } from '../viewmodels/usePortfolioViewModel';

export interface PortfolioToolbarProps {
  readonly sortKey: SortKey;
  readonly onSortChange: (key: SortKey) => void;
  readonly query: string;
  readonly onQueryChange: (query: string) => void;
}

function PortfolioToolbarComponent({
  sortKey,
  onSortChange,
  query,
  onQueryChange,
}: PortfolioToolbarProps) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <SearchField
        value={query}
        onChangeText={onQueryChange}
        placeholder="Filter by symbol"
        testID="portfolio-filter"
      />
      <View style={styles.sortRow}>
        <AppText variant="label" tone="muted" style={styles.sortLabel}>
          SORT
        </AppText>
        <View style={styles.sortControl}>
          <SegmentedControl
            options={SORT_OPTIONS}
            value={sortKey}
            onChange={onSortChange}
            testID="portfolio-sort"
          />
        </View>
      </View>
    </View>
  );
}

export const PortfolioToolbar = memo(PortfolioToolbarComponent);

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: { gap: theme.spacing.md },
    sortRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    sortLabel: { width: 40 },
    sortControl: { flex: 1 },
  }),
);
