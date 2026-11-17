import { memo, useCallback } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { useMarketModule, useQuote } from '@/features/market';
import { createThemedStyles } from '@/core/theme';
import { AppText, Button, EmptyState, MoneyText } from '@/shared/components';

export interface SymbolPickerProps {
  readonly visible: boolean;
  readonly symbols: readonly string[];
  readonly onSelect: (symbol: string) => void;
  readonly onClose: () => void;
}

interface OptionProps {
  readonly symbol: string;
  readonly onSelect: (symbol: string) => void;
}

function Option({ symbol, onSelect }: OptionProps) {
  const styles = useStyles();
  const { quoteStore } = useMarketModule();
  const quote = useQuote(quoteStore, symbol);
  const handlePress = useCallback(() => onSelect(symbol), [onSelect, symbol]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      style={({ pressed }) => [styles.option, pressed && styles.pressed]}
      testID={`symbol-option-${symbol}`}>
      <AppText variant="bodyStrong">{symbol}</AppText>
      <MoneyText value={quote?.ltp ?? null} />
    </Pressable>
  );
}

const keyExtractor = (symbol: string): string => symbol;

/** Picks from the app's symbol universe; already-added symbols are not listed. */
function SymbolPickerComponent({ visible, symbols, onSelect, onClose }: SymbolPickerProps) {
  const styles = useStyles();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<string>) => <Option symbol={item} onSelect={onSelect} />,
    [onSelect],
  );

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      visible={visible}>
      <View style={styles.sheet}>
        <AppText variant="heading" style={styles.title}>
          Add a symbol
        </AppText>
        <FlatList
          data={symbols}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={
            <EmptyState
              title="Nothing left to add"
              message="Every available symbol is already on your watchlist."
            />
          }
          contentContainerStyle={styles.list}
        />
        <View style={styles.footer}>
          <Button label="Close" variant="secondary" onPress={onClose} testID="picker-close" />
        </View>
      </View>
    </Modal>
  );
}

export const SymbolPicker = memo(SymbolPickerComponent);

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    sheet: { flex: 1, backgroundColor: theme.colors.background, paddingTop: theme.spacing.xl },
    title: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md },
    list: { paddingBottom: theme.spacing.xl, flexGrow: 1 },
    option: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: theme.sizes.rowMinHeight,
      paddingHorizontal: theme.spacing.lg,
      borderBottomWidth: theme.sizes.hairline,
      borderBottomColor: theme.colors.border,
    },
    pressed: { backgroundColor: theme.colors.surfaceMuted },
    footer: { padding: theme.spacing.lg },
  }),
);
