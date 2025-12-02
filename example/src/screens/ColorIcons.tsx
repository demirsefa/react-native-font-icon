import { useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useDebugContext } from '../contexts/DebugContext';

export default function ColorIcons() {
  const { counters, updateCounter } = useDebugContext();

  // Measure useLayoutEffect timing for navigation counter
  useLayoutEffect(() => {
    const navCounter = counters.find(
      (c) => c.id === 'debugNavigationStarted-ColorIcons'
    );
    if (navCounter && navCounter.useLayoutEffectTime === null) {
      const time = performance.now() - navCounter.startTime;
      updateCounter(navCounter.id, { useLayoutEffectTime: time });
    }
  }, [counters, updateCounter]);

  // Measure useEffect timing for navigation counter
  useEffect(() => {
    const navCounter = counters.find(
      (c) => c.id === 'debugNavigationStarted-ColorIcons'
    );
    if (navCounter && navCounter.useEffectTime === null) {
      const time = performance.now() - navCounter.startTime;
      updateCounter(navCounter.id, { useEffectTime: time });
    }
  }, [counters, updateCounter]);

  const navCounter = counters.find(
    (c) => c.id === 'debugNavigationStarted-ColorIcons'
  );

  return (
    <ScrollView style={styles.container}>
      {navCounter && (
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>Sayfa Render Hızı</Text>
          <View style={styles.counterItem}>
            <Text style={styles.counterId}>{navCounter.id}</Text>
            <Text style={styles.counterText}>
              useLayoutEffect:{' '}
              {navCounter.useLayoutEffectTime !== null
                ? `${navCounter.useLayoutEffectTime.toFixed(2)}ms`
                : 'ölçülüyor...'}
            </Text>
            <Text style={styles.counterText}>
              useEffect:{' '}
              {navCounter.useEffectTime !== null
                ? `${navCounter.useEffectTime.toFixed(2)}ms`
                : 'ölçülüyor...'}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>Color Icons</Text>
        <Text style={styles.subtitle}>
          This screen is ready for future examples.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  debugSection: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  counterItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  counterId: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  counterText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
