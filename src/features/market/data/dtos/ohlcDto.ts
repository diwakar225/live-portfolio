import { z } from 'zod';

export const OhlcEnvelopeSchema = z.object({
  status: z.string(),
  code: z.number().int().optional(),
  message: z.unknown(),
});

export const OhlcPayloadSchema = z.object({
  data: z.array(z.unknown()),
});

export const OhlcItemSchema = z.object({
  symbol: z.string().min(1),
  ltp: z.number().nullish(),
  open: z.number().nullish(),
  high: z.number().nullish(),
  low: z.number().nullish(),
  prevClose: z.number().nullish(),
  volume: z.number().int().nonnegative().nullish(),
  timeStamp: z.string().nullish(),
});

export type OhlcItemDto = z.infer<typeof OhlcItemSchema>;
