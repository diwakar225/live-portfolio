export interface TokenStore {
  getAccessToken(): Promise<string | null>;
  setAccessToken(token: string | null): Promise<void>;
}

export function createInMemoryTokenStore(initialToken: string | null = null): TokenStore {
  let token = initialToken;
  return {
    getAccessToken: () => Promise.resolve(token),
    setAccessToken: next => {
      token = next;
      return Promise.resolve();
    },
  };
}
