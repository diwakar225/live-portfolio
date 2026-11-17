import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { createThemedStyles } from '@/core/theme';
import { AppText } from '@/shared/components';
import type { FeedStatusStore } from '../store/feedStatusStore';
import { useFeedStatus } from '../store/useMarketStores';

export interface PausedBannerProps {
  readonly store: FeedStatusStore;
}

function PausedBannerComponent({ store }: PausedBannerProps) {
  const status = useFeedStatus(store);
  const styles = useStyles();

  if (status === 'live') {
    return null;
  }

  const label =
    status === 'paused'
      ? 'Prices paused — waiting for the feed'
      : status === 'disconnected'
      ? 'Price feed disconnected'
      : 'Connecting to the price feed…';

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={styles.banner}
      testID="paused-banner">
      <View style={styles.dot} />
      <AppText variant="caption" tone="warning">
        {label}
      </AppText>
    </View>
  );
}

export const PausedBanner = memo(PausedBannerComponent);

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.warningSurface,
      borderBottomWidth: theme.sizes.hairline,
      borderBottomColor: theme.colors.border,
    },
    dot: {
      width: theme.spacing.sm,
      height: theme.spacing.sm,
      borderRadius: theme.radii.pill,
      backgroundColor: theme.colors.warning,
    },
  }),
);
