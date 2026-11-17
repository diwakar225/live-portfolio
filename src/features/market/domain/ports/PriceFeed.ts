import type { PriceTick } from '../entities/Tick';

export type TickHandler = (tick: PriceTick) => void;
export type Unsubscribe = () => void;

export interface PriceFeed {
  connect(): void;
  disconnect(): void;
  onTick(handler: TickHandler): Unsubscribe;
}
