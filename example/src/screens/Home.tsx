import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import SelectionTree from '../components/SelectionTree';
import ResultView from '../components/ResultView';

export type Payload = {
  font: {
    fontFamily: string;
    fontFamilyMode: 'raw' | 'fallback';
  };
  svg: {
    svgType: 'icons' | 'color-icons';
  };
};

export interface SelectionResult<T extends 'font' | 'svg'> {
  type: T;
  payload: Payload[T];
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [selection, setSelection] = useState<SelectionResult<
    keyof Payload
  > | null>(null);

  const handleStart = (
    result: Exclude<SelectionResult<keyof Payload>, null>
  ) => {
    setSelection(result);
    setStarted(true);
  };

  if (started && selection) {
    return <ResultView selection={selection} />;
  }

  return (
    <View style={styles.container}>
      <SelectionTree onStart={handleStart} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
