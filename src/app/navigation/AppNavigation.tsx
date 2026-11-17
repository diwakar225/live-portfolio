import { NavigationContainer, type RouteProp } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { StatusBar } from 'react-native';
import { toNavigationTheme, type RootStackParamList, type TabParamList } from '@/core/navigation';
import { useTheme } from '@/core/theme';
import { PortfolioScreen, StockDetailScreen, TradeSheetScreen } from '@/features/portfolio';
import { WatchlistScreen } from '@/features/watchlist';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

function HomeTabs() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Portfolio" component={PortfolioScreen} options={{ title: 'Portfolio' }} />
      <Tabs.Screen name="Watchlist" component={WatchlistScreen} options={{ title: 'Watchlist' }} />
    </Tabs.Navigator>
  );
}

function stockDetailOptions({ route }: { route: RouteProp<RootStackParamList, 'StockDetail'> }) {
  return { title: route.params.symbol };
}

function tradeSheetOptions({ route }: { route: RouteProp<RootStackParamList, 'TradeSheet'> }) {
  return {
    title:
      route.params.side === 'buy' ? `Buy ${route.params.symbol}` : `Sell ${route.params.symbol}`,
    presentation: 'modal' as const,
  };
}

export function AppNavigation() {
  const theme = useTheme();
  const navigationTheme = useMemo(() => toNavigationTheme(theme), [theme]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <RootStack.Navigator>
        <RootStack.Screen name="Tabs" component={HomeTabs} options={{ headerShown: false }} />
        <RootStack.Screen
          name="StockDetail"
          component={StockDetailScreen}
          options={stockDetailOptions}
        />
        <RootStack.Screen
          name="TradeSheet"
          component={TradeSheetScreen}
          options={tradeSheetOptions}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
