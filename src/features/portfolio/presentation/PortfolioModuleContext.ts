import { createModuleContext } from '@/core/di';
import type { PortfolioModule } from '../PortfolioModule';

export const { Provider: PortfolioModuleProvider, useModule: usePortfolioModule } =
  createModuleContext<PortfolioModule>('PortfolioModule');
