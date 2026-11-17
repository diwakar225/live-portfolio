import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import {
  calculateDayChange,
  PausedBanner,
  TickChart,
  useMarketModule,
  useQuote,
  useTickHistory,
} from '@/features/market';
import type { RootStackParamList } from '@/core/navigation';
import { createThemedStyles } from '@/core/theme';
import {
  AppText,
  Button,
  Card,
  MoneyText,
  PercentText,
  PriceFlash,
  Screen,
} from '@/shared/components';
import { formatVolume, MISSING_VALUE } from '@/shared/format';
import { calculatePosition } from '../../domain/usecases/calculatePosition';
import { usePortfolioModule } from '../PortfolioModuleContext';
import { useHolding } from '../store/holdingsStore';

interface StatProps {
  readonly label: string;
  readonly children: React.ReactNode;
}

function Stat({ label, children }: StatProps) {
  const styles = useStyles();
  return (
    <View style={styles.stat}>
      <AppText variant="label" tone="muted">
        {label.toUpperCase()}
      </AppText>
      <View style={styles.statValue}>{children}</View>
    </View>
  );
}

/**
 * One stock, live.
 *
 * It lives in the portfolio feature because it shows both the price (from
 * market) and the user's position (from portfolio), and portfolio is the
 * feature allowed to depend on market. It is reached by route name, so the
 * watchlist can open it without importing anything from here.
 */
export function StockDetailScreen() {
  const styles = useStyles();
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'StockDetail'>>();
  const { symbol } = params;

  const market = useMarketModule();
  const portfolio = usePortfolioModule();
  const quote = useQuote(market.quoteStore, symbol);
  const holding = useHolding(portfolio.holdingsStore, symbol);
  const points = useTickHistory(quote?.ltp ?? null);

  const change = useMemo(() => calculateDayChange(quote), [quote]);
  const position = useMemo(
    () => (holding === undefined ? null : calculatePosition(holding, quote)),
    [holding, quote],
  );

  const hasPrice = quote?.ltp != null;
  const held = holding?.quantity ?? 0;

  const handleBuy = useCallback(() => {
    navigation.navigate('TradeSheet', { symbol, side: 'buy' });
  }, [navigation, symbol]);

  const handleSell = useCallback(() => {
    navigation.navigate('TradeSheet', { symbol, side: 'sell' });
  }, [navigation, symbol]);

  return (
    <Screen testID="stock-detail-screen">
      <PausedBanner store={market.feedStatusStore} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <AppText variant="heading">{symbol}</AppText>
          <PriceFlash value={quote?.ltp ?? null} style={styles.price}>
            <MoneyText value={quote?.ltp ?? null} variant="title" />
          </PriceFlash>
          <View style={styles.changeRow}>
            <MoneyText value={change.amount} variant="bodyStrong" colorBySign signed />
            <PercentText value={change.percent} variant="bodyStrong" />
          </View>
        </Card>

        <Card>
          <AppText variant="label" tone="muted">
            TICKS SINCE OPENING THIS SCREEN
          </AppText>
          <View style={styles.chart}>
            <TickChart points={points} baseline={quote?.prevClose ?? null} />
          </View>
          <AppText variant="caption" tone="muted">
            {points.length === 0
              ? 'The dashed line marks the previous close.'
              : `${points.length} ${
                  points.length === 1 ? 'tick' : 'ticks'
                } · dashed line is the previous close`}
          </AppText>
        </Card>

        <Card>
          <View style={styles.statGrid}>
            <Stat label="Open">
              <MoneyText value={quote?.open ?? null} variant="bodyStrong" />
            </Stat>
            <Stat label="High">
              <MoneyText value={quote?.high ?? null} variant="bodyStrong" />
            </Stat>
            <Stat label="Low">
              <MoneyText value={quote?.low ?? null} variant="bodyStrong" />
            </Stat>
            <Stat label="Prev close">
              <MoneyText value={quote?.prevClose ?? null} variant="bodyStrong" />
            </Stat>
            <Stat label="Volume">
              <AppText variant="bodyStrong" numeric>
                {formatVolume(quote?.volume ?? null)}
              </AppText>
            </Stat>
          </View>
        </Card>

        {position === null ? null : (
          <Card testID="position-card">
            <AppText variant="label" tone="muted">
              YOUR POSITION
            </AppText>
            <View style={styles.statGrid}>
              <Stat label="Quantity">
                <AppText variant="bodyStrong" numeric>
                  {String(position.quantity)}
                </AppText>
              </Stat>
              <Stat label="Average">
                <MoneyText value={position.averagePrice} variant="bodyStrong" />
              </Stat>
              <Stat label="Invested">
                <MoneyText value={position.costBasis} variant="bodyStrong" />
              </Stat>
              <Stat label="Value">
                <MoneyText value={position.marketValue} variant="bodyStrong" />
              </Stat>
              <Stat label="Total P&L">
                <MoneyText value={position.totalPnl} variant="bodyStrong" colorBySign signed />
                <PercentText value={position.totalPnlPercent} variant="caption" />
              </Stat>
              <Stat label="Today's P&L">
                <MoneyText value={position.dayPnl} variant="bodyStrong" colorBySign signed />
                <PercentText value={position.dayPnlPercent} variant="caption" />
              </Stat>
            </View>
          </Card>
        )}

        {hasPrice ? null : (
          <Card>
            <AppText variant="caption" tone="warning">
              {`No price is available for ${symbol}, so it shows ${MISSING_VALUE} and is left out of your portfolio totals. Trading is disabled until a price arrives.`}
            </AppText>
          </Card>
        )}

        <View style={styles.actions}>
          <View style={styles.action}>
            <Button label="Buy" onPress={handleBuy} disabled={!hasPrice} testID="detail-buy" />
          </View>
          <View style={styles.action}>
            <Button
              label="Sell"
              variant="secondary"
              onPress={handleSell}
              disabled={!hasPrice || held === 0}
              testID="detail-sell"
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    content: { padding: theme.spacing.lg, gap: theme.spacing.lg },
    price: {
      marginTop: theme.spacing.xxs,
      alignSelf: 'flex-start',
      alignItems: 'flex-start',
    },
    changeRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.xxs },
    chart: { marginVertical: theme.spacing.md },
    statGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.sm,
      rowGap: theme.spacing.md,
    },
    stat: { width: '33.33%', paddingRight: theme.spacing.sm },
    statValue: { marginTop: theme.spacing.xxs, gap: 2 },
    actions: { flexDirection: 'row', gap: theme.spacing.md },
    action: { flex: 1 },
  }),
);
