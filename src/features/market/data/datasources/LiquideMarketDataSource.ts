import { appError, err, ok, type Result } from '@/core/kernel';
import type { Logger } from '@/core/logging';
import { parseResponse, type HttpClient } from '@/core/network';
import {
  OhlcEnvelopeSchema,
  OhlcItemSchema,
  OhlcPayloadSchema,
  type OhlcItemDto,
} from '../dtos/ohlcDto';

const OHLC_PATH = '/markets/ohlc';

export class LiquideMarketDataSource {
  constructor(private readonly http: HttpClient, private readonly logger: Logger) {}

  async fetchOhlc(symbols: readonly string[]): Promise<Result<readonly OhlcItemDto[]>> {
    const response = await this.http.post(OHLC_PATH, { symbols });
    if (!response.ok) {
      return response;
    }

    const envelope = parseResponse(OhlcEnvelopeSchema, response.value);
    if (!envelope.ok) {
      return envelope;
    }
    if (envelope.value.status !== 'success') {
      return err(
        appError('http', `Market data request returned status "${envelope.value.status}"`, {
          status: envelope.value.code,
        }),
      );
    }

    const payload = parseResponse(OhlcPayloadSchema, envelope.value.message);
    if (!payload.ok) {
      return payload;
    }

    const items: OhlcItemDto[] = [];
    for (const raw of payload.value.data) {
      const item = OhlcItemSchema.safeParse(raw);
      if (item.success) {
        items.push(item.data);
      } else {
        this.logger.warn('Dropped malformed OHLC item', { issues: item.error.issues.length });
      }
    }
    return ok(items);
  }
}
