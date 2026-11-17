import type { RootStackParamList } from '@/core/navigation';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
