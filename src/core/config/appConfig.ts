export const APP_ENVIRONMENTS = ['development', 'staging', 'production'] as const;
export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

export interface AppConfig {
  readonly env: AppEnvironment;
  readonly api: {
    readonly baseUrl: string;
    readonly timeoutMs: number;
  };
}

export const appConfig: AppConfig = {
  env: __DEV__ ? 'development' : 'production',
  api: {
    baseUrl: 'https://api.v2.liquide.life/api',
    timeoutMs: 10_000,
  },
};
