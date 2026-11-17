import { createContext, useContext, type ReactNode } from 'react';

export interface ModuleProviderProps<T> {
  readonly value: T;
  readonly children: ReactNode;
}

export function createModuleContext<T>(moduleName: string) {
  const ModuleContext = createContext<T | null>(null);
  ModuleContext.displayName = moduleName;

  function ModuleProvider({ value, children }: ModuleProviderProps<T>) {
    return <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>;
  }

  function useModule(): T {
    const value = useContext(ModuleContext);
    if (value === null) {
      throw new Error(
        `${moduleName} is not available. Provide it in src/app/AppProviders.tsx (or wrap the test tree).`,
      );
    }
    return value;
  }

  return { Provider: ModuleProvider, useModule } as const;
}
