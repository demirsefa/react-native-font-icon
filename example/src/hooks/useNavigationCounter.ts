import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useDebugContext } from '../contexts/DebugContext';

export function useNavigationCounter(counterId: string) {
  const { counters, updateCounter } = useDebugContext();

  useLayoutEffect(() => {
    const navCounter = counters.find((counter) => counter.id === counterId);
    if (navCounter && navCounter.useLayoutEffectTime === null) {
      const time = performance.now() - navCounter.startTime;
      updateCounter(navCounter.id, { useLayoutEffectTime: time });
    }
  }, [counterId, counters, updateCounter]);

  useEffect(() => {
    const navCounter = counters.find((counter) => counter.id === counterId);
    if (navCounter && navCounter.useEffectTime === null) {
      const time = performance.now() - navCounter.startTime;
      updateCounter(navCounter.id, { useEffectTime: time });
    }
  }, [counterId, counters, updateCounter]);

  return useMemo(
    () => counters.find((counter) => counter.id === counterId),
    [counterId, counters]
  );
}
