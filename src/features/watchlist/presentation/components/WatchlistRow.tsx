import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { calculateDayChange, useMarketModule, useQuote } from '@/features/market';
import { createThemedStyles } from '@/core/theme';
import { AppText, MoneyText, PercentText, PriceFlash, SwipeToDelete } from '@/shared/components';

export const WATCHLIST_ROW_HEIGHT = 64;

export interface WatchlistRowProps {
  readonly symbol: string;
  readonly onPress: (symbol: string) => void;
  readonly onRemove: (symbol: string) => void;
}

function WatchlistRowComponent({ symbol, onPress, onRemove }: WatchlistRowProps) {
  const styles = useStyles();
  const { quoteStore } = useMarketModule();
  const quote = useQuote(quoteStore, symbol);
  const change = calculateDayChange(quote);

  const handlePress = useCallback(() => onPress(symbol), [onPress, symbol]);
  const handleRemove = useCallback(() => onRemove(symbol), [onRemove, symbol]);

  return (
    <SwipeToDelete onDelete={handleRemove} accessibilityLabel={`Remove ${symbol}`}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={symbol}
        onPress={handlePress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        testID={`watchlist-row-${symbol}`}>
        <AppText variant="bodyStrong" style={styles.symbol}>
          {symbol}
        </AppText>
        <PriceFlash value={quote?.ltp ?? null} style={styles.price}>
          <MoneyText value={quote?.ltp ?? null} variant="bodyStrong" />
        </PriceFlash>
        <View style={styles.change}>
          <MoneyText value={change.amount} variant="caption" colorBySign signed />
          <PercentText value={change.percent} variant="caption" />
        </View>
      </Pressable>
    </SwipeToDelete>
  );
}

export const WatchlistRow = memo(WatchlistRowComponent);

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      height: WATCHLIST_ROW_HEIGHT,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.background,
      borderBottomWidth: theme.sizes.hairline,
      borderBottomColor: theme.colors.border,
    },
    pressed: { backgroundColor: theme.colors.surfaceMuted },
    symbol: { flex: 1.2 },
    price: { flex: 1, alignItems: 'flex-end' },
    change: { flex: 1, alignItems: 'flex-end', gap: 2 },
  }),
);
