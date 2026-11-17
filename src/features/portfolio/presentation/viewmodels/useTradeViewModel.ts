import { useCallback, useMemo, useState } from 'react';
import { paise, type Paise } from '@/core/kernel';
import { useMarketModule, useQuote } from '@/features/market';
import type { OrderSide } from '../../domain/entities/Order';
import { validateOrder } from '../../domain/usecases/validateOrder';
import { usePortfolioModule } from '../PortfolioModuleContext';
import { useHolding } from '../store/holdingsStore';

export interface TradeViewModel {
  readonly side: OrderSide;
  readonly setSide: (side: OrderSide) => void;
  readonly rawQuantity: string;
  readonly setRawQuantity: (value: string) => void;
  readonly heldQuantity: number;
  readonly lastPrice: Paise | null;
  readonly estimatedValue: Paise | null;
  readonly error: string | null;
  readonly canConfirm: boolean;
  readonly confirm: () => void;
}

export interface TradeOptions {
  readonly symbol: string;
  readonly initialSide: OrderSide;
  readonly onFilled: () => void;
}

export function useTradeViewModel({ symbol, initialSide, onFilled }: TradeOptions): TradeViewModel {
  const market = useMarketModule();
  const portfolio = usePortfolioModule();
  const quote = useQuote(market.quoteStore, symbol);
  const holding = useHolding(portfolio.holdingsStore, symbol);

  const [side, setSide] = useState<OrderSide>(initialSide);
  const [rawQuantity, setRawQuantity] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const lastPrice = quote?.ltp ?? null;
  const heldQuantity = holding?.quantity ?? 0;

  const validation = useMemo(
    () =>
      validateOrder(rawQuantity, {
        side,
        heldQuantity,
        hasLivePrice: lastPrice !== null,
      }),
    [rawQuantity, side, heldQuantity, lastPrice],
  );

  const estimatedValue = useMemo(() => {
    if (!validation.ok || lastPrice === null) {
      return null;
    }
    return paise(validation.value * lastPrice);
  }, [validation, lastPrice]);

  const handleSetSide = useCallback((next: OrderSide) => {
    setSide(next);
    setSubmitError(null);
  }, []);

  const handleSetRawQuantity = useCallback((value: string) => {
    setRawQuantity(value);
    setSubmitError(null);
  }, []);

  const confirm = useCallback(() => {
    const result = portfolio.submitOrder({ symbol, side, rawQuantity });
    if (result.ok) {
      onFilled();
      return;
    }
    setSubmitError(result.error.message);
  }, [portfolio, symbol, side, rawQuantity, onFilled]);

  const validationError =
    validation.ok || rawQuantity.trim() === '' ? null : validation.error.message;

  return useMemo(
    () => ({
      side,
      setSide: handleSetSide,
      rawQuantity,
      setRawQuantity: handleSetRawQuantity,
      heldQuantity,
      lastPrice,
      estimatedValue,
      error: submitError ?? validationError,
      canConfirm: validation.ok,
      confirm,
    }),
    [
      side,
      handleSetSide,
      rawQuantity,
      handleSetRawQuantity,
      heldQuantity,
      lastPrice,
      estimatedValue,
      submitError,
      validationError,
      validation.ok,
      confirm,
    ],
  );
}
