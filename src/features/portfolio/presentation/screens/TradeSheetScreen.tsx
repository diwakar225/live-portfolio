import { useCallback, useLayoutEffect } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/core/navigation';
import { createThemedStyles, useTheme } from '@/core/theme';
import {
  AppText,
  Button,
  Card,
  MoneyText,
  Screen,
  SegmentedControl,
  type SegmentOption,
} from '@/shared/components';
import type { OrderSide } from '../../domain/entities/Order';
import { useTradeViewModel } from '../viewmodels/useTradeViewModel';

const SIDE_OPTIONS: readonly SegmentOption<OrderSide>[] = [
  { value: 'buy', label: 'Buy' },
  { value: 'sell', label: 'Sell' },
];

export function TradeSheetScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'TradeSheet'>>();
  const { symbol, side } = params;

  const handleFilled = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const viewModel = useTradeViewModel({ symbol, initialSide: side, onFilled: handleFilled });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${viewModel.side === 'buy' ? 'Buy' : 'Sell'} ${symbol}`,
    });
  }, [navigation, viewModel.side, symbol]);

  return (
    <Screen edges={['left', 'right', 'bottom']} testID="trade-sheet">
      <View style={styles.content}>
        <AppText variant="heading">{symbol}</AppText>

        <SegmentedControl
          options={SIDE_OPTIONS}
          value={viewModel.side}
          onChange={viewModel.setSide}
          testID="trade-side"
        />

        <Card>
          <View style={styles.row}>
            <AppText tone="secondary">Live price</AppText>
            <MoneyText value={viewModel.lastPrice} variant="bodyStrong" />
          </View>
          <View style={styles.row}>
            <AppText tone="secondary">You hold</AppText>
            <AppText variant="bodyStrong" numeric>
              {`${viewModel.heldQuantity}`}
            </AppText>
          </View>
        </Card>

        <View style={styles.field}>
          <AppText variant="label" tone="muted">
            QUANTITY
          </AppText>
          <TextInput
            accessibilityLabel="Quantity"
            autoFocus
            keyboardType="number-pad"
            onChangeText={viewModel.setRawQuantity}
            placeholder="0"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            testID="trade-quantity"
            value={viewModel.rawQuantity}
          />
        </View>

        <Card>
          <View style={styles.row}>
            <AppText tone="secondary">Estimated value</AppText>
            <MoneyText value={viewModel.estimatedValue} variant="bodyStrong" />
          </View>
        </Card>

        {viewModel.error === null ? null : (
          <AppText tone="danger" variant="caption" testID="trade-error">
            {viewModel.error}
          </AppText>
        )}

        <View style={styles.actions}>
          <Button
            label={viewModel.side === 'buy' ? 'Confirm buy' : 'Confirm sell'}
            onPress={viewModel.confirm}
            disabled={!viewModel.canConfirm}
            testID="trade-confirm"
          />
          <AppText variant="caption" tone="muted" style={styles.disclaimer}>
            Orders are simulated locally and fill at the last price. No real order is placed.
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    content: { padding: theme.spacing.lg, gap: theme.spacing.lg },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    field: { gap: theme.spacing.xs },
    input: {
      minHeight: theme.sizes.minTouchTarget,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radii.md,
      borderWidth: theme.sizes.hairline,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      color: theme.colors.textPrimary,
      ...theme.typography.title,
    },
    actions: { gap: theme.spacing.sm },
    disclaimer: { textAlign: 'center' },
  }),
);
