import { View, Text } from 'react-native';
import { useNavigationCounter } from '../hooks/useNavigationCounter';
import type { CounterResult } from '../contexts/DebugContext';
import type { getSharedStyles } from '../screens/sharedStyles';

type SharedStyles = ReturnType<typeof getSharedStyles>;

type Props = {
  counter?: CounterResult | null;
  counterId?: string;
  styles: SharedStyles;
};

export function NavigationDebugInfo({ counter, counterId, styles }: Props) {
  const derivedCounter = useNavigationCounter(
    counterId ?? 'debugNavigationStarted'
  );
  const resolvedCounter = counter ?? (counterId ? derivedCounter : null);

  if (!resolvedCounter) {
    return null;
  }

  const layoutText =
    resolvedCounter.useLayoutEffectTime !== null
      ? `${resolvedCounter.useLayoutEffectTime.toFixed(1)}ms`
      : '...';
  const effectText =
    resolvedCounter.useEffectTime !== null
      ? `${resolvedCounter.useEffectTime.toFixed(1)}ms`
      : '...';

  return (
    <View style={styles.debugSection}>
      <Text style={styles.debugTitle}>Render</Text>
      <View style={styles.counterItem}>
        <Text style={styles.counterId}>{resolvedCounter.id}</Text>
        <Text style={styles.counterText}>layout: {layoutText}</Text>
        <Text style={styles.counterText}>effect: {effectText}</Text>
      </View>
    </View>
  );
}
