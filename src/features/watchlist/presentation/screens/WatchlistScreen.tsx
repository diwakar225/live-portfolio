import { useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, type ListRenderItemInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PausedBanner, useMarketModule } from '@/features/market';
import { createThemedStyles } from '@/core/theme';
import { AppText, Button, EmptyState, ErrorState, LoadingState, Screen } from '@/shared/components';
import { SymbolPicker } from '../components/SymbolPicker';
import { WATCHLIST_ROW_HEIGHT, WatchlistRow } from '../components/WatchlistRow';
import { useWatchlistViewModel } from '../viewmodels/useWatchlistViewModel';

const keyExtractor = (symbol: string): string => symbol;

const getItemLayout = (
  _data: ArrayLike<string> | null | undefined,
  index: number,
): { length: number; offset: number; index: number } => ({
  length: WATCHLIST_ROW_HEIGHT,
  offset: WATCHLIST_ROW_HEIGHT * index,
  index,
});

export function WatchlistScreen() {
  const styles = useStyles();
  const navigation = useNavigation();
  const market = useMarketModule();
  const viewModel = useWatchlistViewModel({
    marketStatusStore: market.marketStatusStore,
    marketData: market.data,
  });

  const handlePress = useCallback(
    (symbol: string) => {
      navigation.navigate('StockDetail', { symbol });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<string>) => (
      <WatchlistRow symbol={item} onPress={handlePress} onRemove={viewModel.remove} />
    ),
    [handlePress, viewModel.remove],
  );

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <AppText variant="caption" tone="secondary">
            {viewModel.symbols.length === 0
              ? 'Swipe a row left to remove it.'
              : `${viewModel.symbols.length} ${
                  viewModel.symbols.length === 1 ? 'symbol' : 'symbols'
                } · swipe left to remove`}
          </AppText>
          <Button label="Add" onPress={viewModel.openPicker} testID="watchlist-add" />
        </View>
        {viewModel.error === null ? null : (
          <AppText variant="caption" tone="danger" testID="watchlist-error">
            {viewModel.error}
          </AppText>
        )}
      </View>
    ),
    [
      styles.header,
      styles.headerRow,
      viewModel.symbols.length,
      viewModel.openPicker,
      viewModel.error,
    ],
  );

  if (viewModel.phase === 'loading') {
    return (
      <Screen testID="watchlist-screen">
        <LoadingState label="Loading prices…" />
      </Screen>
    );
  }

  if (viewModel.phase === 'error') {
    return (
      <Screen testID="watchlist-screen">
        <ErrorState
          title="Could not load prices"
          message={viewModel.message ?? 'Something went wrong.'}
          onRetry={viewModel.retry}
        />
      </Screen>
    );
  }

  return (
    <Screen testID="watchlist-screen">
      <PausedBanner store={market.feedStatusStore} />
      <FlatList
        data={viewModel.symbols}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            title="Your watchlist is empty"
            message="Add a symbol to follow its price without holding it."
            action={<Button label="Add a symbol" onPress={viewModel.openPicker} />}
          />
        }
        contentContainerStyle={styles.content}
        initialNumToRender={12}
        maxToRenderPerBatch={8}
        windowSize={9}
        removeClippedSubviews
        refreshControl={
          <RefreshControl refreshing={viewModel.isRefreshing} onRefresh={viewModel.refresh} />
        }
      />
      <SymbolPicker
        visible={viewModel.isPickerOpen}
        symbols={viewModel.available}
        onSelect={viewModel.add}
        onClose={viewModel.closePicker}
      />
    </Screen>
  );
}

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    header: { padding: theme.spacing.lg, gap: theme.spacing.sm },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    content: { paddingBottom: theme.spacing.xxl, flexGrow: 1 },
  }),
);
