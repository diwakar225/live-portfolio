import { appConfig } from '../appConfig';

describe('appConfig', () => {
  it('points the API at an https base URL with no trailing slash', () => {
    expect(appConfig.api.baseUrl).toMatch(/^https:\/\//);
    expect(appConfig.api.baseUrl).not.toMatch(/\/$/);
  });

  it('uses a request timeout in a usable range', () => {
    expect(appConfig.api.timeoutMs).toBeGreaterThanOrEqual(1_000);
    expect(appConfig.api.timeoutMs).toBeLessThanOrEqual(60_000);
  });
});
