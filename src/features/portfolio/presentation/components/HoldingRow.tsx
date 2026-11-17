import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useMarketModule, useQuote } from '@/features/market';
import { createThemedStyles } from '@/core/theme';
import { AppText, MoneyText, PercentText, PriceFlash } from '@/shared/components';
import { formatINR } from '@/shared/format';
import { calculatePosition } from '../../domain/usecases/calculatePosition';
import { usePortfolioModule } from '../PortfolioModuleContext';
import { useHolding } from '../store/holdingsStore';

export const HOLDING_ROW_HEIGHT = 64;

export interface HoldingRowProps {
  readonly symbol: string;
  readonly onPress: (symbol: string) => void;
}

function HoldingRowComponent({ symbol, onPress }: HoldingRowProps) {
  const styles = useStyles();
  const { quoteStore } = useMarketModule();
  const { holdingsStore } = usePortfolioModule();
  const quote = useQuote(quoteStore, symbol);
  const holding = useHolding(holdingsStore, symbol);
  const handlePress = useCallback(() => onPress(symbol), [onPress, symbol]);

  if (holding === undefined) {
    return null;
  }
  const position = calculatePosition(holding, quote);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${symbol}, ${position.quantity} shares`}
      onPress={handlePress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      testID={`holding-row-${symbol}`}>
      <View style={styles.left}>
        <AppText variant="bodyStrong">{symbol}</AppText>
        <AppText variant="caption" tone="secondary" numeric>
          {`${position.quantity} @ ${formatINR(position.averagePrice)}`}
        </AppText>
      </View>

      <PriceFlash value={position.lastPrice} style={styles.price}>
        <MoneyText value={position.lastPrice} variant="bodyStrong" />
      </PriceFlash>

      <View style={styles.right}>
        <MoneyText value={position.totalPnl} variant="bodyStrong" colorBySign signed />
        <PercentText value={position.totalPnlPercent} variant="caption" />
      </View>
    </Pressable>
  );
}

export const HoldingRow = memo(HoldingRowComponent);

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      height: HOLDING_ROW_HEIGHT,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.background,
      borderBottomWidth: theme.sizes.hairline,
      borderBottomColor: theme.colors.border,
    },
    pressed: { backgroundColor: theme.colors.surfaceMuted },
    left: { flex: 1.3, gap: 2 },
    price: { flex: 1, alignItems: 'flex-end' },
    right: { flex: 1.1, alignItems: 'flex-end', gap: 2 },
  }),
);
