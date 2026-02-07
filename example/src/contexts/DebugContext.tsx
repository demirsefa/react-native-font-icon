import { createContext, useContext, type ReactNode } from 'react';

type DebugContextType = {
  // Add debug properties here if needed
};

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: ReactNode }) {
  return <DebugContext.Provider value={{}}>{children}</DebugContext.Provider>;
}

export function useDebugContext(): DebugContextType {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebugContext must be used within a DebugProvider');
  }
  return context;
}
