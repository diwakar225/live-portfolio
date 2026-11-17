export type TabParamList = {
  Portfolio: undefined;
  Watchlist: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  StockDetail: { symbol: string };
  TradeSheet: { symbol: string; side: 'buy' | 'sell' };
};

export type RootRouteName = keyof RootStackParamList;
export type TabRouteName = keyof TabParamList;
