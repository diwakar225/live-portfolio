import { useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, type ListRenderItemInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PausedBanner, useMarketModule } from '@/features/market';
import { createThemedStyles } from '@/core/theme';
import { EmptyState, ErrorState, LoadingState, Screen } from '@/shared/components';
import { HOLDING_ROW_HEIGHT, HoldingRow } from '../components/HoldingRow';
import { PortfolioToolbar } from '../components/PortfolioToolbar';
import { SummaryCard } from '../components/SummaryCard';
import { usePortfolioModule } from '../PortfolioModuleContext';
import { usePortfolioViewModel } from '../viewmodels/usePortfolioViewModel';

const keyExtractor = (symbol: string): string => symbol;

const getItemLayout = (
  _data: ArrayLike<string> | null | undefined,
  index: number,
): { length: number; offset: number; index: number } => ({
  length: HOLDING_ROW_HEIGHT,
  offset: HOLDING_ROW_HEIGHT * index,
  index,
});

export function PortfolioScreen() {
  const styles = useStyles();
  const navigation = useNavigation();
  const market = useMarketModule();
  const portfolio = usePortfolioModule();

  const viewModel = usePortfolioViewModel({
    holdingsStore: portfolio.holdingsStore,
    quoteStore: market.quoteStore,
    marketStatusStore: market.marketStatusStore,
    marketData: market.data,
  });

  const handleRowPress = useCallback(
    (symbol: string) => {
      navigation.navigate('StockDetail', { symbol });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<string>) => <HoldingRow symbol={item} onPress={handleRowPress} />,
    [handleRowPress],
  );

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <SummaryCard summary={viewModel.summary} />
        <PortfolioToolbar
          sortKey={viewModel.sortKey}
          onSortChange={viewModel.setSortKey}
          query={viewModel.query}
          onQueryChange={viewModel.setQuery}
        />
      </View>
    ),
    [
      styles.header,
      viewModel.summary,
      viewModel.sortKey,
      viewModel.setSortKey,
      viewModel.query,
      viewModel.setQuery,
    ],
  );

  const empty = useMemo(
    () =>
      viewModel.totalCount === 0 ? (
        <EmptyState
          title="No holdings yet"
          message="Buy a stock from its detail screen and it will appear here."
        />
      ) : (
        <EmptyState
          title="No matches"
          message={`No holding matches “${viewModel.query.trim()}”.`}
        />
      ),
    [viewModel.totalCount, viewModel.query],
  );

  if (viewModel.phase === 'loading') {
    return (
      <Screen testID="portfolio-screen">
        <LoadingState label="Loading prices…" />
      </Screen>
    );
  }

  if (viewModel.phase === 'error') {
    return (
      <Screen testID="portfolio-screen">
        <ErrorState
          title="Could not load prices"
          message={viewModel.message ?? 'Something went wrong.'}
          onRetry={viewModel.retry}
        />
      </Screen>
    );
  }

  return (
    <Screen testID="portfolio-screen">
      <PausedBanner store={market.feedStatusStore} />
      <FlatList
        data={viewModel.visibleSymbols}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        maxToRenderPerBatch={8}
        windowSize={9}
        removeClippedSubviews
        refreshControl={
          <RefreshControl refreshing={viewModel.isRefreshing} onRefresh={viewModel.refresh} />
        }
      />
    </Screen>
  );
}

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    header: { padding: theme.spacing.lg, gap: theme.spacing.lg },
    content: { paddingBottom: theme.spacing.xxl, flexGrow: 1 },
  }),
);
