import { memo, type ReactNode } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import { useResponsive } from '@/core/layout';
import type { Paise } from '@/core/kernel';
import { createThemedStyles } from '@/core/theme';
import { AppText, Card, MoneyText, PercentText } from '@/shared/components';
import type { PortfolioSummary } from '../../domain/entities/Position';

export interface SummaryCardProps {
  readonly summary: PortfolioSummary;
}

interface MetricProps {
  readonly label: string;
  readonly width: DimensionValue;
  readonly children: ReactNode;
}

function Metric({ label, width, children }: MetricProps) {
  const styles = useStyles();
  return (
    <View style={[styles.metric, { width }]}>
      <AppText variant="label" tone="muted">
        {label.toUpperCase()}
      </AppText>
      <View style={styles.metricValue}>{children}</View>
    </View>
  );
}

interface MoneyMetricProps {
  readonly label: string;
  readonly amount: Paise | null;
  readonly percent?: number | null;
  readonly colorBySign?: boolean;
  readonly width: DimensionValue;
}

function MoneyMetric({ label, amount, percent, colorBySign = false, width }: MoneyMetricProps) {
  return (
    <Metric label={label} width={width}>
      <MoneyText
        value={amount}
        variant="bodyStrong"
        colorBySign={colorBySign}
        signed={colorBySign}
      />
      {percent === undefined ? null : (
        <PercentText value={percent} variant="caption" colorBySign={colorBySign} />
      )}
    </Metric>
  );
}

function SummaryCardComponent({ summary }: SummaryCardProps) {
  const styles = useStyles();
  const { breakpoint } = useResponsive();
  const width: DimensionValue = breakpoint === 'compact' ? '50%' : '25%';
  const unpricedCount = summary.unpricedSymbols.length;

  return (
    <Card testID="summary-card">
      <AppText variant="label" tone="muted">
        CURRENT VALUE
      </AppText>
      <MoneyText value={summary.currentValue} variant="title" style={styles.headline} />

      <View style={styles.metrics}>
        <MoneyMetric label="Invested" amount={summary.invested} width={width} />
        <MoneyMetric
          label="Total P&L"
          amount={summary.totalPnl}
          percent={summary.totalPnlPercent}
          colorBySign
          width={width}
        />
        <MoneyMetric
          label="Today's P&L"
          amount={summary.dayPnl}
          percent={summary.dayPnlPercent}
          colorBySign
          width={width}
        />
        <Metric label="Holdings" width={width}>
          <AppText variant="bodyStrong" numeric>
            {summary.holdingsCount === 0 ? '--' : String(summary.holdingsCount)}
          </AppText>
          <AppText variant="caption" tone="secondary">
            {`${summary.pricedCount} priced`}
          </AppText>
        </Metric>
      </View>

      {unpricedCount > 0 ? (
        <View style={styles.notice} testID="summary-unpriced-notice">
          <AppText variant="caption" tone="warning">
            {`${unpricedCount} of ${
              summary.holdingsCount
            } holdings have no price (${summary.unpricedSymbols.join(
              ', ',
            )}). They are left out of these totals rather than counted as zero.`}
          </AppText>
        </View>
      ) : null}
    </Card>
  );
}

export const SummaryCard = memo(SummaryCardComponent);

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    headline: { marginTop: theme.spacing.xxs },
    metrics: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.lg,
      rowGap: theme.spacing.md,
    },
    metric: { paddingRight: theme.spacing.sm },
    metricValue: { marginTop: theme.spacing.xxs, gap: 2 },
    notice: {
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: theme.sizes.hairline,
      borderTopColor: theme.colors.border,
    },
  }),
);
