import { createModuleContext } from '@/core/di';
import type { WatchlistModule } from '../WatchlistModule';

export const { Provider: WatchlistModuleProvider, useModule: useWatchlistModule } =
  createModuleContext<WatchlistModule>('WatchlistModule');
