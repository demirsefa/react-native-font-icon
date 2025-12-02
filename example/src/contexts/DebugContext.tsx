import React, { createContext, useContext, useState, useCallback } from 'react';

export interface CounterResult {
  id: string;
  useEffectTime: number | null;
  useLayoutEffectTime: number | null;
  startTime: number;
}

interface DebugContextType {
  counters: CounterResult[];
  startCounter: (id: string) => void;
  updateCounter: (id: string, updates: Partial<CounterResult>) => void;
  clearCounters: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [counters, setCounters] = useState<CounterResult[]>([]);

  const startCounter = useCallback((id: string) => {
    const startTime = performance.now();
    const newCounter: CounterResult = {
      id,
      useEffectTime: null,
      useLayoutEffectTime: null,
      startTime,
    };

    setCounters((prev) => [...prev, newCounter]);
  }, []);

  const updateCounter = useCallback(
    (id: string, updates: Partial<CounterResult>) => {
      setCounters((prev) =>
        prev.map((counter) =>
          counter.id === id ? { ...counter, ...updates } : counter
        )
      );
    },
    []
  );

  const clearCounters = useCallback(() => {
    setCounters([]);
  }, []);

  return (
    <DebugContext.Provider
      value={{
        counters,
        startCounter,
        updateCounter,
        clearCounters,
      }}
    >
      {children}
    </DebugContext.Provider>
  );
}

export function useDebugContext() {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebugContext must be used within a DebugProvider');
  }
  return context;
}
