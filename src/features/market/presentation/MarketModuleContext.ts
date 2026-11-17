import { createModuleContext } from '@/core/di';
import type { MarketModule } from '../MarketModule';

export const { Provider: MarketModuleProvider, useModule: useMarketModule } =
  createModuleContext<MarketModule>('MarketModule');
