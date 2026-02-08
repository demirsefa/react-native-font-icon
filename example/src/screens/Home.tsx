import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import SelectionTree from '../components/SelectionTree';
import ResultView from '../components/ResultView';
import { useDebugContext } from '../contexts/DebugContext';

export type Payload = {
  font: {
    fontFamily: string;
    count: number;
  };
  svg: {
    svgType: 'icons' | 'color-icons';
    count: number;
  };
};

export interface SelectionResult<T extends 'font' | 'svg'> {
  type: T;
  payload: Payload[T];
}

export default function Home() {
  const { started, start, recordsCount, shareAllCsv, clearAll } =
    useDebugContext();
  const [selection, setSelection] = useState<SelectionResult<
    keyof Payload
  > | null>(null);

  const handleStart = (
    result: Exclude<SelectionResult<keyof Payload>, null>
  ) => {
    start(result);
    setSelection(result);
  };

  if (started && selection) {
    return (
      <ResultView selection={selection} onFinished={() => setSelection(null)} />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.downloadsCard}>
          <View style={styles.downloadsHeader}>
            <Text style={styles.downloadsTitle}>Downloads</Text>
            <Text style={styles.downloadsMeta}>{recordsCount} records</Text>
          </View>
          <View style={styles.downloadsButtonsRow}>
            <TouchableOpacity
              style={[
                styles.downloadsButton,
                recordsCount === 0 ? styles.downloadsButtonDisabled : null,
              ]}
              disabled={recordsCount === 0}
              onPress={shareAllCsv}
            >
              <Text style={styles.downloadsButtonText}>Download CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.downloadsButton,
                styles.clearButton,
                recordsCount === 0 ? styles.downloadsButtonDisabled : null,
              ]}
              disabled={recordsCount === 0}
              onPress={clearAll}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
        <SelectionTree onStart={handleStart} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // SafeAreaView iOS'ta yeterli; Android için basit fallback
    paddingTop: Platform.OS === 'android' ? 50 : 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'stretch',
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 16,
  },
  downloadsCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    padding: 12,
    gap: 10,
  },
  downloadsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  downloadsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
  },
  downloadsMeta: {
    fontSize: 12,
    color: '#666666',
  },
  downloadsButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  downloadsButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1e88e5',
    alignItems: 'center',
  },
  downloadsButtonDisabled: {
    opacity: 0.4,
  },
  downloadsButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  clearButton: {
    backgroundColor: '#eeeeee',
  },
  clearButtonText: {
    color: '#333333',
    fontWeight: '700',
  },
});
