import { createStore, type StoreApi } from 'zustand/vanilla';

export type FeedStatus = 'idle' | 'live' | 'paused' | 'disconnected';

export interface FeedStatusState {
  readonly status: FeedStatus;
  readonly setStatus: (status: FeedStatus) => void;
}

export type FeedStatusStore = StoreApi<FeedStatusState>;

export function createFeedStatusStore(): FeedStatusStore {
  return createStore<FeedStatusState>()(set => ({
    status: 'idle',
    setStatus: status => set(state => (state.status === status ? state : { status })),
  }));
}
